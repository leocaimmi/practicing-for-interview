/* Comandos para leer y buscar:
   cat, less, more, echo, head, tail, wc, sort, uniq, grep, find */

C.cat = (a, io, name) => {
  const { chunks, err } = readSources(a, io.stdin, name || 'cat');
  return { out: chunks.map((c) => c.text).join(''), err: err.join('\n'), code: err.length ? 1 : 0 };
};
C.less = (a, io) => C.cat(a, io, 'less');
C.more = (a, io) => C.cat(a, io, 'more');

C.echo = (a) => {
  let newline = true;
  if (a[0] === '-n') { newline = false; a = a.slice(1); }
  return { out: a.join(' ') + (newline ? '\n' : '') };
};

/* head/tail aceptan -n 5, -n5 y -5 */
function parseCount(args) {
  let n = 10;
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-n') n = parseInt(args[++i], 10);
    else if (/^-n\d+$/.test(a)) n = parseInt(a.slice(2), 10);
    else if (/^-\d+$/.test(a)) n = parseInt(a.slice(1), 10);
    else if (a === '-f') { /* seguir en vivo: sin efecto en el simulador */ }
    else rest.push(a);
  }
  return { n: isNaN(n) ? 10 : n, rest };
}
function headTail(a, io, fromEnd) {
  const cmd = fromEnd ? 'tail' : 'head';
  const { n, rest } = parseCount(a);
  const { chunks, err } = readSources(rest, io.stdin, cmd);
  const out = chunks.map((c) => {
    const L = splitLines(c.text);
    const sel = fromEnd ? (n ? L.slice(-n) : []) : L.slice(0, n);
    return (chunks.length > 1 ? `==> ${c.name} <==\n` : '') + sel.map((x) => x + '\n').join('');
  }).join(chunks.length > 1 ? '\n' : '');
  return { out, err: err.join('\n'), code: err.length ? 1 : 0 };
}
C.head = (a, io) => headTail(a, io, false);
C.tail = (a, io) => headTail(a, io, true);

C.wc = (a, io) => {
  const { f, rest } = parseFlags(a);
  const { chunks, err } = readSources(rest, io.stdin, 'wc');
  const sel = f.size ? ['l', 'w', 'c'].filter((x) => f.has(x)) : ['l', 'w', 'c'];
  const total = { l: 0, w: 0, c: 0 };
  const out = chunks.map((c) => {
    const v = { l: (c.text.match(/\n/g) || []).length, w: c.text.split(/\s+/).filter(Boolean).length, c: byteLength(c.text) };
    total.l += v.l; total.w += v.w; total.c += v.c;
    return sel.map((k) => String(v[k]).padStart(sel.length > 1 ? 3 : 1)).join(' ') + (c.name ? ' ' + c.name : '');
  });
  if (chunks.length > 1) out.push(sel.map((k) => String(total[k]).padStart(3)).join(' ') + ' total');
  return { out: out.join('\n') + (out.length ? '\n' : ''), err: err.join('\n'), code: err.length ? 1 : 0 };
};

C.sort = (a, io) => {
  const { f, rest } = parseFlags(a);
  const { chunks, err } = readSources(rest, io.stdin, 'sort');
  const L = chunks.flatMap((c) => splitLines(c.text));
  L.sort(f.has('n') ? (x, y) => parseFloat(x) - parseFloat(y) : (x, y) => x.localeCompare(y));
  if (f.has('r')) L.reverse();
  return { out: L.map((x) => x + '\n').join(''), err: err.join('\n') };
};

C.uniq = (a, io) => {
  const { chunks } = readSources(a, io.stdin, 'uniq');
  const L = chunks.flatMap((c) => splitLines(c.text)).filter((x, i, arr) => i === 0 || x !== arr[i - 1]);
  return { out: L.map((x) => x + '\n').join('') };
};

/* Resalta coincidencias como hace grep --color */
function highlight(line, re) {
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  let r = '', last = 0;
  for (const m of line.matchAll(g)) {
    if (!m[0]) break;
    r += esc(line.slice(last, m.index)) + '<span class="c-hit">' + esc(m[0]) + '</span>';
    last = m.index + m[0].length;
  }
  return r + esc(line.slice(last));
}

