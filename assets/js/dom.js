/* Helpers compartidos por los dojos: DOM, listas laterales y paneles con scroll propio. */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

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

/* En desktop, los paneles ocupan justo el alto que queda en la ventana: scrollean ellos, no la página */
function fitPanes() {
  const root = document.documentElement;
  const box = $('.pane:not([hidden]) :is(.lay, .play)');
  if (!box || matchMedia('(max-width: 960px)').matches) { root.style.removeProperty('--pane-h'); return; }
  const top = box.getBoundingClientRect().top + window.scrollY;
  const below = $('footer').offsetHeight + 24 + 40; /* margen del footer + padding inferior */
  root.style.setProperty('--pane-h', Math.max(440, window.innerHeight - top - below) + 'px');
}
