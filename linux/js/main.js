/* Arranque: mensaje de bienvenida, pestañas del panel y reinicio. */

function motd(wasRestored) {
  const d = new Date();
  d.setHours(d.getHours() - 1);
  info('Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-45-generic x86_64)   · simulado');
  info(' ');
  info(' * Escribí help para ver los comandos, o man <comando> para la explicación.');
  info(' * Las misiones te guían paso a paso. Tab autocompleta, ↑ repite el anterior.');
  info(' ');
  info('Last login: ' + d.toString().slice(0, 24) + ' from 192.168.0.14');
  if (wasRestored) info('(Sesión restaurada: tus archivos siguen donde los dejaste.)');
}

/* Pestañas Misiones / Guía rápida / Preguntas */
document.querySelectorAll('[data-tab]').forEach((btn) => btn.addEventListener('click', () => {
  document.querySelectorAll('[data-tab]').forEach((x) => {
    const on = x === btn;
    x.setAttribute('aria-selected', on);
    $('#tab-' + x.dataset.tab).hidden = !on;
  });
}));

/* Reinicio en dos clics (confirm() no siempre está disponible) */
const resetBtn = $('#reset');
let resetTimer = null;
resetBtn.addEventListener('click', () => {
  if (!resetBtn.classList.contains('armed')) {
    resetBtn.classList.add('armed');
    resetBtn.textContent = '¿Seguro? Click de nuevo';
    resetTimer = setTimeout(() => { resetBtn.classList.remove('armed'); resetBtn.textContent = 'Reiniciar sistema'; }, 3000);
    return;
  }
  clearTimeout(resetTimer);
  resetBtn.classList.remove('armed');
  resetBtn.textContent = 'Reiniciar sistema';
  S = freshState();
  save();
  outEl.innerHTML = '';
  motd(false);
  updatePrompt();
  if (typeof renderMissions === 'function') renderMissions();
  inputEl.focus();
});

motd(restored);
updatePrompt();
if (typeof renderMissions === 'function') renderMissions();
if (!matchMedia('(hover: none)').matches) inputEl.focus();
