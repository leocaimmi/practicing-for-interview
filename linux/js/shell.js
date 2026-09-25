/* Motor del shell: ejecución de comandos, pipes, redirecciones, salida en
   pantalla, historial y autocompletado. */

const C = {};                        // registro de comandos: C.ls = (args, io) => result
const NEEDS_INSTALL = { curl: 1 };   // comandos que existen recién después de apt install

/* ---------- ejecución ---------- */
function exec(argv, io) {
  if (!argv.length) return {};
  const [name, ...args] = argv;

  if (name === 'sudo') {
    if (!args.length) return { err: 'usage: sudo command', code: 1 };
    const was = SUDO; SUDO = true;
    lastRan.push({ name: 'sudo', args, code: 0 });
    try { return exec(args, { ...io, sudo: true }); } finally { SUDO = was; }
  }

  let r;
  if (name.includes('/')) r = runScript(name, io);
  else if (NEEDS_INSTALL[name] && !S.installed.includes(name)) r = { err: `Command '${name}' not found, but can be installed with:\n\nsudo apt install ${name}`, code: 127 };
  else if (!C[name]) r = { err: `${name}: command not found`, code: 127 };
  else { try { r = C[name](args, io) || {}; } catch (e) { r = { err: String(e), code: 1 }; } }

  lastRan.push({ name, args, code: r.code || 0, sudo: !!io.sudo });
  return r;
}

/* ./script.sh: necesita permiso de ejecución; corre línea por línea */
function runScript(path, io) {
  const abs = norm(path), n = getNode(abs);
  if (!n) return { err: `bash: ${path}: No such file or directory`, code: 127 };
  if (n.type === 'dir') return { err: `bash: ${path}: Is a directory`, code: 126 };
  if (!isExecutable(n)) return { err: `bash: ${path}: Permission denied`, code: 126 };
  if (scriptDepth > 3) return { err: 'bash: demasiada recursión', code: 1 };

  scriptDepth++;
  const out = [];
  try {
    for (const ln of n.content.split('\n')) {
      const t = ln.trim();
      if (!t || t.startsWith('#')) continue;
      const argv = tokenize(t).filter((x) => !x.op).map((x) => x.v);
      const r = exec(argv, { stdin: '', tty: false, sudo: io.sudo });
      if (r.out) out.push(r.out.replace(/\n$/, ''));
      if (r.err) out.push(r.err);
    }
  } finally { scriptDepth--; }

  if (abs === HOME + '/deploy.sh') S.flags.script = true;
  return { out: out.length ? out.join('\n') + '\n' : '' };
}

/* Un pipeline: la salida de cada comando es la entrada del siguiente */
function runPipe(pipe) {
  let stdin = '', code = 0;
  for (let idx = 0; idx < pipe.length; idx++) {
    const c = pipe[idx];
    const last = idx === pipe.length - 1;
    const outRedirs = c.redir.filter((r) => r.op !== '<');
    const tty = last && !outRedirs.length; // colores solo si va directo a pantalla

    let input = stdin, bad = false;
    for (const r of c.redir) {
      if (r.op !== '<') continue;
      const n = getNode(norm(r.target));
      if (!n || n.type === 'dir') { printErr(`bash: ${r.target}: No such file or directory`); bad = true; }
      else input = n.content;
    }
    if (bad) { code = 1; stdin = ''; continue; }

    const res = exec(c.argv, { stdin: input, tty, sudo: false });
    if (res.err) printErr(res.err);
    code = res.code || 0;

    let out = res.out || '';
    for (const r of outRedirs) {
      const e = writeFile(r.target, out, r.op === '>>', 'bash');
      if (e) { printErr(e); code = 1; }
      out = '';
    }
    if (last) { if (out) print(out, res.html); } else stdin = out;
  }
  return code;
}

function runLine(line) {
  echoPrompt(esc(line));
  if (line.trim()) S.hist.push(line);
  lastRan = [];
  lastErrs = [];
  let seq;
  try { seq = parseLine(tokenize(line)); }
  catch (e) { printErr(String(e)); S.lastCode = 2; afterRun(); return; }

  let code = S.lastCode;
  for (const { conn, pipe } of seq) {
    if (conn === '&&' && code !== 0) continue;
    if (conn === '||' && code === 0) continue;
    code = runPipe(pipe);
  }
  S.lastCode = code;
  afterRun();
}

