/* Vista "árbol + terminal": arriba el sistema de archivos dibujado como la estructura de un proyecto
   (dónde estás parado, qué se creó en esta sesión y con qué comando) y abajo la consola, las dos activas.
   Es solo una representación del estado simulado. */

/* ---------- registro de cambios ---------- */

/* Todas las rutas del sistema: '/home/leo/entrevista' → 'd' (carpeta) o 'f' (archivo) */
function listPaths(node = S.fs, abs = '', out = {}) {
  for (const [name, child] of Object.entries(node.children)) {
    const p = abs + '/' + name;
    out[p] = child.type === 'dir' ? 'd' : 'f';
    if (child.type === 'dir') listPaths(child, p, out);
  }
  return out;
}

/* Compara con la foto anterior y anota lo que apareció o desapareció, con el comando que lo causó */
function syncChanges(cmd) {
  S.created = S.created || {};
  S.changes = S.changes || [];
  const now = listPaths();
  if (!S.known) { S.known = now; return; } /* primera vez: foto inicial, sin anotar nada */

  const added = Object.keys(now).filter((p) => !(p in S.known));
  const removed = Object.keys(S.known).filter((p) => !(p in now));
  /* En el historial va solo lo de más arriba: mkdir -p a/b/c se anota como "a" */
  const top = (list) => list.filter((p) => !list.includes(p.slice(0, p.lastIndexOf('/'))));

  added.forEach((p) => { S.created[p] = cmd; });
  removed.forEach((p) => { delete S.created[p]; });
  top(removed).forEach((p) => S.changes.push({ op: '-', path: p, dir: S.known[p] === 'd', cmd }));
  top(added).forEach((p) => S.changes.push({ op: '+', path: p, dir: now[p] === 'd', cmd }));
  S.changes = S.changes.slice(-30);
  S.known = now;
}

/* Lo llaman el shell y nano cada vez que puede haber cambiado algo */
function onFsChange() {
  syncChanges(S.hist[S.hist.length - 1] || '');
  if (!$('#tree').hidden) renderTree();
}

/* ---------- dibujo del árbol ---------- */
const treeOpen = {};  /* carpetas abiertas o cerradas a mano: ruta → true/false */
let treeCwd = null;   /* última carpeta dibujada: si cambia, la línea actual destella */
let moved = '';       /* ' moved' mientras se dibuja después de moverse de carpeta */

function isOpen(abs) {
  if (abs in treeOpen) return treeOpen[abs];
  /* Por defecto: abiertas las del home y las que están en el camino hasta donde estás parado */
  return abs === HOME || abs.startsWith(HOME + '/') || HOME.startsWith(abs + '/') || S.cwd === abs || S.cwd.startsWith(abs + '/');
}

function treeLines(node, abs, prefix, out) {
  const names = Object.keys(node.children)
    .filter((n) => S.treeHidden || !n.startsWith('.'))
    .sort((a, b) => a.localeCompare(b));
  names.forEach((name, i) => {
    const child = node.children[name];
    const p = (abs === '/' ? '' : abs) + '/' + name;
    const last = i === names.length - 1;
    const dir = child.type === 'dir';
    const open = dir && isOpen(p);
    const onPath = S.cwd === p || S.cwd.startsWith(p + '/');
    const count = dir ? Object.keys(child.children).filter((n) => S.treeHidden || !n.startsWith('.')).length : 0;

    let cls = dir ? 't-dir' : isExecutable(child) ? 't-exe' : 't-file';
    if (onPath) cls += ' t-path';
    let html = '<span class="t-pre">' + prefix + (last ? '└── ' : '├── ') + '</span>' +
      '<span class="' + cls + '">' + esc(name) + (dir ? '/' : isExecutable(child) ? '*' : '') + '</span>';
    if (dir && !open && count) html += '<span class="t-more"> … ' + count + '</span>';
    if (S.cwd === p) html += '<span class="t-here">← estás acá</span>';
    if (S.created[p] !== undefined) html += '<span class="t-made">+ ' + esc(S.created[p] || 'creado') + '</span>';

    out.push('<div class="tl' + (S.cwd === p ? ' cur' + moved : '') + '"' + (dir ? ' data-path="' + esc(p) + '" role="button" tabindex="0" aria-expanded="' + open + '"' : '') + '>' + html + '</div>');
    if (open) treeLines(child, p, prefix + (last ? '    ' : '│   '), out);
  });
}

