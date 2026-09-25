/* Misiones guiadas: cada una valida el estado del sistema o el último comando */

const ranOk = (name, pred) => lastRan.some((r) => r.name === name && !r.code && (!pred || pred(r.args)));
const isFile = (p) => { const n = getNode(p); return !!n && n.type === 'file'; };
const isDir = (p) => { const n = getNode(p); return !!n && n.type === 'dir'; };

const MISSIONS = [
  { t: '¿Dónde estoy?', d: 'Mostrá la ruta de la carpeta en la que estás parado.', c: 'pwd',
    w: 'print working directory: devuelve la ruta absoluta. Arrancás en tu home, /home/leo.',
    ok: () => ranOk('pwd') },
  { t: 'Mirá qué hay', d: 'Listá el contenido de tu home.', c: 'ls',
    w: 'Las carpetas salen en cian, los ejecutables en verde, los archivos comunes en blanco.',
    ok: () => ranOk('ls') && S.cwd === HOME },
  { t: 'Entrá a una carpeta', d: 'Metete en la carpeta proyectos.', c: 'cd proyectos',
    w: 'cd = change directory. Probá Tab: escribí "cd pro" y apretá Tab para autocompletar.',
    ok: () => S.cwd === HOME + '/proyectos' },
  { t: 'Volvé un nivel', d: 'Subí a la carpeta padre.', c: 'cd ..',
    w: '.. es la carpeta padre y . la actual. También sirve "cd" solo o "cd ~" para volver al home desde cualquier lado.',
    ok: () => ranOk('cd') && S.cwd === HOME },
  { t: 'Archivos ocultos', d: 'Listá todo, incluyendo ocultos, en formato largo.', c: 'ls -la',
    w: 'Los archivos que empiezan con punto (.bashrc, .config) están ocultos. -l muestra permisos, dueño, tamaño y fecha.',
    ok: () => ranOk('ls', (a) => a.some((x) => /^-\w*a/.test(x))) },
  { t: 'Creá una carpeta', d: 'Creá la carpeta entrevista en tu home.', c: 'mkdir entrevista',
    w: 'mkdir -p a/b/c crea toda la cadena de una.',
    ok: () => isDir(HOME + '/entrevista') },
  { t: 'Creá un archivo vacío', d: 'Adentro de entrevista, creá notas.md.', c: 'touch entrevista/notas.md',
    w: 'touch crea un archivo vacío (o actualiza la fecha si ya existe). Fijate que usaste una ruta relativa sin entrar a la carpeta.',
    ok: () => isFile(HOME + '/entrevista/notas.md') },
  { t: 'Escribí en el archivo', d: 'Mandá un texto a notas.md con echo y redirección.', c: 'echo "Lunes 15:20 Catamarca 3265" > entrevista/notas.md',
    w: '> pisa el contenido. >> agrega al final. Probá después con >> para sumar una línea.',
    ok: () => { const n = getNode(HOME + '/entrevista/notas.md'); return !!n && n.content.trim() !== ''; } },
  { t: 'Abrí y leé el archivo', d: 'Mostrá el contenido de notas.md.', c: 'cat entrevista/notas.md',
    w: 'cat imprime todo. Para archivos largos, less (paginado) o head/tail.',
    ok: () => ['cat', 'less', 'more'].some((n) => ranOk(n, (a) => a.some((x) => x.endsWith('notas.md')))) },
  { t: 'Copiá', d: 'Copiá documentos/cv.txt a la carpeta entrevista.', c: 'cp documentos/cv.txt entrevista/',
    w: 'Si el destino es una carpeta, el archivo se copia adentro con el mismo nombre. Para copiar carpetas enteras: cp -r.',
    ok: () => isFile(HOME + '/entrevista/cv.txt') && isFile(HOME + '/documentos/cv.txt') },
  { t: 'Renombrá', d: 'Cambiale el nombre a entrevista/cv.txt por cv-becon.txt.', c: 'mv entrevista/cv.txt entrevista/cv-becon.txt',
    w: 'En Linux mover y renombrar es lo mismo: mv. No hay comando "rename" aparte.',
    ok: () => isFile(HOME + '/entrevista/cv-becon.txt') && !getNode(HOME + '/entrevista/cv.txt') },
  { t: 'Borrá la basura', d: 'Eliminá la carpeta basura con todo lo que tiene.', c: 'rm -r basura',
    w: 'rm solo no borra carpetas ("Is a directory"). -r es recursivo. rmdir solo borra carpetas vacías. No hay papelera.',
    ok: () => !getNode(HOME + '/basura') },
  { t: 'Buscá texto', d: 'Encontrá todos los TODO dentro de proyectos, con número de línea.', c: 'grep -rn "TODO" proyectos',
    w: '-r recursivo, -n número de línea, -i ignora mayúsculas. Es lo que usás para encontrar algo en un repo.',
    ok: () => ranOk('grep', (a) => a.some((x) => /^-\w*r/.test(x))) },
  { t: 'Buscá archivos', d: 'Listá todos los .js que haya desde donde estás.', c: 'find . -name "*.js"',
    w: 'find busca por nombre/tipo; grep busca contenido. Las comillas evitan que el shell expanda el * antes de tiempo.',
    ok: () => ranOk('find', (a) => a.includes('-name') || a.includes('-iname')) },
  { t: 'Mirá los permisos', d: 'Hacé ejecutable deploy.sh. Antes y después fijate la diferencia con ls -l.', c: 'chmod +x deploy.sh',
    w: '-rw-r--r-- pasa a -rwxr-xr-x. Equivale a chmod 755. r=4, w=2, x=1 por dueño/grupo/otros.',
    ok: () => { const n = getNode(HOME + '/deploy.sh'); return !!n && n.mode[2] === 'x'; } },
  { t: 'Ejecutá un script', d: 'Corré deploy.sh.', c: './deploy.sh',
    w: 'El ./ hace falta porque la carpeta actual no está en el PATH. Si no tuviera permiso x, tirás "Permission denied".',
    ok: () => !!S.flags.script },
  { t: 'Editá con nano', d: 'Abrí notas.txt, agregá una línea, guardá con Ctrl+S y salí con Ctrl+X.', c: 'nano notas.txt',
    w: 'En el celu usá los botones ^S y ^X de abajo del editor. En vim sería Esc y :wq.',
    ok: () => !!S.flags.nano },
  { t: 'Procesos + pipe', d: 'Listá los procesos y filtrá los de node.', c: 'ps aux | grep node',
    w: 'El pipe | pasa la salida de ps como entrada de grep. La columna PID es la que necesitás para matar el proceso.',
    ok: () => ranOk('ps') && ranOk('grep') },
  { t: 'Matá un proceso', d: 'Frená el node server.js usando su PID.', c: 'kill 2048',
    w: 'kill manda SIGTERM (cerrá prolijo). Si no responde, kill -9 (SIGKILL). Probá matar el 873 de postgres sin sudo y mirá el error.',
    ok: () => !S.procs.some((p) => p.pid === 2048) },
  { t: 'Instalá un paquete', d: 'Instalá curl. Probá primero sin sudo para ver el error.', c: 'sudo apt install curl',
    w: 'apt necesita root porque escribe en carpetas del sistema. Después probá: curl https://jsonplaceholder.typicode.com/users/1',
    ok: () => !!S.flags.apt }
];

