/* Preguntas de entrevista como tarjetas: primero la respondés en voz alta, después ves
   la respuesta corta (lo que dirías), la explicación simple y un ejemplo que corre. */

const QUESTIONS = [
  {
    g: 'Asincronía', t: '¿Qué es una promesa?',
    corta: 'Es un objeto que representa un resultado que todavía no llegó: puede terminar bien (se cumple) o mal (se rechaza).',
    explica: [
      'Pensalo como el ticket que te dan en una casa de comidas: todavía no tenés la comida, pero tenés algo que te avisa cuando está lista o si hubo un problema.',
      'Con `.then` decís qué hacer cuando llega el resultado y con `.catch` qué hacer si falla.'
    ],
    code: `const pedido = new Promise((resolve) => {
  setTimeout(() => resolve('Tu pedido está listo'), 300);
});

console.log('Pedí la comida');
pedido.then((mensaje) => console.log(mensaje));`
  },
  {
    g: 'Asincronía', t: '¿Qué hacen async y await?',
    corta: 'Son una forma más cómoda de usar promesas: `await` espera el resultado y el código se lee de arriba abajo, como si fuera sincrónico.',
    explica: [
      '`async` se pone adelante de una función y hace que siempre devuelva una promesa.',
      '`await` solo se usa adentro de una función `async`: frena esa función hasta que la promesa responda y te da el valor directamente, sin `.then`.',
      'Si la promesa falla, el error se atrapa con `try/catch`.'
    ],
    code: `const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function saludar() {
  console.log('Hola...');
  await esperar(300);
  console.log('...300 ms después');
}

await saludar();`
  },
  {
    g: 'Asincronía', t: '¿await bloquea el programa?',
    corta: 'No. Pausa solo la función donde está; el resto del programa sigue funcionando mientras tanto.',
    explica: [
      'Mientras una función espera en un `await`, JavaScript atiende otras cosas: clics, otros timers, otras respuestas.',
      'Por eso una página no se congela mientras espera datos de una API.'
    ],
    code: `const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function tareaLenta() {
  await esperar(300);
  console.log('Terminó la tarea lenta');
}

tareaLenta();
console.log('Esto se imprime primero: el programa no se frenó');`
  },
  {
    g: 'Asincronía', t: '¿Qué es el event loop?',
    corta: 'Es el mecanismo que le permite a JavaScript, que hace una sola cosa a la vez, manejar tareas asincrónicas: las pone en una fila y las ejecuta cuando termina lo que está haciendo.',
    explica: [
      'Primero corre todo el código sincrónico.',
      'Después corren las microtareas: los `.then` y lo que sigue a un `await`.',
      'Recién después corre una macrotarea, como un `setTimeout`. Y el ciclo se repite.'
    ],
    code: `console.log('1');
setTimeout(() => console.log('4'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('2');`
  },
  {
    g: 'Asincronía', t: '¿Por qué un setTimeout con 0 no se ejecuta enseguida?',
    corta: 'Porque el 0 no significa "ahora", significa "lo antes posible": el callback espera a que termine todo el código sincrónico y las promesas pendientes.',
    explica: [
      '`setTimeout` manda la función a la fila de macrotareas, que es la última en atenderse.',
      'Por eso un `.then` siempre sale antes que un `setTimeout(fn, 0)`.'
    ],
    code: `setTimeout(() => console.log('setTimeout 0'), 0);
Promise.resolve().then(() => console.log('then'));
console.log('sincrónico');`
  },
  {
    g: 'Asincronía', t: '¿Promise.all, allSettled o race?',
    corta: '`all` espera todas y falla si falla una; `allSettled` espera todas y te cuenta cómo le fue a cada una; `race` se queda con la primera que termine.',
    explica: [
      '`Promise.all`: para pedidos que necesitás todos (si falta uno, no sirve el resto).',
      '`Promise.allSettled`: cuando querés mostrar lo que sí llegó aunque algo falle.',
      '`Promise.race`: típico para poner un tiempo límite a un pedido.'
    ],
    code: `const ok = (v, ms) => new Promise((r) => setTimeout(() => r(v), ms));
const falla = () => Promise.reject(new Error('falló'));

console.log(await Promise.all([ok('a', 50), ok('b', 100)]));
console.log((await Promise.allSettled([ok('a', 50), falla()])).map((r) => r.status));
console.log(await Promise.race([ok('lento', 200), ok('rápido', 50)]));`
  },
  {
    g: 'Asincronía', t: '¿Cómo hacés varios pedidos en paralelo?',
    corta: 'Los lanzo todos juntos y los espero con `Promise.all`; así tarda lo que tarda el más lento y no la suma de todos.',
    explica: [
      'Si ponés `await` adentro de un `for`, cada pedido espera al anterior: van uno por uno.',
      'Eso solo tiene sentido cuando un pedido necesita el resultado del anterior.',
      'Cuidado con `forEach` y funciones `async`: `forEach` no espera a nadie.'
    ],
    code: `const pedir = (id) => new Promise((r) => setTimeout(() => r('usuario ' + id), 200));

const inicio = Date.now();
const usuarios = await Promise.all([1, 2, 3].map((id) => pedir(id)));
console.log(usuarios, Date.now() - inicio, 'ms');`
  },
  {
    g: 'Asincronía', t: '¿Por qué fetch no da error con un 404 o un 500?',
    corta: 'Porque para `fetch` el pedido salió bien: el servidor respondió. Solo falla si no hubo respuesta (sin internet, error de red). El status lo tengo que revisar yo con `res.ok`.',
    explica: [
      '`res.ok` es `true` si el status está entre 200 y 299.',
      'Por eso siempre va: `if (!res.ok) throw new Error(\'HTTP \' + res.status)`.'
    ],
    code: `const res = await fetch('https://jsonplaceholder.typicode.com/posts/999999');
console.log('¿Falló fetch? No. Status:', res.status, 'ok:', res.ok);`
  },
  {
    g: 'Lenguaje', t: '¿var, let o const?',
    corta: 'Uso `const` por defecto, `let` cuando el valor cambia y `var` nunca, porque tiene reglas de alcance que generan errores.',
    explica: [
      '`const` y `let` existen solo dentro de las llaves `{ }` donde se declaran.',
      '`var` existe en toda la función, y eso produce sorpresas, por ejemplo en un `for` con `setTimeout`.'
    ],
    code: `for (var i = 0; i < 3; i++) setTimeout(() => console.log('var', i));
for (let j = 0; j < 3; j++) setTimeout(() => console.log('let', j));`
  },
  {
    g: 'Lenguaje', t: '¿Qué diferencia hay entre una arrow function y una function?',
    corta: 'La arrow es más corta y no tiene `this` propio: usa el `this` del lugar donde se escribió.',
    explica: [
      'Para callbacks (`map`, `then`, eventos) la arrow es la opción natural.',
      'Además, la arrow no se puede usar con `new` y no tiene `arguments`.',
      'Si la guardás en un `const`, no la podés usar antes de declararla; una `function` declarada sí.'
    ],
    code: `const numeros = [1, 2, 3];

const dobles1 = numeros.map(function (n) { return n * 2; });
const dobles2 = numeros.map((n) => n * 2);

console.log(dobles1, dobles2);`
  },
  {
    g: 'Lenguaje', t: '¿Qué es un closure?',
    corta: 'Es una función que recuerda las variables del lugar donde fue creada, aunque ese lugar ya haya terminado de ejecutarse.',
    explica: [
      'En el ejemplo, `contar` sigue viendo la variable `cuenta` aunque `crearContador` ya terminó.',
      'Nadie de afuera puede tocar `cuenta`: es una forma de tener datos privados.',
      'React usa esta idea en los hooks.'
    ],
    code: `function crearContador() {
  let cuenta = 0;
  return () => {
    cuenta++;
    return cuenta;
  };
}

const contar = crearContador();
console.log(contar(), contar(), contar());`
  },
  {
    g: 'Lenguaje', t: '¿== o ===?',
    corta: 'Siempre `===`: compara valor y tipo. `==` convierte los tipos antes de comparar y da resultados raros.',
    explica: ['Con `==`, el texto `\'1\'` y el número `1` son iguales. Con `===`, no.'],
    code: `console.log('1' == 1);   // true
console.log('1' === 1);  // false
console.log(0 == '');    // true (raro)
console.log(0 === '');   // false`
  },
  {
    g: 'Lenguaje', t: '¿null o undefined?',
    corta: '`undefined` es "no tiene valor asignado"; `null` es "vacío a propósito", lo pone el programador.',
    explica: [
      'Una variable declarada sin valor, o una propiedad que no existe, da `undefined`.',
      '`null` lo usás vos para decir "acá no hay nada", por ejemplo cuando todavía no hay usuario logueado.'
    ],
    code: `let sinValor;
const usuario = { nombre: 'Leo', telefono: null };

console.log(sinValor);          // undefined: nunca se asignó
console.log(usuario.email);     // undefined: no existe
console.log(usuario.telefono);  // null: vacío a propósito`
  },
  {
    g: 'Lenguaje', t: '¿map o forEach?',
    corta: '`map` devuelve un array nuevo con cada elemento transformado; `forEach` solo recorre y no devuelve nada.',
    explica: [
      'Si necesitás el resultado, `map`. Si solo querés hacer algo con cada elemento (mostrarlo, guardarlo), `forEach`.',
      'En React se usa `map` para convertir datos en una lista de elementos.'
    ],
    code: `const numeros = [1, 2, 3];

const dobles = numeros.map((n) => n * 2);
const resultado = numeros.forEach((n) => n * 2);

console.log(dobles);     // [ 2, 4, 6 ]
console.log(resultado);  // undefined`
  },
  {
    g: 'Lenguaje', t: '¿Qué es una copia superficial?',
    corta: 'Es una copia que duplica solo el primer nivel: si adentro hay otros objetos, la copia y el original los siguen compartiendo.',
    explica: [
      '`{ ...obj }` y `[...arr]` hacen copias superficiales.',
      'Para copiar todo, incluso lo anidado, existe `structuredClone(obj)`.',
      'Importa en React: nunca hay que modificar el estado directamente.'
    ],
    code: `const original = { nombre: 'Leo', direccion: { ciudad: 'MDP' } };
const copia = { ...original };

copia.nombre = 'Ana';                // no afecta al original
copia.direccion.ciudad = 'CABA';     // ¡sí afecta! se comparte

console.log(original.nombre, original.direccion.ciudad);`
  },
  {
    g: 'Lenguaje', t: '¿Qué es JSON?',
    corta: 'Es un formato de texto para intercambiar datos, por ejemplo entre el frontend y una API. Se parece a un objeto de JavaScript, pero es texto.',
    explica: [
      '`JSON.stringify(objeto)` convierte un objeto en texto (para mandarlo).',
      '`JSON.parse(texto)` convierte el texto en objeto (para usarlo).',
      'Es más estricto que un objeto: comillas dobles en las claves y no admite funciones.'
    ],
    code: `const usuario = { nombre: 'Leo', edad: 30 };

const texto = JSON.stringify(usuario);
console.log(texto, typeof texto);

const deVuelta = JSON.parse(texto);
console.log(deVuelta.nombre, typeof deVuelta);`
  },
  {
    g: 'Lenguaje', t: '¿Qué trajo ES6?',
    corta: '`let` y `const`, arrow functions, template literals, destructuring, spread y rest, parámetros por defecto, clases, módulos con `import`/`export` y promesas.',
    explica: [
      'ES6 (también llamado ES2015) fue el gran cambio del lenguaje.',
      'Después llegaron `async/await` (2017) y `?.` y `??` (2020).',
      'Cada uno de estos temas tiene su ficha en la Guía rápida.'
    ]
  }
];

