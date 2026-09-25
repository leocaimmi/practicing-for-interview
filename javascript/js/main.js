/* Arranque: pestañas, contadores de progreso y primer render de cada sección. */

function renderStats() {
  const loopDone = Object.keys(S.loopDone).length;
  $('#st-loop').textContent = loopDone + '/' + LOOP.length;
  if (typeof KATAS !== 'undefined') {
    const kataDone = KATAS.filter((k) => S.kataDone[k.id]).length;
    $('#st-kata').textContent = kataDone + '/' + KATAS.length;
  }
}

/* En desktop, los paneles ocupan justo el alto que queda en la ventana: scrollean ellos, no la página */
function fitPanes() {
  const root = document.documentElement;
  const box = $('.pane:not([hidden]) :is(.lay, .play)');
  if (!box || matchMedia('(max-width: 960px)').matches) { root.style.removeProperty('--pane-h'); return; }
  const top = box.getBoundingClientRect().top + window.scrollY;
  const below = $('footer').offsetHeight + 24 + 40; /* margen del footer + padding inferior */
  root.style.setProperty('--pane-h', Math.max(440, window.innerHeight - top - below) + 'px');
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

highlightStatic();
renderStats();
openLoop(Math.min(S.loop, LOOP.length - 1));
if (typeof openKata === 'function') openKata(Math.min(S.kata, KATAS.length - 1));
if (typeof initPlayground === 'function') initPlayground();
showTab(S.tab);
if (document.fonts) document.fonts.ready.then(fitPanes); /* las fuentes cambian el alto del header */
