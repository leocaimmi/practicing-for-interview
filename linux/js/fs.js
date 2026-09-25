/* Sistema de archivos virtual: rutas, nodos, permisos y helpers. */

/* Convierte cualquier ruta (relativa, ~, ., ..) a absoluta normalizada */
function norm(p) {
  if (p === undefined || p === '') p = '.';
  if (p === '~' || p.startsWith('~/')) p = HOME + p.slice(1);
  if (!p.startsWith('/')) p = S.cwd + '/' + p;
  const out = [];
  for (const seg of p.split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') { out.pop(); continue; }
    out.push(seg);
  }
  return '/' + out.join('/');
}

function getNode(abs) {
  if (abs === '/') return S.fs;
  let n = S.fs;
  for (const seg of abs.slice(1).split('/')) {
    if (!n || n.type !== 'dir') return null;
    n = n.children[seg];
  }
  return n || null;
}

/* '/a/b/c' → ['/a/b', 'c'] */
function splitPath(abs) {
  const i = abs.lastIndexOf('/');
  return [abs.slice(0, i) || '/', abs.slice(i + 1)];
}

/* Sin sudo solo se puede escribir en el home y en /tmp */
function writable(abs) {
  return SUDO || abs === HOME || abs.startsWith(HOME + '/') || abs === '/tmp' || abs.startsWith('/tmp/');
}
function ownerOf(abs) {
  return (abs === HOME || abs.startsWith(HOME + '/') || abs.startsWith('/tmp')) ? 'leo' : 'root';
}
function tildify(abs) {
  return abs === HOME ? '~' : abs.startsWith(HOME + '/') ? '~' + abs.slice(HOME.length) : abs;
}

const cloneNode = (n) => { const c = JSON.parse(JSON.stringify(n)); c.mtime = Date.now(); return c; };
const isExecutable = (n) => n && n.type === 'file' && n.mode[2] === 'x';
const newDir = () => ({ type: 'dir', children: {}, mode: 'rwxr-xr-x', mtime: Date.now() });
const newFile = (content = '') => ({ type: 'file', content, mode: 'rw-r--r--', mtime: Date.now() });

/* Nombre coloreado como lo pinta ls en una TTY */
function nameHtml(name, n, tty) {
  if (!tty) return name;
  const e = esc(name);
  if (n && n.type === 'dir') return '<span class="c-dir">' + e + '</span>';
  if (isExecutable(n)) return '<span class="c-exe">' + e + '</span>';
  return e;
}

function globToRegex(p) {
  return new RegExp('^' + p.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
}
function splitLines(t) {
  if (!t) return [];
  const a = t.split('\n');
  if (a[a.length - 1] === '') a.pop();
  return a;
}
const byteLength = (s) => new TextEncoder().encode(s).length;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function lsDate(t) {
  const d = new Date(t);
  return MONTHS[d.getMonth()] + ' ' + String(d.getDate()).padStart(2) + ' ' +
    String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

/* Parsea flags cortas: ['-la', 'x'] → { f: Set{l,a}, rest: ['x'] } */
function parseFlags(args) {
  const f = new Set(), rest = [];
  for (const a of args) {
    if (a.length > 1 && a[0] === '-' && !/^-\d/.test(a)) { for (const ch of a.replace(/^-+/, '')) f.add(ch); }
    else rest.push(a);
  }
  return { f, rest };
}

/* Lee archivos o, si no hay, la entrada del pipe */
function readSources(files, stdin, cmd) {
  const chunks = [], err = [];
  if (!files.length) { chunks.push({ name: null, text: stdin || '' }); return { chunks, err }; }
  for (const f of files) {
    const n = getNode(norm(f));
    if (!n) err.push(`${cmd}: ${f}: No such file or directory`);
    else if (n.type === 'dir') err.push(`${cmd}: ${f}: Is a directory`);
    else chunks.push({ name: f, text: n.content });
  }
  return { chunks, err };
}

/* Escribe (o agrega) contenido a un archivo; devuelve un error o null */
function writeFile(target, content, append, cmdName) {
  const abs = norm(target), n = getNode(abs), [parentAbs, name] = splitPath(abs), parent = getNode(parentAbs);
  if (n && n.type === 'dir') return `${cmdName}: ${target}: Is a directory`;
  if (!parent || parent.type !== 'dir') return `${cmdName}: ${target}: No such file or directory`;
  if (!writable(abs)) return `${cmdName}: ${target}: Permission denied`;
  if (n) { n.content = append ? n.content + content : content; n.mtime = Date.now(); }
  else parent.children[name] = newFile(content);
  return null;
}
