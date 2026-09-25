/* Editor sobre un textarea: Tab indenta, Enter mantiene la sangría, Ctrl+Enter corre.
   Esc libera el foco para que el siguiente Tab salga del editor (accesibilidad). */
const INDENT = '  ';

function insertText(ta, text) {
  /* execCommand conserva el historial de Ctrl+Z; si no está, se escribe a mano */
  try { if (document.execCommand('insertText', false, text)) return; } catch (e) { /* sin soporte */ }
  const { selectionStart: a, selectionEnd: b, value } = ta;
  ta.value = value.slice(0, a) + text + value.slice(b);
  ta.selectionStart = ta.selectionEnd = a + text.length;
  ta.dispatchEvent(new Event('input'));
}

function setupEditor(ta, { onRun } = {}) {
  let escaped = false;
  ta.setAttribute('spellcheck', 'false');
  ta.setAttribute('autocapitalize', 'off');
  ta.setAttribute('autocomplete', 'off');
  ta.setAttribute('autocorrect', 'off');

  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { escaped = true; return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); if (onRun) onRun(); return; }

    if (e.key === 'Tab' && !escaped) {
      e.preventDefault();
      const { selectionStart: a, selectionEnd: b, value } = ta;
      const lineStart = value.lastIndexOf('\n', a - 1) + 1;
      if (a === b && !e.shiftKey) { insertText(ta, INDENT); return; }
      /* Con selección (o Shift+Tab): indenta o desindenta todas las líneas tocadas */
      const block = value.slice(lineStart, b);
      const lines = block.split('\n');
      const next = e.shiftKey
        ? lines.map((l) => l.replace(new RegExp('^ {1,' + INDENT.length + '}'), ''))
        : lines.map((l) => INDENT + l);
      const joined = next.join('\n');
      ta.value = value.slice(0, lineStart) + joined + value.slice(b);
      ta.selectionStart = a === b ? Math.max(lineStart, a + (joined.length - block.length)) : lineStart;
      ta.selectionEnd = lineStart + joined.length;
      ta.dispatchEvent(new Event('input'));
      return;
    }
    escaped = false;

    if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      const { selectionStart: a, value } = ta;
      const line = value.slice(value.lastIndexOf('\n', a - 1) + 1, a);
      let pad = line.match(/^\s*/)[0];
      if (/[{[(]\s*$|=>\s*$/.test(line)) pad += INDENT;
      insertText(ta, '\n' + pad);
    }
  });

  ta.addEventListener('blur', () => { escaped = false; });
}
