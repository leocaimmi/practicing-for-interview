/* Arranque: pestañas, contadores de progreso y primer render de cada sección. */

function renderStats() {
  const loopDone = Object.keys(S.loopDone).length;
  $('#st-loop').textContent = loopDone + '/' + LOOP.length;
  if (typeof KATAS !== 'undefined') {
    const kataDone = KATAS.filter((k) => S.kataDone[k.id]).length;
    $('#st-kata').textContent = kataDone + '/' + KATAS.length;
  }
  if (typeof QUESTIONS !== 'undefined') {
    const known = QUESTIONS.filter((q) => S.qKnown[q.t]).length;
    $('#st-q').textContent = known + '/' + QUESTIONS.length;
  }
}

window.addEventListener('resize', fitPanes);
$$('details.rule').forEach((d) => d.addEventListener('toggle', fitPanes));

function showTab(name) {
  if (!$('#tab-' + name)) name = 'loop';
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

renderStats();
openLoop(Math.min(S.loop, LOOP.length - 1));
if (typeof openKata === 'function') openKata(Math.min(S.kata, KATAS.length - 1));
if (typeof initPlayground === 'function') initPlayground();
if (typeof openGuide === 'function') openGuide(Math.min(S.guide, GUIDE.length - 1));
if (typeof openQuestion === 'function') openQuestion(Math.min(S.question, QUESTIONS.length - 1));
showTab(S.tab);
if (document.fonts) document.fonts.ready.then(fitPanes); /* las fuentes cambian el alto del header */
