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
    play: null        // código del playground (null = ejemplo por defecto)
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