let hintOpen = false;

function nextPending(from) {
  let i = from;
  while (i < MISSIONS.length && S.done[i]) i++;
  return i;
}

function checkMissions() {
  let advanced = false;
  while (S.mission < MISSIONS.length && !S.done[S.mission] && MISSIONS[S.mission].ok()) {
    S.done[S.mission] = true;
    advanced = true;
    addLine('o', '<span class="c-ok">✓ Misión ' + (S.mission + 1) + ' completa: ' + esc(MISSIONS[S.mission].t) + '</span>');
    S.mission = nextPending(S.mission + 1);
  }
  if (advanced) { hintOpen = false; renderMissions(); scrollDown(); }
}

function renderMissions() {
  const total = MISSIONS.length, doneCount = S.done.filter(Boolean).length;
  $('#progn').textContent = doneCount + '/' + total;
  $('#meter').style.width = (doneCount / total * 100) + '%';

  $('#missions').innerHTML = MISSIONS.map((m, i) => {
    const current = i === S.mission;
    const cls = (S.done[i] ? 'done' : 'todo') + (current ? ' cur' : '');
    const body = !current ? '' :
      '<div class="body"><p>' + esc(m.d) + '</p><div class="row">' +
      '<button type="button" data-act="hint">' + (hintOpen ? 'Ocultar pista' : 'Ver pista') + '</button>' +
      '<button type="button" data-act="fill">Escribir el comando</button>' +
      '<button type="button" data-act="skip">Saltear</button></div>' +
      (hintOpen ? '<div class="hint"><code>' + esc(m.c) + '</code><p>' + esc(m.w) + '</p></div>' : '') + '</div>';
    return '<li class="' + cls + '"><button type="button" class="mh" data-i="' + i + '">' +
      '<span class="n">' + (S.done[i] ? '✓' : i + 1) + '</span><span class="t">' + esc(m.t) + '</span></button>' + body + '</li>';
  }).join('');

  $('#fin').innerHTML = doneCount === total
    ? '<div class="fin"><strong>Completaste las ' + total + '.</strong> Ahora reiniciá el sistema y hacelas de memoria, sin abrir las pistas. Si te salen de corrido, Linux básico ya está.</div>'
    : '';
}

$('#missions').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.i !== undefined) { S.mission = +b.dataset.i; hintOpen = false; renderMissions(); save(); return; }
  const m = MISSIONS[S.mission];
  if (b.dataset.act === 'hint') { hintOpen = !hintOpen; renderMissions(); }
  if (b.dataset.act === 'fill') { inputEl.value = m.c; inputEl.focus(); hintOpen = true; renderMissions(); }
  if (b.dataset.act === 'skip') { S.mission = nextPending(S.mission + 1); hintOpen = false; renderMissions(); save(); }
});
