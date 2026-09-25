/* Estado del Dojo de JavaScript: progreso guardado en localStorage. */
const STORAGE_KEY = 'dojo-js-v1';

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
