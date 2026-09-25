/* Ejercicios de "¿en qué orden se imprime?".
   El código se corre de verdad con el runner: la respuesta correcta es lo que imprime el navegador,
   no algo escrito a mano. Las explicaciones sí están escritas para decirlas en voz alta. */

const LOOP = [
  {
    t: 'Lo sincrónico va primero',
    code: `console.log('A');
setTimeout(() => console.log('B'), 0);
console.log('C');`,
    why: [
      '`A` y `C` son sincrónicos: se imprimen en el orden en que aparecen.',
      '`setTimeout(fn, 0)` no significa "ahora": registra `fn` como macrotarea, que recién corre cuando la pila quedó vacía.',
      'Por eso `B` sale al final aunque el delay sea 0.'
    ]
  },
  {
    t: 'Promesa contra setTimeout',
    code: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');`,
    why: [
      'Sincrónico: `1` y `4`.',
      'El `.then` va a la cola de microtareas y el `setTimeout` a la de macrotareas.',
      'Cuando se vacía la pila, el event loop vacía primero todas las microtareas (`3`) y recién después toma una macrotarea (`2`).'
    ]
  },
  {
    t: 'El executor de una promesa es sincrónico',
    code: `console.log('inicio');
const p = new Promise((resolve) => {
  console.log('dentro del executor');
  resolve('valor');
  console.log('después del resolve');
});
p.then((v) => console.log('then:', v));
console.log('fin');`,
    why: [
      'La función que le pasás a `new Promise` (el executor) se ejecuta en el acto, de forma sincrónica.',
      '`resolve()` no corta la función como un `return`: solo marca la promesa como cumplida, así que `después del resolve` también se imprime.',
      'El `.then` sí es asincrónico: va a microtareas y corre después de `fin`.'
    ]
  },
  {
    t: 'async corre sincrónico hasta el primer await',
    code: `async function tarea() {
  console.log('tarea: arranca');
  await null;
  console.log('tarea: sigue');
}

console.log('a');
tarea();
console.log('b');`,
    why: [
      'Llamar a una función `async` ejecuta su cuerpo de forma sincrónica hasta el primer `await`.',
      'En el `await` la función se pausa y devuelve una promesa; el resto (`tarea: sigue`) queda como microtarea.',
      'Mientras tanto el código de afuera sigue: se imprime `b`, y después se retoma la función.',
      'Ojo: `await` pausa la función, no el hilo. El programa nunca se bloquea.'
    ]
  },
  {
    t: 'El clásico de las entrevistas',
    code: `console.log('script start');
setTimeout(() => console.log('setTimeout'), 0);
Promise.resolve()
  .then(() => console.log('promise1'))
  .then(() => console.log('promise2'));
console.log('script end');`,
    why: [
      'Sincrónico: `script start` y `script end`.',
      '`promise1` corre como microtarea y, al terminar, encola `promise2` como otra microtarea.',
      'Como la cola de microtareas se vacía entera (incluyendo lo que se agrega mientras tanto), `promise2` sale antes del `setTimeout`.'
    ]
  },
  {
    t: 'Timers con distinto delay',
    code: `setTimeout(() => console.log('lento'), 30);
setTimeout(() => console.log('inmediato'), 0);
setTimeout(() => console.log('medio'), 10);
console.log('sync');`,
    why: [
      '`sync` primero, como siempre.',
      'Los timers salen por orden de vencimiento, no por orden de escritura: 0 ms, 10 ms, 30 ms.',
      'El delay es un mínimo, no una garantía: si la pila está ocupada, el callback espera.'
    ]
  },
  {
    t: 'Microtarea adentro de un timer',
    code: `setTimeout(() => {
  console.log('timer 1');
  Promise.resolve().then(() => console.log('micro dentro de timer 1'));
}, 0);
setTimeout(() => console.log('timer 2'), 0);`,
    why: [
      'Los dos timers están listos, pero el event loop toma de a una macrotarea.',
      'Corre `timer 1`, que encola una microtarea.',
      'Antes de pasar a la siguiente macrotarea se vacían las microtareas: sale `micro dentro de timer 1` y recién después `timer 2`.'
    ]
  },
  {
    t: 'await de otra función async',
    code: `async function a() {
  console.log('a1');
  await b();
  console.log('a2');
}

async function b() {
  console.log('b');
}

a();
Promise.resolve().then(() => console.log('then'));
console.log('fin');`,
    why: [
      '`a()` corre sincrónico: imprime `a1` y llama a `b()`, que también es sincrónica hasta terminar e imprime `b`.',
      '`b()` devuelve una promesa ya resuelta; el `await` deja el resto de `a` (`a2`) como primera microtarea.',
      'El `.then` de abajo se encola segundo, y se imprime `fin`.',
      'Las microtareas salen en orden de llegada: `a2` y después `then`.'
    ]
  },
  {
    t: 'Errores en la cadena',
    code: `Promise.reject(new Error('boom'))
  .then(() => console.log('then 1'))
  .catch((e) => console.log('catch:', e.message))
  .then(() => console.log('then 2'))
  .finally(() => console.log('finally'));
console.log('sync');`,
    why: [
      'Todo el encadenado es asincrónico, así que `sync` sale primero.',
      'Una promesa rechazada saltea los `.then` hasta el primer `.catch`: `then 1` nunca se imprime.',
      '`.catch` devuelve una promesa resuelta, así que la cadena sigue normal: se imprime `then 2`.',
      '`.finally` corre siempre, haya salido bien o mal. Sirve para apagar un loading, por ejemplo.'
    ]
  },
  {
    t: 'forEach no espera a una función async',
    code: `const ids = [1, 2, 3];

ids.forEach(async (id) => {
  await null;
  console.log('procesado', id);
});

console.log('listo');`,
    why: [
      '`forEach` llama al callback y descarta lo que devuelve. Como el callback es `async`, devuelve una promesa que nadie espera.',
      'Cada callback llega a su `await` y se pausa; `forEach` termina enseguida y se imprime `listo`.',
      'Después corren las continuaciones en orden: `procesado 1`, `2`, `3`.',
      'Si necesitás esperar: `for...of` con `await` (uno por uno) o `await Promise.all(ids.map(...))` (en paralelo).'
    ]
  },
  {
    t: 'Promise.all respeta el orden',
    code: `const esperar = (ms, valor) =>
  new Promise((resolve) => setTimeout(() => {
    console.log('resolvió', valor);
    resolve(valor);
  }, ms));

Promise.all([esperar(30, 'lento'), esperar(10, 'rápido')])
  .then((valores) => console.log(valores));`,
    why: [
      'Las dos promesas arrancan a la vez: `Promise.all` no las lanza, solo las espera.',
      '`rápido` resuelve a los 10 ms y `lento` a los 30 ms, por eso se imprimen en ese orden.',
      'Pero el array final respeta el orden en que las pasaste, no el orden en que terminaron: `[ lento, rápido ]`.',
      'Si una sola rechaza, `Promise.all` rechaza entero. Para quedarte con todos los resultados igual existe `Promise.allSettled`.'
    ]
  },
  {
    t: 'var contra let en un for',
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var', i), 0);
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('let', j), 0);
}`,
    why: [
      'Los seis timers corren después de que terminan los dos `for`.',
      '`var` tiene scope de función: hay una sola `i` compartida, y cuando corren los timers ya vale 3.',
      '`let` tiene scope de bloque: cada vuelta del `for` crea una `j` nueva, y cada arrow function captura la suya (closure).',
      'Moraleja: usá `const` por defecto, `let` si necesitás reasignar, y `var` nunca.'
    ]
  }
];

let loopOut = null;     // salida real (array de strings) del ejercicio abierto
let loopDeck = [];      // orden mezclado de las fichas
let loopAns = [];       // índices de loopOut elegidos por el usuario
let loopState = 'idle'; // idle | right | wrong | gaveup
let loopRun = 0;        // evita pisar la pantalla si cambiás de ejercicio mientras corre

/* Mezcla determinística (siempre igual para el mismo ejercicio) y nunca en el orden correcto */
function shuffled(n, seed) {
  const idx = [...Array(n).keys()];
  let s = seed * 9301 + 49297;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor(s / 233280 * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  if (n > 1 && idx.every((x, i) => x === i)) idx.push(idx.shift());
  return idx;
}

async function openLoop(i) {
  S.loop = i;
  save();
  loopOut = null; loopAns = []; loopState = 'idle';
  const run = ++loopRun;
  renderLoop();
  const { logs } = await runCode(LOOP[i].code);
  if (run !== loopRun) return;
  loopOut = logs.map((l) => l.text);
  loopDeck = shuffled(loopOut.length, i + 1);
  renderLoop();
}

function renderLoopList() {
  $('#loop-list').innerHTML = LOOP.map((ex, i) => {
    const cls = (S.loopDone[i] ? 'done' : '') + (i === S.loop ? ' cur' : '');
    return '<li class="' + cls + '"><button type="button" data-i="' + i + '" aria-label="Ejercicio ' + (i + 1) + ': ' + esc(ex.t) + '">' +
      '<span class="n">' + (S.loopDone[i] ? '✓' : i + 1) + '</span><span class="t">' + esc(ex.t) + '</span></button></li>';
  }).join('');
}

function renderLoop() {
  renderLoopList();
  const ex = LOOP[S.loop];
  const answered = loopState !== 'idle';
  let h = '<p class="kicker">Ejercicio ' + (S.loop + 1) + ' de ' + LOOP.length + '</p>' +
    '<h2>' + esc(ex.t) + '</h2>' +
    '<p class="desc">¿En qué orden se imprime? Tocá las salidas en el orden en que aparecen en la consola. Antes de comprobar, decí en voz alta por qué.</p>' +
    '<pre class="code">' + highlight(ex.code) + '</pre>';

  if (!loopOut) {
    h += '<p class="running">Corriendo el código…</p>';
  } else {
    const picked = loopAns.map((k, n) => '<span class="chip"><i>' + (n + 1) + '</i>' + esc(loopOut[k]) + '</span>').join('');
    h += '<div class="answer">' + (picked || '<span class="ph">Tu respuesta aparece acá</span>') + '</div>';
    if (!answered) {
      h += '<div class="chips">' + loopDeck.filter((k) => !loopAns.includes(k))
        .map((k) => '<button type="button" class="chip" data-k="' + k + '">' + esc(loopOut[k]) + '</button>').join('') + '</div>' +
        '<div class="row">' +
        '<button type="button" data-act="undo"' + (loopAns.length ? '' : ' disabled') + '>Borrar último</button>' +
        '<button type="button" data-act="clear"' + (loopAns.length ? '' : ' disabled') + '>Empezar de nuevo</button>' +
        '<button type="button" data-act="give">Me rindo</button>' +
        '<button type="button" class="primary push" data-act="check"' + (loopAns.length === loopOut.length ? '' : ' disabled') + '>Comprobar</button>' +
        '</div>';
    } else {
      if (loopState === 'right') h += '<div class="res ok">✓ Correcto. Ahora explicalo sin mirar la regla de arriba.</div>';
      if (loopState === 'wrong') h += '<div class="res bad">✗ No es ese orden. Así lo imprime el navegador:</div>';
      if (loopState === 'gaveup') h += '<div class="res bad">Así lo imprime el navegador. Leé el porqué y volvé a intentarlo más tarde.</div>';
      h += renderConsole(loopOut.map((text) => ({ kind: 'log', text }))) +
        '<h3>Por qué</h3><ol class="why">' + ex.why.map((w) => '<li>' + md(w) + '</li>').join('') + '</ol>' +
        '<div class="row">' +
        '<button type="button" data-act="retry">Reintentar</button>' +
        '<button type="button" data-act="play">Abrir en el playground</button>' +
        (S.loop < LOOP.length - 1 ? '<button type="button" class="primary push" data-act="next">Siguiente →</button>' : '') +
        '</div>';
    }
  }
  $('#loop-main').innerHTML = h;
}

$('#loop-list').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-i]');
  if (b) openLoop(+b.dataset.i);
});

$('#loop-main').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || !loopOut) return;
  if (b.dataset.k !== undefined) loopAns.push(+b.dataset.k);
  const act = b.dataset.act;
  if (act === 'undo') loopAns.pop();
  if (act === 'clear' || act === 'retry') { loopAns = []; loopState = 'idle'; }
  if (act === 'give') loopState = 'gaveup';
  if (act === 'check') {
    /* Se compara por texto: dos salidas iguales son intercambiables */
    const ok = loopAns.every((k, n) => loopOut[k] === loopOut[n]);
    loopState = ok ? 'right' : 'wrong';
    if (ok) { S.loopDone[S.loop] = true; save(); renderStats(); }
  }
  if (act === 'next') { openLoop(S.loop + 1); return; }
  if (act === 'play') { openInPlayground(LOOP[S.loop].code); return; }
  renderLoop();
});