function renderTree() {
  const tree = $('#tree');
  const keepScroll = tree.scrollTop;
  moved = treeCwd !== null && treeCwd !== S.cwd ? ' moved' : '';
  treeCwd = S.cwd;
  const root = S.treeRoot === '/' ? '/' : HOME;
  const lines = [];
  treeLines(getNode(root), root, '', lines);

  const rootName = root === '/' ? '/' : '~/';
  const rootCls = 't-dir' + (S.cwd === root || S.cwd.startsWith(root === '/' ? '/' : root + '/') ? ' t-path' : '');
  const rootLine = '<div class="tl' + (S.cwd === root ? ' cur' + moved : '') + '"><span class="' + rootCls + '">' + rootName + '</span>' +
    (root === HOME ? '<span class="t-pre"> (' + HOME + ')</span>' : '') + (S.cwd === root ? '<span class="t-here">← estás acá</span>' : '') + '</div>';
  const outside = root === HOME && !(S.cwd === HOME || S.cwd.startsWith(HOME + '/'));

  const changes = (S.changes || []).slice(-10).reverse();
  tree.innerHTML =
    '<div class="t-head">' +
    '<div class="t-where">Estás en <b>' + esc(tildify(S.cwd)) + '</b><span>pwd: ' + esc(S.cwd) + '</span></div>' +
    '<div class="t-opts">' +
    '<button type="button" data-root="~" aria-pressed="' + (root === HOME) + '">~ home</button>' +
    '<button type="button" data-root="/" aria-pressed="' + (root === '/') + '">/ todo el sistema</button>' +
    '<button type="button" data-hidden aria-pressed="' + !!S.treeHidden + '">ocultos</button>' +
    '</div></div>' +
    (outside ? '<p class="t-note">Estás fuera de tu home. Tocá "/ todo el sistema" para verte.</p>' : '') +
    '<div class="t-body">' + rootLine + lines.join('') + '</div>' +
    '<p class="t-legend"><span class="t-dir">carpeta/</span> <span class="t-file">archivo</span> <span class="t-exe">ejecutable*</span> · tocá una carpeta para abrirla o cerrarla</p>' +
    '<div class="t-log"><h4>Cambios de esta sesión</h4>' +
    (changes.length
      ? '<ul>' + changes.map((c) => '<li class="' + (c.op === '+' ? 'add' : 'del') + '"><b>' + c.op + '</b> ' +
        (c.dir ? 'carpeta ' : 'archivo ') + '<span>' + esc(tildify(c.path)) + (c.dir ? '/' : '') + '</span>' +
        '<code>' + esc(c.cmd) + '</code></li>').join('') + '</ul>'
      : '<p>Todavía no creaste ni borraste nada. Probá con mkdir o touch en la consola de abajo.</p>') +
    '</div>';

  /* Se conserva el scroll, pero la carpeta actual siempre queda a la vista */
  tree.scrollTop = keepScroll;
  const cur = $('#tree .tl.cur');
  if (cur && (cur.offsetTop < tree.scrollTop || cur.offsetTop + cur.offsetHeight > tree.scrollTop + tree.clientHeight)) {
    tree.scrollTop = cur.offsetTop - tree.clientHeight / 3;
  }
}

/* ---------- toggle: solo terminal / árbol arriba y terminal abajo ---------- */
function setView(view) {
  const split = view === 'tree';
  S.view = split ? 'tree' : 'term';
  $('#tree').hidden = !split;
  $('.term-body').classList.toggle('split', split);
  document.querySelectorAll('.vt button').forEach((b) => b.setAttribute('aria-selected', b.dataset.view === S.view));
  if (split) { treeCwd = null; renderTree(); }
  scrollDown();
  inputEl.focus();
  save();
}

document.querySelectorAll('.vt button').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));

$('#tree').addEventListener('click', (e) => {
  const opt = e.target.closest('[data-root], [data-hidden]');
  if (opt) {
    if (opt.dataset.root) S.treeRoot = opt.dataset.root;
    else S.treeHidden = !S.treeHidden;
    save();
    renderTree();
    return;
  }
  const line = e.target.closest('.tl[data-path]');
  if (line) {
    treeOpen[line.dataset.path] = !isOpen(line.dataset.path);
    renderTree();
  }
});

$('#tree').addEventListener('keydown', (e) => {
  const line = e.target.closest('.tl[data-path]');
  if (!line || (e.key !== 'Enter' && e.key !== ' ')) return;
  e.preventDefault();
  const path = line.dataset.path;
  treeOpen[path] = !isOpen(path);
  renderTree();
  const again = $('#tree .tl[data-path="' + CSS.escape(path) + '"]');
  if (again) again.focus();
});
