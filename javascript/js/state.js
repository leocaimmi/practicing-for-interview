/* Estado del Dojo de JavaScript: helpers del DOM y progreso guardado en localStorage. */
const STORAGE_KEY = 'dojo-js-v1';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function freshState() {
  return {
    tab: 'loop',      // pestaña abierta
    loop: 0,          // ejercicio de event loop actual
    loopDone: {},     // índice → true
    kata: 0,          // kata actual
    kataDone: {},     // id → true
    drafts: {},       // id de kata → código escrito
    play: null,       // código del playground (null = ejemplo por defecto)
    guide: 0,         // tema abierto de la guía rápida
    guideSeen: {},    // índice → true (temas ya leídos)
    question: 0,      // pregunta abierta
    qKnown: {}        // texto de la pregunta → true (marcada como "La sé")
  };
}

let S = freshState();
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) S = Object.assign(freshState(), JSON.parse(raw));
} catch (e) { /* storage bloqueado o JSON roto: seguimos en memoria */ }

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch (e) { /* sin storage */ }
}

/* Guardado diferido para no escribir en cada tecla */
let saveTimer = null;
function saveSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 300);
}

/* Listas laterales (ejercicios, katas, temas, preguntas): mismo HTML en todas las pestañas */
function listHTML(items, current, isDone, label) {
  return items.map((it, i) => {
    const done = isDone(it, i);
    const cls = (done ? 'done' : '') + (i === current ? ' cur' : '');
    return '<li class="' + cls + '"><button type="button" data-i="' + i + '" aria-label="' + esc(label + ' ' + (i + 1) + ': ' + it.t) + '">' +
      '<span class="n">' + (done ? '✓' : i + 1) + '</span><span class="t">' + esc(it.t) + '</span></button></li>';
  }).join('');
}

/* Scroll dentro de los paneles (no de la página) */
function keepInView(box, el) {
  if (!box || !el) return;
  const top = el.offsetTop, bottom = top + el.offsetHeight;
  if (top < box.scrollTop || bottom > box.scrollTop + box.clientHeight) box.scrollTop = top - 8;
}
function scrollInside(box, el) {
  if (box && el) box.scrollTo({ top: el.offsetTop - 12, behavior: 'smooth' });
}
