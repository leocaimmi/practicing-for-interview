/* Arranque: pestañas, contadores de progreso y primer render de cada sección. */

function renderStats() {
  const loopDone = Object.keys(S.loopDone).length;
  $('#st-loop').textContent = loopDone + '/' + LOOP.length;
  if (typeof KATAS !== 'undefined') {
    const kataDone = KATAS.filter((k) => S.kataDone[k.id]).length;
    $('#st-kata').textContent = kataDone + '/' + KATAS.length;
  }
}

function showTab(name) {
  if (!$('#tab-' + name)) name = 'loop';
  $$('[role="tab"]').forEach((b) => {
    const on = b.dataset.tab === name;
    b.setAttribute('aria-selected', on);
    $('#tab-' + b.dataset.tab).hidden = !on;
  });
  S.tab = name;
  save();
}

$$('[role="tab"]').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));

highlightStatic();
renderStats();
openLoop(Math.min(S.loop, LOOP.length - 1));
if (typeof openKata === 'function') openKata(Math.min(S.kata, KATAS.length - 1));
if (typeof initPlayground === 'function') initPlayground();
showTab(S.tab);
