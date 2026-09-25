/* Katas: escribís el código a mano y lo validan tests que corren en el navegador.
   Cada kata: id, t (título), d (enunciado con `código`), start (código inicial), exports (lo que se testea),
   tests(ex, t, m) con las funciones exportadas, el tester y los mocks, sol (solución) y why (cómo defenderla). */

/* Mocks que ven las katas: una API con demora, un callback estilo Node y un fetch simulado */
function makeMocks() {
  const USERS = {
    1: { id: 1, name: 'Leanne Graham', email: 'Sincere@april.biz' },
    2: { id: 2, name: 'Ervin Howell', email: 'Shanna@melissa.tv' },
    3: { id: 3, name: 'Clementine Bauch', email: 'Nathan@yesenia.net' }
  };
  const stats = { llamadas: 0, enVuelo: 0, max: 0 };
  const api = {
    stats,
    getUser(id) {
      stats.llamadas++;
      stats.enVuelo++;
      stats.max = Math.max(stats.max, stats.enVuelo);
      return new Promise((resolve, reject) => setTimeout(() => {
        stats.enVuelo--;
        if (USERS[id]) resolve({ ...USERS[id] });
        else reject(new Error('Usuario ' + id + ' no encontrado'));
      }, 60));
    }
  };

  const ARCHIVOS = { 'notas.txt': 'Lunes 28/09 15:20, Catamarca 3265' };
  const leerArchivo = (nombre, callback) => setTimeout(() => {
    if (nombre in ARCHIVOS) callback(null, ARCHIVOS[nombre]);
    else callback(new Error("ENOENT: no such file or directory, open '" + nombre + "'"));
  }, 30);

  /* fetch simulado con la forma de una Response real: ok, status, json() */
  const POSTS = {
    1: [
      { userId: 1, id: 1, title: 'sunt aut facere repellat provident' },
      { userId: 1, id: 2, title: 'qui est esse' },
      { userId: 1, id: 3, title: 'ea molestias quasi exercitationem' }
    ],
    2: [{ userId: 2, id: 11, title: 'et ea vero quia laudantium autem' }]
  };
  const pedidos = [];
  const fetch = (url) => {
    pedidos.push(String(url));
    const m = String(url).match(/\/posts\?userId=(\d+)/);
    const id = m ? +m[1] : NaN;
    const status = id === 0 ? 500 : m ? 200 : 404;
    const body = status === 200 ? POSTS[id] || [] : { error: status === 500 ? 'Internal Server Error' : 'Not Found' };
    return new Promise((resolve) => setTimeout(() => resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText: { 200: 'OK', 404: 'Not Found', 500: 'Internal Server Error' }[status],
      json: async () => JSON.parse(JSON.stringify(body)),
      text: async () => JSON.stringify(body)
    }), 40));
  };
  fetch.pedidos = pedidos;

  return { api, leerArchivo, fetch };
}

