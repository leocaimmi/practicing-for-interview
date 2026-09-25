/* Arranque: pestañas, contadores de progreso y primer render de cada sección. */

function renderStats() {
  const count = (items, isDone) => items.filter(isDone).length + '/' + items.length;
  $('#st-kata').textContent = count(KATAS, (k) => S.kataDone[k.id]);
  if (typeof PREDS !== 'undefined') $('#st-pred').textContent = count(PREDS, (p, i) => S.predDone[i]);
  if (typeof QUESTIONS !== 'undefined') $('#st-q').textContent = count(QUESTIONS, (q) => S.qKnown[q.t]);
}

window.addEventListener('resize', fitPanes);

function showTab(name) {
  if (!$('#tab-' + name)) name = 'kata';
  $$('[role="tab"]').forEach((b) => {
    const on = b.dataset.tab === name;
    b.setAttribute('aria-selected', on);
    $('#tab-' + b.dataset.tab).hidden = !on;
  });
  S.tab = name;
  save();
  fitPanes();
}

$$('[role="tab"]').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));

if (typeof React === 'undefined' || typeof Babel === 'undefined') {
  /* Sin internet no cargan React ni Babel desde el CDN */
  $('main').innerHTML = '<div class="res bad">No se pudo cargar React o Babel desde el CDN. Revisá la conexión a internet y recargá la página.</div>';
} else {
  renderStats();
  openKata(Math.min(S.kata, KATAS.length - 1));
  if (typeof openPred === 'function') openPred(Math.min(S.pred, PREDS.length - 1));
  if (typeof initPlayground === 'function') initPlayground();
  if (typeof openGuide === 'function') openGuide(Math.min(S.guide, GUIDE.length - 1));
  if (typeof openQuestion === 'function') openQuestion(Math.min(S.question, QUESTIONS.length - 1));
  showTab(S.tab);
  if (document.fonts) document.fonts.ready.then(fitPanes); /* las fuentes cambian el alto del header */
}
