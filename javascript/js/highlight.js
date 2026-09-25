/* Resaltado de sintaxis mínimo: comentarios, strings, números, palabras clave y llamadas. */
const KEYWORDS = new Set(('const let var function return async await new if else for of in while do try catch finally ' +
  'throw class extends this typeof instanceof null undefined true false import export from default switch case ' +
  'break continue delete void yield super').split(' '));
const BUILTINS = new Set('console Promise setTimeout clearTimeout setInterval clearInterval queueMicrotask fetch JSON Math Object Array Error Number String Date structuredClone'.split(' '));

const TOKEN_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\[\s\S]|[^`\\])*`|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(=>)/g;

function highlight(src) {
  let out = '', last = 0, m;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(src))) {
    const t = m[0];
    out += esc(src.slice(last, m.index));
    last = TOKEN_RE.lastIndex;
    let cls = '';
    if (m[1]) cls = 'h-com';
    else if (m[2]) cls = 'h-str';
    else if (m[3]) cls = 'h-num';
    else if (m[5] || KEYWORDS.has(t)) cls = 'h-kw';
    else if (BUILTINS.has(t)) cls = 'h-bi';
    else if (src[last] === '(') cls = 'h-fn';
    out += cls ? '<span class="' + cls + '">' + esc(t) + '</span>' : esc(t);
  }
  return out + esc(src.slice(last));
}

/* Saca los comentarios pero respeta los strings (para chequear el código sin que cuente lo comentado) */
function stripComments(src) {
  return src.replace(/(`(?:\\[\s\S]|[^`\\])*`|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (m, str) => str || '');
}

/* Bloques estáticos del HTML con data-hl: el texto se reemplaza por su versión resaltada */
function highlightStatic(root = document) {
  $$('pre[data-hl]', root).forEach((pre) => {
    pre.innerHTML = highlight(pre.textContent.replace(/^\n/, ''));
    pre.classList.add('code');
  });
}