const KATAS = [
  {
    id: 'arrow',
    t: 'Arrow functions',
    d: 'Reescribí las tres funciones como arrow functions guardadas en `const`. Aprovechá el return implícito.',
    start: `// Reescribí estas funciones como arrow functions
function doble(n) {
  return n * 2;
}

function sumar(a, b) {
  return a + b;
}

function esPar(n) {
  return n % 2 === 0;
}

console.log(doble(4), sumar(2, 3), esPar(7));
`,
    exports: ['doble', 'sumar', 'esPar'],
    async tests(ex, t) {
      await t.eq('`doble(4)` devuelve 8', () => ex.doble(4), 8);
      await t.eq('`sumar(2, 3)` devuelve 5', () => ex.sumar(2, 3), 5);
      await t.eq('`esPar(4)` devuelve true', () => ex.esPar(4), true);
      await t.eq('`esPar(7)` devuelve false', () => ex.esPar(7), false);
      t.src('Usás `=>`', /=>/);
      t.src('No queda ninguna `function`', /\bfunction\b/, false, 'Todavía hay alguna declarada con function.');
    },
    sol: `const doble = (n) => n * 2;
const sumar = (a, b) => a + b;
const esPar = (n) => n % 2 === 0;`,
    why: [
      'Si el cuerpo es una sola expresión, la arrow la devuelve sola (return implícito). Si abrís llaves, necesitás `return`.',
      'Diferencias con `function`: no tiene su propio `this` (usa el del contexto donde se escribió), no tiene `arguments` y no se puede usar con `new`.',
      'Al estar en un `const` no hay hoisting: no la podés llamar antes de la línea donde se declara.'
    ]
  },
  {
    id: 'objeto',
    t: 'Devolver un objeto desde una arrow',
    d: 'Escribí `crearUsuario` como arrow que reciba `nombre` y `edad` y devuelva `{ nombre, edad, activo: true }`. Sin escribir `return`.',
    start: `// const crearUsuario = ...

console.log(crearUsuario('Leo', 30));
`,
    exports: ['crearUsuario'],
    async tests(ex, t) {
      await t.eq("`crearUsuario('Leo', 30)`", () => ex.crearUsuario('Leo', 30), { nombre: 'Leo', edad: 30, activo: true });
      await t.eq("`crearUsuario('Ana', 25)`", () => ex.crearUsuario('Ana', 25), { nombre: 'Ana', edad: 25, activo: true });
      t.src('Sin `return`', /\breturn\b/, false, 'Se puede resolver con return implícito.');
    },
    sol: `const crearUsuario = (nombre, edad) => ({ nombre, edad, activo: true });`,
    why: [
      'Las llaves después de `=>` se interpretan como el cuerpo de la función, no como un objeto. Por eso el objeto va entre paréntesis: `=> ({ ... })`.',
      '`{ nombre, edad }` es la forma corta (shorthand) de `{ nombre: nombre, edad: edad }`.'
    ]
  },
  {
    id: 'template',
    t: 'Template literals y parámetros por defecto',
    d: '`saludar(nombre, hora)` devuelve `Buen día, Leo!` si la hora es menor a 12 y `Buenas tardes, Leo!` si no. Si no pasan nombre, usa `invitado`. Usá template literals y un parámetro por defecto.',
    start: `// const saludar = ...

console.log(saludar('Leo', 9));
console.log(saludar(undefined, 16));
`,
    exports: ['saludar'],
    async tests(ex, t) {
      await t.eq("`saludar('Leo', 9)`", () => ex.saludar('Leo', 9), 'Buen día, Leo!');
      await t.eq("`saludar('Leo', 15)`", () => ex.saludar('Leo', 15), 'Buenas tardes, Leo!');
      await t.eq('`saludar(undefined, 9)`', () => ex.saludar(undefined, 9), 'Buen día, invitado!');
      t.src('Usás template literals (backticks)', /`/);
      t.src("Parámetro por defecto `nombre = 'invitado'`", /nombre\s*=\s*['"`]invitado['"`]/);
    },
    sol: `const saludar = (nombre = 'invitado', hora) => {
  const saludo = hora < 12 ? 'Buen día' : 'Buenas tardes';
  return \`\${saludo}, \${nombre}!\`;
};`,
    why: [
      'El valor por defecto solo se usa cuando el argumento llega `undefined`. Con `null` o con `\'\'` no se aplica.',
      'Los template literals interpolan con `${...}` cualquier expresión y permiten strings de varias líneas.',
      'El ternario `condición ? a : b` es una expresión, por eso se puede asignar directo a una variable.'
    ]
  },
  {
    id: 'spread',
    t: 'Destructuring y spread sin mutar',
    d: '`actualizar(usuario, cambios)` devuelve un usuario NUEVO con los cambios aplicados, sin tocar el original. `presentar(usuario)` usa destructuring en el parámetro y devuelve `Leo (Mar del Plata)`.',
    start: `const leo = { nombre: 'Leo', edad: 30, ciudad: 'Mar del Plata' };

// const actualizar = ...
// const presentar = ...

console.log(actualizar(leo, { edad: 31 }));
console.log(presentar(leo));
`,
    exports: ['actualizar', 'presentar'],
    async tests(ex, t) {
      const u = { nombre: 'Leo', edad: 30, ciudad: 'Mar del Plata' };
      let nuevo;
      await t.eq('`actualizar(u, { edad: 31 })`', () => (nuevo = ex.actualizar(u, { edad: 31 })), { nombre: 'Leo', edad: 31, ciudad: 'Mar del Plata' });
      await t.ok('El original no cambió', () => u.edad === 30, 'Mutaste el objeto original: devolvé uno nuevo con { ...usuario, ...cambios }.');
      await t.ok('Devuelve otro objeto (otra referencia)', () => nuevo !== u);
      await t.eq('`presentar(u)`', () => ex.presentar(u), 'Leo (Mar del Plata)');
      t.src('Usás spread `...`', /\.\.\./);
      t.src('Destructuring en el parámetro `({ ... })`', /\(\s*\{[^}]*\}\s*\)\s*=>|function\s*\w*\s*\(\s*\{/);
    },
    sol: `const actualizar = (usuario, cambios) => ({ ...usuario, ...cambios });
const presentar = ({ nombre, ciudad }) => \`\${nombre} (\${ciudad})\`;`,
    why: [
      '`{ ...usuario, ...cambios }` crea un objeto nuevo: copia las propiedades del usuario y después pisa las que vienen en cambios.',
      'Es lo mismo que hacés en React con el estado: no se muta, se crea uno nuevo, porque React detecta el cambio comparando referencias.',
      'El spread copia solo el primer nivel (copia superficial). Si hay objetos anidados siguen compartidos; para copia profunda existe `structuredClone`.',
      'Destructuring en el parámetro saca las propiedades que necesitás y deja claro qué usa la función.'
    ]
  },
  {
    id: 'arrays',
    t: 'map, filter y reduce',
    d: '`nombresConStock(productos)` devuelve los nombres de los productos con stock mayor a 0. `valorInventario(productos)` devuelve la suma de `precio * stock`. Sin `for`: usá `filter`, `map` y `reduce`.',
    start: `const PRODUCTOS = [
  { nombre: 'Yerba', precio: 3000, stock: 10 },
  { nombre: 'Mate', precio: 12000, stock: 0 },
  { nombre: 'Termo', precio: 45000, stock: 3 },
  { nombre: 'Bombilla', precio: 5000, stock: 25 }
];

// const nombresConStock = ...
// const valorInventario = ...

console.log(nombresConStock(PRODUCTOS));
console.log(valorInventario(PRODUCTOS));
`,
    exports: ['nombresConStock', 'valorInventario'],
    async tests(ex, t) {
      const P = [
        { nombre: 'Yerba', precio: 3000, stock: 10 },
        { nombre: 'Mate', precio: 12000, stock: 0 },
        { nombre: 'Termo', precio: 45000, stock: 3 },
        { nombre: 'Bombilla', precio: 5000, stock: 25 }
      ];
      await t.eq('`nombresConStock(P)`', () => ex.nombresConStock(P), ['Yerba', 'Termo', 'Bombilla']);
      await t.eq('`valorInventario(P)`', () => ex.valorInventario(P), 290000);
      await t.eq('`valorInventario([])` con array vacío', () => ex.valorInventario([]), 0);
      t.src('Usás `.filter`', /\.filter\(/);
      t.src('Usás `.map`', /\.map\(/);
      t.src('Usás `.reduce`', /\.reduce\(/);
      t.src('Sin `for`', /\bfor\b/, false);
    },
    sol: `const nombresConStock = (productos) =>
  productos
    .filter((p) => p.stock > 0)
    .map((p) => p.nombre);

const valorInventario = (productos) =>
  productos.reduce((total, p) => total + p.precio * p.stock, 0);`,
    why: [
      '`filter` se queda con los elementos que cumplen la condición, `map` transforma cada uno y `reduce` los acumula en un solo valor.',
      'Ninguno modifica el array original: devuelven uno nuevo (o un valor). Por eso encadenarlos es seguro.',
      'El `0` del final es el valor inicial del acumulador. Sin él, `reduce` sobre un array vacío tira `TypeError`.',
      '`map` vs `forEach`: `map` devuelve un array nuevo; `forEach` no devuelve nada y es solo para efectos (loguear, guardar).'
    ]
  },
  {
    id: 'closure',
    t: 'Closures: un contador privado',
    d: '`crearContador(inicial)` devuelve un objeto con `incrementar()`, `decrementar()` y `valor()`. La cuenta tiene que ser privada: que no se pueda leer ni cambiar desde afuera. Si no pasan `inicial`, arranca en 0.',
    start: `// function crearContador(inicial) { ... }

const c = crearContador();
c.incrementar();
c.incrementar();
console.log(c.valor());
`,
    exports: ['crearContador'],
    async tests(ex, t) {
      const c1 = ex.crearContador();
      await t.eq('Arranca en 0 y después de dos `incrementar()` vale 2', () => { c1.incrementar(); c1.incrementar(); return c1.valor(); }, 2);
      const c2 = ex.crearContador(10);
      await t.eq('`crearContador(10)` y un `decrementar()` vale 9', () => { c2.decrementar(); return c2.valor(); }, 9);
      await t.eq('Cada contador es independiente', () => c1.valor(), 2);
      await t.ok('La cuenta no está expuesta como propiedad', () => Object.values(ex.crearContador(5)).every((v) => typeof v === 'function'),
        'El objeto devuelto tiene una propiedad que no es función: la cuenta tiene que vivir en una variable local.');
    },
    sol: `function crearContador(inicial = 0) {
  let cuenta = inicial;
  return {
    incrementar: () => { cuenta++; },
    decrementar: () => { cuenta--; },
    valor: () => cuenta
  };
}`,
    why: [
      'Un closure es una función que recuerda las variables del scope donde se creó, aunque ese scope ya haya terminado.',
      '`cuenta` es local de `crearContador`: cuando la función termina, las tres arrow functions la siguen viendo, pero nadie más.',
      'Cada llamada a `crearContador` crea una `cuenta` nueva, por eso los contadores son independientes.',
      'Es la misma idea que usa React: un hook como `useState` recuerda valores entre renders gracias a closures.'
    ]
  },
  {
    id: 'sleep',
    t: 'Tu primera promesa: esperar(ms)',
    d: 'Escribí `esperar(ms)` que devuelva una promesa que se resuelva después de `ms` milisegundos. Es el `sleep` que JavaScript no trae.',
    start: `// const esperar = ...

console.log('antes');
await esperar(500);
console.log('medio segundo después');
`,
    exports: ['esperar'],
    async tests(ex, t) {
      await t.ok('Devuelve una promesa', () => ex.esperar(1) instanceof Promise, 'Tiene que devolver new Promise(...).');
      await t.ok('Tarda al menos lo que le pedís (100 ms)', async () => {
        const t0 = performance.now();
        await ex.esperar(100);
        return performance.now() - t0 >= 95;
      }, 'Se resolvió antes de tiempo.');
      await t.ok('No tarda de más (menos de 300 ms para 100)', async () => {
        const t0 = performance.now();
        await ex.esperar(100);
        return performance.now() - t0 < 300;
      });
    },
    sol: `const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));`,
    why: [
      '`new Promise` recibe una función (el executor) con dos parámetros: `resolve` para cumplirla y `reject` para rechazarla.',
      'Acá le paso `resolve` directo a `setTimeout`: cuando vence el timer, la promesa se cumple.',
      'Es el patrón base para convertir cualquier API de callbacks en una promesa.',
      'Una promesa tiene tres estados: pendiente, cumplida (fulfilled) o rechazada (rejected). Una vez que se asienta, no cambia más.'
    ]
  },
  {
    id: 'reject',
    t: 'Rechazar una promesa',
    d: '`dividir(a, b)` devuelve una promesa que se resuelve con `a / b`, o se rechaza con `new Error(\'No se puede dividir por cero\')` si `b` es 0.',
    start: `// const dividir = ...

dividir(10, 2).then((r) => console.log('resultado', r));
dividir(1, 0).catch((e) => console.log('error:', e.message));
`,
    exports: ['dividir'],
    async tests(ex, t) {
      await t.ok('Devuelve una promesa', () => ex.dividir(1, 1) instanceof Promise);
      await t.eq('`dividir(10, 2)` se resuelve con 5', () => ex.dividir(10, 2), 5);
      await t.rejects('`dividir(1, 0)` se rechaza con el mensaje correcto', () => ex.dividir(1, 0), 'No se puede dividir por cero');
    },
    sol: `const dividir = (a, b) => new Promise((resolve, reject) => {
  if (b === 0) {
    reject(new Error('No se puede dividir por cero'));
    return;
  }
  resolve(a / b);
});

// Equivalente con async: throw adentro de una async = promesa rechazada
// const dividir = async (a, b) => {
//   if (b === 0) throw new Error('No se puede dividir por cero');
//   return a / b;
// };`,
    why: [
      'Rechazo con un `Error` y no con un string: así el que lo reciba tiene `message` y el stack trace.',
      'El `return` después del `reject` evita seguir ejecutando: `reject` no corta la función por sí solo.',
      'En una función `async`, `throw` rechaza la promesa que devuelve y `return` la resuelve. Son las dos formas equivalentes.'
    ]
  },
  {
    id: 'promisify',
    t: 'De callback a promesa',
    d: '`leerArchivo(nombre, callback)` ya existe y usa el estilo de Node: `callback(error, datos)`. Escribí `leerArchivoP(nombre)` que haga lo mismo pero devuelva una promesa.',
    start: `// leerArchivo(nombre, (err, datos) => ...) ya está definida.
leerArchivo('notas.txt', (err, datos) => {
  if (err) console.log('error', err.message);
  else console.log('callback:', datos);
});

// const leerArchivoP = ...
`,
    exports: ['leerArchivoP'],
    async tests(ex, t) {
      await t.eq("`leerArchivoP('notas.txt')` se resuelve con el contenido", () => ex.leerArchivoP('notas.txt'), 'Lunes 28/09 15:20, Catamarca 3265');
      await t.rejects("`leerArchivoP('no-existe.txt')` se rechaza con el error", () => ex.leerArchivoP('no-existe.txt'), 'ENOENT');
    },
    sol: `const leerArchivoP = (nombre) => new Promise((resolve, reject) => {
  leerArchivo(nombre, (err, datos) => {
    if (err) reject(err);
    else resolve(datos);
  });
});`,
    why: [
      'En Node, los callbacks reciben primero el error y después el resultado ("error-first callback").',
      'Envuelvo la llamada en `new Promise`: si llega error, `reject`; si no, `resolve` con los datos.',
      'Node trae esto hecho: `util.promisify(fs.readFile)`, o directamente `fs/promises`.',
      'Las promesas resuelven el "callback hell": en vez de anidar, se encadena o se usa `await`.'
    ]
  },
  {
    id: 'await',
    t: 'De .then a async/await',
    d: 'Reescribí `nombreEnMayus` con `async`/`await`, sin ningún `.then`. `api.getUser(id)` devuelve una promesa con `{ id, name, email }`.',
    start: `// Reescribila con async/await (sin .then)
function nombreEnMayus(id) {
  return api.getUser(id)
    .then((usuario) => usuario.name)
    .then((nombre) => nombre.toUpperCase());
}

console.log(await nombreEnMayus(1));
`,
    exports: ['nombreEnMayus'],
    async tests(ex, t) {
      await t.ok('Devuelve una promesa', () => ex.nombreEnMayus(1) instanceof Promise);
      await t.eq('`nombreEnMayus(1)`', () => ex.nombreEnMayus(1), 'LEANNE GRAHAM');
      await t.eq('`nombreEnMayus(3)`', () => ex.nombreEnMayus(3), 'CLEMENTINE BAUCH');
      t.src('Usás `await`', /\bawait\s+api\.getUser/);
      t.src('Sin `.then`', /\.then\(/, false);
    },
    sol: `async function nombreEnMayus(id) {
  const usuario = await api.getUser(id);
  return usuario.name.toUpperCase();
}`,
    why: [
      '`async` hace que la función siempre devuelva una promesa: lo que retornes pasa a ser el valor con el que se resuelve.',
      '`await` pausa la función hasta que la promesa se asiente y te da el valor. Pausa esta función, no el programa: el event loop sigue atendiendo otras cosas.',
      'Es azúcar sintáctica sobre promesas: por debajo es lo mismo que la cadena de `.then`, pero se lee de arriba abajo como código sincrónico.'
    ]
  },
  {
    id: 'trycatch',
    t: 'Errores con try/catch',
    d: '`usuarioONull(id)` devuelve el usuario, o `null` si la API falla (por ejemplo con id 404). Manejá el error con `try`/`catch` y logueálo con `console.error`.',
    start: `// async function usuarioONull(id) { ... }

console.log(await usuarioONull(2));
console.log(await usuarioONull(404));
`,
    exports: ['usuarioONull'],
    async tests(ex, t) {
      await t.eq('`usuarioONull(2)` devuelve el usuario', () => ex.usuarioONull(2), { id: 2, name: 'Ervin Howell', email: 'Shanna@melissa.tv' });
      await t.eq('`usuarioONull(404)` devuelve null', () => ex.usuarioONull(404), null);
      t.src('Usás `try` y `catch`', /\btry\b[\s\S]*\bcatch\b/);
    },
    sol: `async function usuarioONull(id) {
  try {
    return await api.getUser(id);
  } catch (error) {
    console.error('Falló la API:', error.message);
    return null;
  }
}`,
    why: [
      'Con `await`, una promesa rechazada se convierte en un `throw` en esa línea, así que la atrapa un `try/catch` común.',
      'Cuidado con `return api.getUser(id)` sin `await` adentro del `try`: la promesa se devuelve antes de rechazarse y el `catch` nunca se entera. Por eso va `return await`.',
      'Decidir qué hacer con el error es parte del diseño: acá devuelvo `null`; en una UI mostraría un mensaje y en una API respondería un 4xx o 5xx.'
    ]
  },
  {
    id: 'all',
    t: 'En paralelo con Promise.all',
    d: '`nombres(ids)` trae todos los usuarios EN PARALELO (no uno por uno) y devuelve un array con sus nombres, en el mismo orden que los ids.',
    start: `// async function nombres(ids) { ... }

console.log(await nombres([1, 2, 3]));
`,
    exports: ['nombres'],
    async tests(ex, t, m) {
      m.api.stats.max = 0;
      await t.eq('`nombres([1, 2, 3])`', () => ex.nombres([1, 2, 3]), ['Leanne Graham', 'Ervin Howell', 'Clementine Bauch']);
      await t.ok('Los 3 pedidos salieron a la vez', () => m.api.stats.max >= 3,
        'Hubo como máximo ' + m.api.stats.max + ' pedido(s) en vuelo: los estás haciendo uno por uno (await dentro de un for).');
      await t.eq('`nombres([3, 1])` respeta el orden', () => ex.nombres([3, 1]), ['Clementine Bauch', 'Leanne Graham']);
      await t.eq('`nombres([])` devuelve []', () => ex.nombres([]), []);
    },
    sol: `async function nombres(ids) {
  const usuarios = await Promise.all(ids.map((id) => api.getUser(id)));
  return usuarios.map((u) => u.name);
}`,
    why: [
      '`ids.map(...)` lanza todos los pedidos juntos y devuelve un array de promesas; `Promise.all` espera a que se cumplan todas.',
      'Tarda lo que el pedido más lento, no la suma. Con `await` dentro de un `for...of` serían secuenciales: útil solo si uno depende del anterior.',
      'Si una falla, `Promise.all` rechaza entero. Si querés todos los resultados igual, `Promise.allSettled`; si alcanza con el primero que responda bien, `Promise.any`.'
    ]
  },
  {
    id: 'fetch',
    t: 'fetch y el manejo de res.ok',
    d: '`cargarPosts(userId)` pide `https://jsonplaceholder.typicode.com/posts?userId=...` con `fetch` y devuelve solo los títulos. Si la respuesta no es exitosa, tirá `new Error(\'HTTP \' + res.status)`. (Acá `fetch` es un mock: con `userId` 0 responde 500).',
    start: `// async function cargarPosts(userId) { ... }

console.log(await cargarPosts(1));
`,
    exports: ['cargarPosts'],
    async tests(ex, t, m) {
      await t.eq('`cargarPosts(1)` devuelve los títulos', () => ex.cargarPosts(1), ['sunt aut facere repellat provident', 'qui est esse', 'ea molestias quasi exercitationem']);
      await t.ok('Pidió la URL correcta', () => m.fetch.pedidos.some((u) => u.includes('jsonplaceholder.typicode.com/posts?userId=1')),
        'No encontré un fetch a /posts?userId=1. Pedidos: ' + m.fetch.pedidos.join(', '));
      await t.rejects('Con un 500 rechaza con `HTTP 500`', () => ex.cargarPosts(0), 'HTTP 500');
    },
    sol: `async function cargarPosts(userId) {
  const res = await fetch(\`https://jsonplaceholder.typicode.com/posts?userId=\${userId}\`);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const posts = await res.json();
  return posts.map((p) => p.title);
}`,
    why: [
      '`fetch` solo rechaza si falla la red (sin conexión, DNS, CORS). Un 404 o un 500 llegan como respuesta "exitosa", por eso hay que mirar `res.ok` (status 200 a 299).',
      '`res.json()` también devuelve una promesa: el body llega de a partes y hay que esperarlo.',
      'Es exactamente lo que va dentro de un `useEffect` en React, con estados de loading y error alrededor.'
    ]
  },
  {
    id: 'race',
    t: 'Timeout con Promise.race',
    d: '`conTimeout(promesa, ms)` devuelve una promesa que se resuelve con el valor de `promesa` si llega antes de `ms`, o se rechaza con `new Error(\'Timeout\')` si no.',
    start: `// const conTimeout = ...

const lenta = new Promise((r) => setTimeout(() => r('llegó'), 1000));
conTimeout(lenta, 200)
  .then(console.log)
  .catch((e) => console.log('error:', e.message));
`,
    exports: ['conTimeout'],
    async tests(ex, t) {
      const despues = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
      await t.eq('Si la promesa llega a tiempo, devuelve su valor', () => ex.conTimeout(despues(20, 'ok'), 200), 'ok');
      await t.rejects('Si tarda de más, rechaza con `Timeout`', () => ex.conTimeout(despues(400, 'tarde'), 50), 'Timeout');
      await t.rejects('Si la promesa falla antes, propaga ese error', () => ex.conTimeout(Promise.reject(new Error('falló la API')), 200), 'falló la API');
    },
    sol: `const conTimeout = (promesa, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  );
  return Promise.race([promesa, timeout]);
};`,
    why: [
      '`Promise.race` se asienta igual que la primera promesa que se asiente, se resuelva o se rechace.',
      'Armo una promesa que solo sabe rechazar después de `ms` y la hago competir con la original.',
      'La promesa perdedora no se cancela: sigue corriendo, simplemente se ignora su resultado. Para cortar de verdad un `fetch` se usa `AbortController`.'
    ]
  }
];

/* ---------- pantalla ---------- */
let kataRes = null;   // null | { running: true } | { results, logs }
let kataSol = false;  // solución visible
let kataRun = 0;
let restoreTimer = null;

function openKata(i) {
  S.kata = i;
  save();
  kataRes = null;
  kataSol = false;
  kataRun++;
  renderKata();
  $('#kata-main').scrollTop = 0;
}

function renderKataList() {
  const list = $('#kata-list');
  list.innerHTML = listHTML(KATAS, S.kata, (k) => S.kataDone[k.id], 'Kata');
  keepInView(list, $('.cur', list));
}

function renderKata() {
  renderKataList();
  const k = KATAS[S.kata];
  $('#kata-main').innerHTML =
    '<p class="kicker">Kata ' + (S.kata + 1) + ' de ' + KATAS.length + '</p>' +
    '<h2>' + esc(k.t) + '</h2>' +
    '<div class="desc"><p>' + md(k.d) + '</p></div>' +
    '<textarea class="ed" id="kata-ed" aria-label="Editor de la kata"></textarea>' +
    '<div class="row">' +
    '<button type="button" data-act="restore">Volver al código inicial</button>' +
    '<button type="button" data-act="sol">Ver solución</button>' +
    '<button type="button" class="primary push" data-act="run">Correr tests</button>' +
    '</div>' +
    '<div id="kata-out" aria-live="polite"></div>' +
    '<div id="kata-sol"></div>';

  const ta = $('#kata-ed');
  ta.value = S.drafts[k.id] ?? k.start;
  ta.rows = Math.max(12, ta.value.split('\n').length + 2);
  setupEditor(ta, { onRun: runKata });
  ta.addEventListener('input', () => { S.drafts[k.id] = ta.value; saveSoon(); });
  renderKataOut();
  renderKataSol();
}

function renderKataOut() {
  const out = $('#kata-out');
  if (!kataRes) { out.innerHTML = ''; return; }
  if (kataRes.running) { out.innerHTML = '<h3>Tests</h3><p class="running">Corriendo…</p>'; return; }
  const { results, logs } = kataRes;
  const passed = results.filter((r) => r.pass).length;
  const all = passed === results.length;
  out.innerHTML = '<h3>Tests</h3><ul class="tests">' + results.map((r) =>
    '<li class="' + (r.pass ? 'ok' : 'bad') + '"><span class="mk">' + (r.pass ? '✓' : '✗') + '</span><div>' + md(r.label) +
    (r.detail ? '<small>' + esc(r.detail) + '</small>' : '') + '</div></li>').join('') + '</ul>' +
    (all
      ? '<div class="res ok">✓ Pasaron los ' + results.length + ' tests.<p>Compará tu versión con la de referencia de abajo y explicá en voz alta cada línea, como si te lo preguntaran en la entrevista.</p></div>'
      : '<div class="res bad">✗ Pasaron ' + passed + ' de ' + results.length + '.</div>') +
    (logs.length ? '<h3>Consola</h3>' + renderConsole(logs) : '');
}

function renderKataSol() {
  const k = KATAS[S.kata];
  $('[data-act="sol"]', $('#kata-main')).textContent = kataSol ? 'Ocultar solución' : 'Ver solución';
  $('#kata-sol').innerHTML = !kataSol ? '' :
    '<h3>Solución de referencia</h3><pre class="code">' + highlight(k.sol) + '</pre>' +
    '<h3>Cómo lo defendés</h3><ol class="why">' + k.why.map((w) => '<li>' + md(w) + '</li>').join('') + '</ol>' +
    (S.kata < KATAS.length - 1 ? '<div class="row"><button type="button" class="primary push" data-act="next">Siguiente kata →</button></div>' : '');
}

async function runKata() {
  const k = KATAS[S.kata];
  const src = $('#kata-ed').value;
  const run = ++kataRun;
  kataRes = { running: true };
  renderKataOut();

  const mocks = makeMocks();
  const { logs, exports, error } = await runCode(src, { scope: mocks, ret: k.exports, limit: 2000 });
  const results = [];
  const undeclared = error instanceof ReferenceError && k.exports.find((n) => error.message.startsWith(n + ' '));
  if (undeclared) {
    results.push({ label: 'Existe `' + undeclared + '`', pass: false, detail: 'Todavía no la declaraste (o la usás antes de declararla): ' + fmt(error) });
  } else if (error) {
    results.push({ label: 'El código corre sin errores', pass: false, detail: fmt(error) });
  } else {
    const missing = k.exports.filter((n) => typeof exports[n] === 'undefined');
    missing.forEach((n) => results.push({ label: 'Existe `' + n + '`', pass: false, detail: 'No la encontré. ¿La declaraste con ese nombre exacto?' }));
    if (!missing.length) await k.tests(exports, makeTester(results, src), mocks);
  }
  if (run !== kataRun) return;

  const pass = results.length > 0 && results.every((r) => r.pass);
  if (pass) {
    S.kataDone[k.id] = true;
    kataSol = true;
    save();
    renderStats();
    renderKataList();
    renderKataSol();
  }
  kataRes = { results, logs };
  renderKataOut();
  scrollInside($('#kata-main'), $('#kata-out'));
}

$('#kata-list').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-i]');
  if (b) openKata(+b.dataset.i);
});

$('#kata-main').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  const k = KATAS[S.kata];
  if (b.dataset.act === 'run') runKata();
  if (b.dataset.act === 'sol') { kataSol = !kataSol; renderKataSol(); if (kataSol) scrollInside($('#kata-main'), $('#kata-sol')); }
  if (b.dataset.act === 'next') openKata(S.kata + 1);
  if (b.dataset.act === 'restore') {
    /* Dos clics para no perder lo escrito por accidente */
    if (b.dataset.armed !== '1') {
      b.dataset.armed = '1';
      b.textContent = '¿Seguro? Click de nuevo';
      clearTimeout(restoreTimer);
      restoreTimer = setTimeout(() => { b.dataset.armed = ''; b.textContent = 'Volver al código inicial'; }, 3000);
      return;
    }
    clearTimeout(restoreTimer);
    delete S.drafts[k.id];
    save();
    kataRes = null;
    renderKata();
  }
});