C.grep = (a, io) => {
  const { f, rest } = parseFlags(a);
  if (!rest.length) return { err: 'Usage: grep [OPTION]... PATTERNS [FILE]...', code: 2 };
  const pattern = rest.shift(), flags = f.has('i') ? 'i' : '';
  let re;
  try { re = new RegExp(pattern, flags); } catch (e) { re = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags); }

  const recursive = f.has('r') || f.has('R');
  let files = rest.slice();
  if (!files.length && recursive) files = ['.'];

  const sources = [], err = [];
  if (!files.length) sources.push({ name: null, text: io.stdin || '' });
  for (const t of files) {
    const n = getNode(norm(t));
    if (!n) { err.push(`grep: ${t}: No such file or directory`); continue; }
    if (n.type === 'dir') {
      if (!recursive) { err.push(`grep: ${t}: Is a directory`); continue; }
      (function walk(d, disp) {
        for (const nm of Object.keys(d.children).sort()) {
          const c = d.children[nm];
          const p = (disp === '.' && t === '.' ? './' : disp.replace(/\/$/, '') + '/') + nm;
          if (c.type === 'dir') walk(c, p); else sources.push({ name: p.replace(/^\.\//, ''), text: c.content });
        }
      })(n, t);
    } else sources.push({ name: t, text: n.content });
  }

  const showName = recursive || sources.length > 1, tty = io.tty, out = [];
  let total = 0;
  for (const s of sources) {
    let count = 0;
    splitLines(s.text).forEach((ln, i) => {
      if (re.test(ln) === f.has('v')) return;
      count++; total++;
      if (f.has('c') || f.has('l')) return;
      let pre = '';
      if (showName) pre += tty ? '<span class="c-file">' + esc(s.name) + '</span>:' : s.name + ':';
      if (f.has('n')) pre += tty ? '<span class="c-num">' + (i + 1) + '</span>:' : (i + 1) + ':';
      out.push(pre + (tty && !f.has('v') ? highlight(ln, re) : (tty ? esc(ln) : ln)));
    });
    if (f.has('c')) out.push((showName ? (tty ? esc(s.name) : s.name) + ':' : '') + count);
    if (f.has('l') && count) out.push(tty ? esc(s.name) : s.name);
  }
  return { out: out.length ? out.join('\n') + '\n' : '', html: tty, err: err.join('\n'), code: err.length ? 2 : (total ? 0 : 1) };
};

C.find = (a, io) => {
  const paths = [];
  let i = 0;
  while (i < a.length && !a[i].startsWith('-')) paths.push(a[i++]);
  if (!paths.length) paths.push('.');

  const preds = [];
  for (; i < a.length; i++) {
    const p = a[i];
    if (p === '-name' || p === '-iname') {
      const v = a[++i];
      if (v === undefined) return { err: `find: missing argument to '${p}'`, code: 1 };
      const insensitive = p === '-iname', r = globToRegex(insensitive ? v.toLowerCase() : v);
      preds.push((nm) => r.test(insensitive ? nm.toLowerCase() : nm));
    } else if (p === '-type') {
      const v = a[++i];
      if (v !== 'f' && v !== 'd') return { err: `find: Unknown argument to -type: ${v}`, code: 1 };
      preds.push((nm, n) => (v === 'd') === (n.type === 'dir'));
    } else return { err: `find: unknown predicate '${p}'`, code: 1 };
  }

  const out = [], err = [];
  for (const start of paths) {
    const n = getNode(norm(start));
    if (!n) { err.push(`find: '${start}': No such file or directory`); continue; }
    (function walk(node, disp, nm) {
      if (preds.every((fn) => fn(nm, node))) out.push(io.tty ? nameHtml(disp, node, true) : disp);
      if (node.type === 'dir') for (const k of Object.keys(node.children).sort()) walk(node.children[k], disp.replace(/\/$/, '') + '/' + k, k);
    })(n, start, splitPath(norm(start))[1] || '/');
  }
  return { out: out.length ? out.join('\n') + '\n' : '', html: io.tty, err: err.join('\n'), code: err.length ? 1 : 0 };
};