let qOpen = false;  // respuesta visible
let qLogs = null;   // salida del ejemplo (null mientras corre)
let qRun = 0;

function openQuestion(i) {
  S.question = i;
  save();
  qOpen = false;
  qLogs = null;
  qRun++;
  renderQuestion();
  $('#q-main').scrollTop = 0;
}

async function revealQuestion() {
  qOpen = true;
  const q = QUESTIONS[S.question];
  renderQuestion();
  scrollInside($('#q-main'), $('#q-answer'));
  if (!q.code) return;
  const run = ++qRun;
  const { logs } = await runCode(q.code, { limit: 8000 });
  if (run !== qRun || !qOpen) return;
  qLogs = logs;
  const top = $('#q-main').scrollTop;
  renderQuestion();
  $('#q-main').scrollTop = top;
}

function renderQuestion() {
  const list = $('#q-list');
  list.innerHTML = listHTML(QUESTIONS, S.question, (q) => S.qKnown[q.t], 'Pregunta');
  keepInView(list, $('.cur', list));

  const q = QUESTIONS[S.question];
  const known = !!S.qKnown[q.t];
  let h = '<p class="kicker">' + esc(q.g) + ' · pregunta ' + (S.question + 1) + ' de ' + QUESTIONS.length + '</p>' +
    '<h2>' + esc(q.t) + '</h2>';
  if (!qOpen) {
    h += '<div class="tip"><strong>Respondé en voz alta antes de mirar.</strong><p>Como en la entrevista: una frase corta primero y, si te piden más, un ejemplo.</p></div>' +
      '<div class="row"><button type="button" class="primary" data-act="reveal">Ver respuesta</button></div>';
  } else {
    h += '<div id="q-answer"><h3>Respuesta corta</h3><div class="say">' + md(q.corta) + '</div>' +
      '<h3>Explicado simple</h3><ul class="notes">' + q.explica.map((p) => '<li>' + md(p) + '</li>').join('') + '</ul>';
    if (q.code) {
      h += '<h3>Ejemplo</h3><pre class="code">' + highlight(q.code) + '</pre>' +
        '<h3>Qué imprime</h3>' + (qLogs ? renderConsole(qLogs) : '<p class="running">Corriendo el ejemplo…</p>');
    }
    h += '</div><div class="row">' +
      '<button type="button" data-act="known">' + (known ? '✓ La sé (desmarcar)' : 'La sé') + '</button>' +
      (q.code ? '<button type="button" data-act="play">Probar en el playground</button>' : '') +
      '</div>';
  }
  h += '<div class="row">' +
    '<button type="button" data-act="prev"' + (S.question ? '' : ' disabled') + '>← Anterior</button>' +
    (S.question < QUESTIONS.length - 1 ? '<button type="button" class="primary push" data-act="next">Siguiente →</button>' : '') +
    '</div>';
  $('#q-main').innerHTML = h;
}

$('#q-list').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-i]');
  if (b) openQuestion(+b.dataset.i);
});

$('#q-main').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  const q = QUESTIONS[S.question];
  const act = b.dataset.act;
  if (act === 'reveal') revealQuestion();
  if (act === 'prev') openQuestion(S.question - 1);
  if (act === 'next') openQuestion(S.question + 1);
  if (act === 'play') openInPlayground(q.code);
  if (act === 'known') {
    if (S.qKnown[q.t]) delete S.qKnown[q.t];
    else S.qKnown[q.t] = true;
    save();
    renderStats();
    const top = $('#q-main').scrollTop;
    renderQuestion();
    $('#q-main').scrollTop = top;
  }
});