function afterRun() {
  updatePrompt();
  if (typeof pathHint === 'function') pathHint();
  if (typeof checkMissions === 'function') checkMissions();
  save();
  scrollDown();
}

/* ---------- salida ---------- */
const outEl = $('#out'), screenEl = $('#screen'), inputEl = $('#cmd');

function ps1() {
  return '<span class="c-user">leo@ubuntu</span>:<span class="c-path">' + esc(tildify(S.cwd)) + '</span>$ ';
}
function updatePrompt() {
  $('#ps1').innerHTML = ps1();
  $('#bartitle').textContent = 'leo@ubuntu: ' + tildify(S.cwd);
}
function addLine(cls, html) {
  const d = document.createElement('div');
  d.className = cls; d.innerHTML = html;
  outEl.appendChild(d);
}
function echoPrompt(cmdHtml) { addLine('p', ps1() + cmdHtml); }
function print(text, isHtml) { text = text.replace(/\n$/, ''); addLine('o', isHtml ? text : esc(text)); }
function printErr(text) { lastErrs.push(text); addLine('e', esc(text)); }
function info(text) { addLine('i', esc(text)); }
function scrollDown() { screenEl.scrollTop = screenEl.scrollHeight; }

/* ---------- teclado, historial y autocompletado ---------- */
let histIdx = null, draft = '';

inputEl.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (e.key === 'Enter') { e.preventDefault(); const v = inputEl.value; inputEl.value = ''; histIdx = null; runLine(v); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); histMove(-1); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); histMove(1); }
  else if (e.key === 'Tab') { e.preventDefault(); complete(); }
  else if (e.ctrlKey && k === 'l') { e.preventDefault(); outEl.innerHTML = ''; }
  else if (e.ctrlKey && k === 'c' && !window.getSelection().toString()) { e.preventDefault(); ctrlC(); }
});

function ctrlC() { echoPrompt(esc(inputEl.value) + '^C'); inputEl.value = ''; histIdx = null; scrollDown(); }

function histMove(d) {
  if (!S.hist.length) return;
  if (histIdx === null) { if (d > 0) return; draft = inputEl.value; histIdx = S.hist.length; }
  histIdx = Math.max(0, Math.min(S.hist.length, histIdx + d));
  inputEl.value = histIdx === S.hist.length ? draft : S.hist[histIdx];
  if (histIdx === S.hist.length) histIdx = null;
  requestAnimationFrame(() => inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length));
}

function complete() {
  const v = inputEl.value;
  const word = /(\S*)$/.exec(v)[1];
  const before = v.slice(0, v.length - word.length);
  const isCommand = !before.trim() || /(\||&&|;|\bsudo)\s*$/.test(before);
  let cands = [];

  if (isCommand && !word.includes('/')) {
    cands = Object.keys(C).filter((x) => x.startsWith(word)).map((x) => x + ' ');
  } else {
    const i = word.lastIndexOf('/'), dirPart = word.slice(0, i + 1), base = word.slice(i + 1);
    const d = getNode(norm(dirPart || '.'));
    if (d && d.type === 'dir') {
      cands = Object.keys(d.children)
        .filter((n) => n.startsWith(base) && (base.startsWith('.') || !n.startsWith('.')))
        .sort()
        .map((n) => dirPart + n + (d.children[n].type === 'dir' ? '/' : ' '));
    }
  }

  if (cands.length === 1) { inputEl.value = before + cands[0]; return; }
  if (cands.length > 1) {
    let prefix = cands[0];
    for (const x of cands) while (!x.startsWith(prefix)) prefix = prefix.slice(0, -1);
    if (prefix.length > word.length) inputEl.value = before + prefix;
    else {
      echoPrompt(esc(v));
      addLine('o', cands.map((x) => esc(x.trim().split('/').filter(Boolean).pop() + (x.endsWith('/') ? '/' : ''))).join('  '));
      scrollDown();
    }
  }
}

screenEl.addEventListener('click', () => { if (!window.getSelection().toString()) inputEl.focus(); });

/* Teclas rápidas en pantallas táctiles */
$('#keys').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.ins) inputEl.value += b.dataset.ins;
  else ({ tab: complete, up: () => histMove(-1), down: () => histMove(1), ctrlc: ctrlC })[b.dataset.key]();
  inputEl.focus();
});
