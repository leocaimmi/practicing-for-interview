/* Guía rápida: un tema por vez, con qué es, cuándo se usa, un ejemplo que corre de verdad y qué tener en cuenta. */

const GUIDE = [
  {
    g: 'Sintaxis', t: 'const y let',
    que: 'Son las dos formas de declarar variables desde ES6. `const` es para valores que no vas a reasignar; `let`, para los que sí.',
    cuando: 'Siempre `const` por defecto. `let` solo si la variable cambia (un contador, un acumulador). `var` es la forma vieja y ya no se usa.',
    code: `const nombre = 'Leo';
let intentos = 0;
intentos = intentos + 1;

console.log(nombre, intentos);

const usuario = { nombre: 'Leo' };
usuario.edad = 30; // válido: cambia el objeto, no la variable
console.log(usuario);`,
    ojo: [
      '`const` no congela el objeto: podés cambiar sus propiedades. Lo que no podés es hacer `usuario = otraCosa`.',
      'Las dos tienen scope de bloque: solo existen dentro de las llaves `{ }` donde se declararon.'
    ]
  },
  {
    g: 'Sintaxis', t: 'Arrow functions',
    que: 'Una forma más corta de escribir funciones: `(parámetros) => resultado`.',
    cuando: 'Para funciones chicas y, sobre todo, callbacks: lo que le pasás a `map`, `filter`, `then` o a un `onClick` en React.',
    code: `// Forma clásica
function doble(n) {
  return n * 2;
}

// Arrow con return implícito (sin llaves)
const triple = (n) => n * 3;

// Arrow con llaves: ahí sí hace falta return
const sumar = (a, b) => {
  const total = a + b;
  return total;
};

console.log(doble(2), triple(2), sumar(2, 3));`,
    ojo: [
      'Sin llaves, lo que está después de `=>` se devuelve solo. Con llaves, necesitás `return`.',
      'Para devolver un objeto sin `return`, va entre paréntesis: `() => ({ ok: true })`.',
      'No tienen `this` propio: usan el del lugar donde se escribieron.'
    ]
  },
  {
    g: 'Sintaxis', t: 'Template literals',
    que: 'Strings con comillas invertidas (backticks) donde podés meter variables con `${ }`.',
    cuando: 'Siempre que armes un texto con datos adentro, en vez de concatenar con `+`.',
    code: `const nombre = 'Leo';
const hora = '15:20';

console.log('Hola ' + nombre + ', la entrevista es a las ' + hora); // forma vieja
console.log(\`Hola \${nombre}, la entrevista es a las \${hora}\`);   // template literal
console.log(\`2 + 3 = \${2 + 3}\`); // adentro va cualquier expresión`,
    ojo: ['También permiten texto de varias líneas sin `\\n`.']
  },
  {
    g: 'Sintaxis', t: 'Parámetros por defecto',
    que: 'Un valor que toma el parámetro cuando no te lo pasan.',
    cuando: 'Para opciones que casi siempre valen lo mismo: página 1, 10 resultados, "invitado".',
    code: `const saludar = (nombre = 'invitado') => \`Hola, \${nombre}\`;

console.log(saludar('Leo'));
console.log(saludar());
console.log(saludar(undefined));
console.log(saludar(null)); // null no activa el valor por defecto`,
    ojo: ['Solo se usa cuando el argumento llega `undefined`. Con `null` o `\'\'` no.']
  },
  {
    g: 'Sintaxis', t: 'Destructuring de objetos',
    que: 'Sacar propiedades de un objeto a variables, en una sola línea.',
    cuando: 'Cuando vas a usar varias propiedades de un objeto. En React lo vas a ver en todas las props: `function Card({ titulo, texto })`.',
    code: `const usuario = { nombre: 'Leo', edad: 30, ciudad: 'Mar del Plata' };

// Sin destructuring
const n = usuario.nombre;

// Con destructuring
const { nombre, ciudad } = usuario;
console.log(nombre, ciudad);

// Con otro nombre y con valor por defecto
const { edad: años, pais = 'Argentina' } = usuario;
console.log(años, pais);

// En los parámetros de una función
const presentar = ({ nombre, ciudad }) => \`\${nombre} (\${ciudad})\`;
console.log(presentar(usuario));`,
    ojo: ['Si la propiedad no existe, la variable queda `undefined` (salvo que le pongas un valor por defecto).']
  },
  {
    g: 'Sintaxis', t: 'Destructuring de arrays',
    que: 'Lo mismo que con objetos, pero por posición en vez de por nombre.',
    cuando: 'Lo usás todo el tiempo en React: `const [contador, setContador] = useState(0)`.',
    code: `const colores = ['rojo', 'verde', 'azul'];

const [primero, segundo] = colores;
console.log(primero, segundo);

const [, , tercero] = colores; // se saltea con comas
console.log(tercero);

// Intercambiar dos variables
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b);`,
    ojo: ['El nombre lo elegís vos: lo que importa es la posición.']
  },
  {
    g: 'Sintaxis', t: 'Spread y rest (...)',
    que: 'Los tres puntos `...` hacen dos cosas opuestas. Spread "desarma" un array u objeto; rest "junta" varios valores en uno.',
    cuando: 'Spread para copiar y combinar sin modificar el original (clave en React). Rest para funciones que reciben una cantidad variable de argumentos.',
    code: `// Spread: copiar y agregar
const numeros = [1, 2, 3];
const masNumeros = [...numeros, 4, 5];
console.log(numeros, masNumeros);

const usuario = { nombre: 'Leo', edad: 30 };
const actualizado = { ...usuario, edad: 31 }; // copia y pisa edad
console.log(usuario, actualizado);

// Rest: juntar el resto
const sumarTodo = (...valores) => valores.reduce((total, v) => total + v, 0);
console.log(sumarTodo(1, 2, 3, 4));

const { nombre, ...resto } = actualizado;
console.log(nombre, resto);`,
    ojo: [
      'El spread hace una copia superficial: si hay objetos adentro, esos se siguen compartiendo.',
      'En React el estado se actualiza así: `setUsuario({ ...usuario, edad: 31 })`, nunca modificando el objeto.'
    ]
  },
  {
    g: 'Sintaxis', t: 'Optional chaining (?.) y ??',
    que: '`?.` lee una propiedad sin romper si algo en el camino es `null` o `undefined`. `??` da un valor de reemplazo cuando algo es `null` o `undefined`.',
    cuando: 'Con datos que vienen de una API y pueden venir incompletos.',
    code: `const usuario = { nombre: 'Leo', direccion: null };

// console.log(usuario.direccion.ciudad); // TypeError: no se puede leer de null
console.log(usuario.direccion?.ciudad);   // undefined, sin error

const ciudad = usuario.direccion?.ciudad ?? 'Sin ciudad';
console.log(ciudad);

// ?? contra ||
const cantidad = 0;
console.log(cantidad || 10); // 10: || reemplaza cualquier valor "falso" (0, '', false)
console.log(cantidad ?? 10); // 0: ?? solo reemplaza null y undefined`,
    ojo: ['Si el 0 o el texto vacío son valores válidos, usá `??` y no `||`.']
  },
  {
    g: 'Arrays', t: 'map: transformar cada elemento',
    que: 'Recorre el array y devuelve uno NUEVO, del mismo largo, con cada elemento transformado.',
    cuando: 'Cuando querés "lo mismo pero distinto": precios con IVA, solo los nombres, o en React, convertir datos en elementos de una lista.',
    code: `const productos = [
  { nombre: 'Yerba', precio: 3000 },
  { nombre: 'Termo', precio: 45000 }
];

const nombres = productos.map((p) => p.nombre);
const conIva = productos.map((p) => ({ ...p, precio: p.precio * 1.21 }));

console.log(nombres);
console.log(conIva);
console.log(productos); // el original no cambió`,
    ojo: ['`map` siempre devuelve algo por cada elemento. Si solo querés recorrer (loguear, guardar), usá `forEach`.']
  },
  {
    g: 'Arrays', t: 'filter: quedarse con algunos',
    que: 'Devuelve un array NUEVO solo con los elementos que cumplen una condición.',
    cuando: 'Buscar con un filtro, sacar un elemento de una lista (en React: borrar un ítem del estado).',
    code: `const tareas = [
  { id: 1, texto: 'Estudiar SQL', hecha: true },
  { id: 2, texto: 'Repasar React', hecha: false },
  { id: 3, texto: 'Practicar Linux', hecha: false }
];

const pendientes = tareas.filter((t) => !t.hecha);
console.log(pendientes.map((t) => t.texto));

// "Borrar" la tarea 2 sin modificar el original
const sinLa2 = tareas.filter((t) => t.id !== 2);
console.log(sinLa2.length, tareas.length);`,
    ojo: ['La función tiene que devolver `true` (se queda) o `false` (se va).']
  },
  {
    g: 'Arrays', t: 'reduce: juntar todo en un valor',
    que: 'Recorre el array acumulando un resultado: una suma, un total, un objeto agrupado.',
    cuando: 'Totales de un carrito, contar ocurrencias, agrupar.',
    code: `const carrito = [
  { nombre: 'Yerba', precio: 3000, cantidad: 2 },
  { nombre: 'Termo', precio: 45000, cantidad: 1 }
];

// (acumulador, elemento) => nuevo acumulador, valor inicial
const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
console.log(total);

// Paso a paso: acc empieza en 0 → 0 + 6000 = 6000 → 6000 + 45000 = 51000`,
    ojo: ['Poné siempre el valor inicial (el `0` del final). Sin él, con un array vacío tira error.']
  },
  {
    g: 'Arrays', t: 'find, some, every, includes',
    que: 'Preguntas rápidas sobre un array.',
    cuando: '`find` para buscar uno, `some` para "¿hay alguno?", `every` para "¿son todos?", `includes` para "¿está este valor?".',
    code: `const usuarios = [
  { id: 1, nombre: 'Ana', activo: true },
  { id: 2, nombre: 'Leo', activo: false }
];

console.log(usuarios.find((u) => u.id === 2));   // el objeto, o undefined
console.log(usuarios.some((u) => u.activo));     // true: hay al menos uno
console.log(usuarios.every((u) => u.activo));    // false: no son todos
console.log(['a', 'b'].includes('b'));           // true`,
    ojo: ['`find` devuelve el elemento; `filter` devuelve un array (aunque sea de uno).']
  },
  {
    g: 'Asincronía', t: 'Promesas: crearlas',
    que: 'Una promesa representa un resultado que todavía no está: va a llegar (resolve) o va a fallar (reject).',
    cuando: 'Rara vez las creás a mano; casi siempre las recibís (de `fetch`, de una librería). Crearlas sirve para convertir código con callbacks en promesas.',
    code: `const tirarDado = () => new Promise((resolve, reject) => {
  setTimeout(() => {
    const numero = Math.ceil(Math.random() * 6);
    if (numero === 1) reject(new Error('Salió 1, perdiste'));
    else resolve(numero);
  }, 300);
});

console.log('Tiro el dado...');
tirarDado()
  .then((n) => console.log('Salió', n))
  .catch((e) => console.log('Error:', e.message))
  .finally(() => console.log('Fin del tiro'));`,
    ojo: [
      'Una promesa está pendiente, cumplida o rechazada. Una vez que se cumple o se rechaza, no cambia más.',
      '`.then` recibe el valor, `.catch` el error y `.finally` corre siempre.'
    ]
  },
  {
    g: 'Asincronía', t: 'async / await',
    que: 'Otra forma de usar promesas: `await` espera el resultado y te lo da, y el código se lee de arriba abajo, como si fuera sincrónico.',
    cuando: 'Siempre que puedas, en lugar de encadenar `.then`. Solo se puede usar `await` dentro de una función `async`.',
    code: `const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function prepararMate() {
  console.log('Pongo el agua');
  await esperar(300);
  console.log('El agua está lista');
  await esperar(200);
  return 'Mate listo';
}

const resultado = await prepararMate();
console.log(resultado);`,
    ojo: [
      'Una función `async` siempre devuelve una promesa.',
      '`await` pausa esa función, no todo el programa: mientras espera, el navegador sigue respondiendo.'
    ]
  },
  {
    g: 'Asincronía', t: 'Errores con try / catch',
    que: 'Con `await`, si la promesa falla, el error se "tira" en esa línea y lo atrapás con `try/catch` como cualquier otro error.',
    cuando: 'Alrededor de todo pedido que pueda fallar (red, API caída), para mostrar un mensaje en vez de romper.',
    code: `const pedirDatos = async (ok) => {
  if (!ok) throw new Error('El servidor no responde');
  return { datos: [1, 2, 3] };
};

async function cargar(ok) {
  try {
    const respuesta = await pedirDatos(ok);
    console.log('Llegó:', respuesta.datos);
  } catch (error) {
    console.log('No se pudo cargar:', error.message);
  } finally {
    console.log('Ocultar el "cargando..."');
  }
}

await cargar(true);
await cargar(false);`,
    ojo: ['Si tenés `return` dentro del `try`, usá `return await`: sin el `await`, el error se escapa del `catch`.']
  },
  {
    g: 'Asincronía', t: 'Promise.all: en paralelo',
    que: 'Espera varias promesas a la vez y te da todos los resultados juntos, en el mismo orden.',
    cuando: 'Cuando tenés que hacer varios pedidos que no dependen uno del otro.',
    code: `const pedir = (nombre, ms) => new Promise((r) => setTimeout(() => r(nombre), ms));

let inicio = Date.now();
const a = await pedir('usuarios', 300);
const b = await pedir('productos', 300);
console.log('Uno después del otro:', Date.now() - inicio, 'ms');

inicio = Date.now();
const [c, d] = await Promise.all([pedir('usuarios', 300), pedir('productos', 300)]);
console.log('En paralelo:', Date.now() - inicio, 'ms', [c, d]);`,
    ojo: [
      'Si una sola falla, `Promise.all` falla entero. Si querés el resultado de cada una igual, está `Promise.allSettled`.',
      'Con `await` adentro de un `for` los pedidos van uno por uno; con `Promise.all`, todos juntos.'
    ]
  },
  {
    g: 'Asincronía', t: 'fetch: pedirle datos a una API',
    que: '`fetch(url)` hace un pedido HTTP y devuelve una promesa con la respuesta. El cuerpo se lee aparte con `res.json()`.',
    cuando: 'Para consumir cualquier API REST desde el navegador. Este ejemplo pega a una API de prueba real.',
    code: `const res = await fetch('https://jsonplaceholder.typicode.com/users/1');
console.log('Status:', res.status, 'ok:', res.ok);

if (!res.ok) throw new Error('HTTP ' + res.status);
const usuario = await res.json();
console.log(usuario.name, '-', usuario.email);

// POST con JSON
const creado = await fetch('https://jsonplaceholder.typicode.com/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Hola', userId: 1 })
});
console.log('POST:', creado.status, await creado.json());`,
    ojo: [
      '`fetch` NO falla con un 404 o un 500: hay que revisar `res.ok` a mano.',
      '`res.json()` también devuelve una promesa, por eso lleva `await`.'
    ]
  },
  {
    g: 'Asincronía', t: 'El event loop, resumido',
    que: 'JavaScript hace una cosa a la vez. Lo asincrónico no corre "en paralelo": queda en una fila esperando su turno.',
    cuando: 'Para predecir en qué orden se ejecuta el código (te lo pueden preguntar con un ejercicio).',
    code: `console.log('1. sincrónico');

setTimeout(() => console.log('4. setTimeout (macrotarea)'), 0);

Promise.resolve().then(() => console.log('3. then (microtarea)'));

console.log('2. sincrónico');`,
    ojo: [
      'Orden: primero todo lo sincrónico, después todas las microtareas (`then`, lo que sigue a un `await`) y recién después un `setTimeout`.',
      'Para practicarlo está la pestaña Event loop.'
    ]
  },
  {
    g: 'Asincronía', t: 'Módulos: import y export',
    que: 'Cada archivo es un módulo: exporta lo que quiere compartir e importa lo que necesita de otros.',
    cuando: 'En cualquier proyecto real (React, Node). Este ejemplo no se puede correr acá porque necesita dos archivos.',
    code: `// archivo api.js
export const getTurnos = () => fetch('/api/turnos');   // export con nombre
export default function App() {}                        // export por defecto (uno por archivo)

// archivo main.js
import App, { getTurnos } from './api.js';`,
    run: false,
    ojo: [
      'Lo que tiene nombre se importa con llaves y con ese nombre exacto. El default se importa sin llaves y con el nombre que quieras.',
      'En Node viejo vas a ver otra sintaxis (CommonJS): `require()` y `module.exports`.'
    ]
  }
];

