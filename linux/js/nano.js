/* Editor nano: abrir, editar, guardar (Ctrl+S / Ctrl+O) y salir (Ctrl+X) */

const nanoEl = $('#nano'), nanoText = $('#nanotext');
let editing = null; // { abs, name, original }

C.nano = (a) => {
  if (!a.length) return { err: 'Pasale un archivo: nano notas.txt', code: 1 };
  const abs = norm(a[0]), n = getNode(abs);
  if (n && n.type === 'dir') return { err: `"${a[0]}" is a directory`, code: 1 };
  setTimeout(() => openNano(abs, a[0]), 0);
  return {};
};

function openNano(abs, name) {
  const n = getNode(abs);
  editing = { abs, name, original: n ? n.content : '' };
  nanoText.value = editing.original;
  $('#nanofile').textContent = name;
  $('#nanomod').textContent = '';
  $('#nanostatus').innerHTML = n ? '' : '<span>[ New File ]</span>';
  nanoEl.hidden = false;
  nanoText.focus();
  nanoText.setSelectionRange(0, 0);
}

function nanoSave() {
  const e = writeFile(editing.abs, nanoText.value, false, 'nano');
  if (e) {
    $('#nanostatus').innerHTML = '<span>[ Error writing ' + esc(editing.name) + ': ' + esc(e.split(': ').pop()) + ' ]</span>';
    return;
  }
  editing.original = nanoText.value;
  $('#nanomod').textContent = '';
  $('#nanostatus').innerHTML = '<span>[ Wrote ' + splitLines(nanoText.value).length + ' lines ]</span>';
  S.flags.nano = true;
  if (typeof onFsChange === 'function') onFsChange();
  if (typeof checkMissions === 'function') checkMissions();
  save();
}

function nanoExit() {
  if (nanoText.value !== editing.original) info('(nano: saliste sin guardar, los cambios se descartaron)');
  nanoEl.hidden = true;
  editing = null;
  updatePrompt();
  scrollDown();
  inputEl.focus();
}

nanoText.addEventListener('input', () => {
  $('#nanomod').textContent = nanoText.value !== editing.original ? 'Modified' : '';
});
nanoText.addEventListener('keydown', (e) => {
  if (!e.ctrlKey && !e.metaKey) return;
  const k = e.key.toLowerCase();
  if (k === 's' || k === 'o') { e.preventDefault(); nanoSave(); }
  else if (k === 'x') { e.preventDefault(); nanoExit(); }
});
document.querySelectorAll('[data-nk]').forEach((b) => b.addEventListener('click', () => {
  if (b.dataset.nk === 'save') nanoSave(); else nanoExit();
}));
