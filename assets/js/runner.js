/* Runner: ejecuta código en la página capturando console.* y espera a que terminen timers y promesas.
   El código corre dentro de una función async, así que admite await en el nivel superior. */
const AsyncFunction = (async () => {}).constructor;
const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

/* Formatea valores parecido a la consola de Node: [ 1, 2 ], { a: 'x' } */
function fmt(v, depth = 0) {
  if (typeof v === 'string') return depth ? "'" + v + "'" : v;
  if (v === undefined) return 'undefined';
  if (typeof v === 'function') return '[Function: ' + (v.name || 'anónima') + ']';
  if (typeof v !== 'object' || v === null) return String(v);
  if (v instanceof Error) return v.name + ': ' + v.message;
  if (v instanceof Promise) return 'Promise { … }';
  if (depth > 2) return Array.isArray(v) ? '[Array]' : '[Object]';
  if (Array.isArray(v)) return v.length ? '[ ' + v.map((x) => fmt(x, depth + 1)).join(', ') + ' ]' : '[]';
  const keys = Object.keys(v);
  if (!keys.length) return '{}';
  return '{ ' + keys.map((k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : "'" + k + "'") + ': ' + fmt(v[k], depth + 1)).join(', ') + ' }';
}

/**
 * Corre `src` y devuelve { logs, exports, error, timedOut }.
 * - scope: variables extra visibles para el código (mocks de api, fetch, etc.)
 * - ret: nombres que se leen del código al terminar (las funciones de una kata)
 * - limit: ms máximos esperando timers o un await que nunca resuelve
 */
async function runCode(src, { scope = {}, ret = [], limit = 3000 } = {}) {
  const logs = [];
  const push = (kind) => (...args) => logs.push({ kind, text: args.map((a) => fmt(a)).join(' ') });
  const con = { log: push('log'), info: push('log'), debug: push('log'), table: push('log'), warn: push('warn'), error: push('error') };

  /* Timers envueltos para saber cuándo quedan pendientes */
  const timers = new Set();
  const guard = (fn, args) => { try { fn(...args); } catch (e) { con.error('Uncaught ' + fmt(e)); } };
  const sT = (fn, ms, ...args) => { const id = setTimeout(() => { timers.delete(id); guard(fn, args); }, ms); timers.add(id); return id; };
  const sI = (fn, ms, ...args) => { const id = setInterval(() => guard(fn, args), ms); timers.add(id); return id; };
  const clear = (id) => { clearTimeout(id); clearInterval(id); timers.delete(id); };

  const names = ['console', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', ...Object.keys(scope)];
  const values = [con, sT, sI, clear, clear, ...Object.values(scope)];
  const tail = ret.length
    ? '\n;return { ' + ret.map((n) => n + ': typeof ' + n + ' !== "undefined" ? ' + n + ' : undefined').join(', ') + ' };'
    : '';

  const onRejection = (e) => { e.preventDefault(); con.error('Uncaught (in promise) ' + fmt(e.reason)); };
  window.addEventListener('unhandledrejection', onRejection);

  let exports = {}, error = null, settled = false;
  try {
    const fn = new AsyncFunction(...names, '"use strict";\n' + src + tail);
    fn(...values)
      .then((r) => { exports = r || {}; }, (e) => { error = e; con.error('Uncaught ' + fmt(e)); })
      .finally(() => { settled = true; });
  } catch (e) { /* error de sintaxis: ni siquiera arrancó */
    error = e; settled = true;
    con.error(fmt(e));
  }

  const t0 = performance.now();
  await tick();
  while ((timers.size || !settled) && performance.now() - t0 < limit) await tick(10);
  await tick();
  window.removeEventListener('unhandledrejection', onRejection);

  const timedOut = timers.size > 0 || !settled;
  timers.forEach(clear);
  if (timedOut) logs.push({ kind: 'warn', text: '⏱ Corté la ejecución a los ' + limit / 1000 + ' s: ¿un setInterval sin clearInterval o una promesa que nunca resuelve?' });
  return { logs, exports, error, timedOut };
}

function renderConsole(logs) {
  if (!logs.length) return '<div class="console"><div class="dim">(no se imprimió nada)</div></div>';
  return '<div class="console">' + logs.map((l) => '<div class="' + l.kind + '">' + esc(l.text) + '</div>').join('') + '</div>';
}