let guideRun = 0;

async function openGuide(i) {
  S.guide = i;
  S.guideSeen[i] = true;
  save();
  renderGuide(null);
  $('#guide-main').scrollTop = 0;
  const topic = GUIDE[i];
  if (topic.run === false) return;
  const run = ++guideRun;
  const { logs } = await runCode(topic.code, { limit: 8000 });
  if (run === guideRun) renderGuide(logs);
}

function renderGuide(logs) {
  const list = $('#guide-list');
  list.innerHTML = listHTML(GUIDE, S.guide, (x, i) => S.guideSeen[i], 'Tema');
  keepInView(list, $('.cur', list));

  const x = GUIDE[S.guide];
  let h = '<p class="kicker">' + esc(x.g) + ' · tema ' + (S.guide + 1) + ' de ' + GUIDE.length + '</p>' +
    '<h2>' + esc(x.t) + '</h2>' +
    '<div class="desc"><p>' + md(x.que) + '</p></div>' +
    '<h3>Cuándo lo usás</h3><div class="desc"><p>' + md(x.cuando) + '</p></div>' +
    '<h3>Ejemplo</h3><pre class="code">' + highlight(x.code) + '</pre>';
  if (x.run !== false) h += '<h3>Qué imprime</h3>' + (logs ? renderConsole(logs) : '<p class="running">Corriendo el ejemplo…</p>');
  h += '<h3>Tené en cuenta</h3><ul class="notes">' + x.ojo.map((o) => '<li>' + md(o) + '</li>').join('') + '</ul>' +
    '<div class="row">' +
    '<button type="button" data-act="prev"' + (S.guide ? '' : ' disabled') + '>← Anterior</button>' +
    (x.run !== false ? '<button type="button" data-act="play">Probar en el playground</button>' : '') +
    (S.guide < GUIDE.length - 1 ? '<button type="button" class="primary push" data-act="next">Siguiente →</button>' : '') +
    '</div>';
  $('#guide-main').innerHTML = h;
}

$('#guide-list').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-i]');
  if (b) openGuide(+b.dataset.i);
});

$('#guide-main').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  if (b.dataset.act === 'prev') openGuide(S.guide - 1);
  if (b.dataset.act === 'next') openGuide(S.guide + 1);
  if (b.dataset.act === 'play') openInPlayground(GUIDE[S.guide].code);
});
