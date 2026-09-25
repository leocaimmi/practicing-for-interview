/* Katas: escribís el código a mano y lo validan tests que corren en el navegador.
   Cada kata: id, t (título), d (enunciado con `código`), start (código inicial), exports (lo que se testea),
   tests(ex, t, m) con las funciones exportadas, el tester y los mocks, sol (solución) y why (cómo defenderla). */

/* Mocks que ven las katas: una API con demora, un callback estilo Node y un fetch de mentira */
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

  return { api, leerArchivo };
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
  }
];

/* ---------- tester ---------- */
const TIMEOUT = Symbol('timeout');
const within = (value, ms = 2000) => Promise.race([
  Promise.resolve(value),
  new Promise((_, reject) => setTimeout(() => reject(TIMEOUT), ms))
]);

function same(a, b) {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => same(a[k], b[k]));
}

const show = (v) => (typeof v === 'string' ? "'" + v + "'" : fmt(v));
const thrown = (e) => (e === TIMEOUT ? 'La promesa nunca se resolvió (¿te olvidaste de llamar a resolve?)' : 'Tiró ' + fmt(e));

function makeTester(results, src) {
  const code = stripComments(src);
  return {
    async eq(label, fn, expected) {
      try {
        const got = await within(fn());
        const pass = same(got, expected);
        results.push({ label, pass, detail: pass ? '' : 'Esperaba ' + show(expected) + ' y llegó ' + show(got) });
      } catch (e) { results.push({ label, pass: false, detail: thrown(e) }); }
    },
    async ok(label, fn, hint = '') {
      try {
        const pass = !!(await within(fn()));
        results.push({ label, pass, detail: pass ? '' : hint });
      } catch (e) { results.push({ label, pass: false, detail: thrown(e) }); }
    },
    async rejects(label, fn, message) {
      try {
        const got = await within(fn());
        results.push({ label, pass: false, detail: 'Resolvió con ' + show(got) + ' en vez de rechazar' });
      } catch (e) {
        const pass = e !== TIMEOUT && e instanceof Error && e.message.includes(message);
        results.push({ label, pass, detail: pass ? '' : e === TIMEOUT ? thrown(e) : 'Rechazó con ' + fmt(e) + ' y esperaba un Error con "' + message + '"' });
      }
    },
    src(label, re, want = true, hint = '') {
      const pass = re.test(code) === want;
      results.push({ label, pass, detail: pass ? '' : hint });
    }
  };
}

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
}

function renderKataList() {
  $('#kata-list').innerHTML = KATAS.map((k, i) => {
    const cls = (S.kataDone[k.id] ? 'done' : '') + (i === S.kata ? ' cur' : '');
    return '<li class="' + cls + '"><button type="button" data-i="' + i + '" aria-label="Kata ' + (i + 1) + ': ' + esc(k.t) + '">' +
      '<span class="n">' + (S.kataDone[k.id] ? '✓' : i + 1) + '</span><span class="t">' + esc(k.t) + '</span></button></li>';
  }).join('');
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
  if (b.dataset.act === 'sol') { kataSol = !kataSol; renderKataSol(); }
  if (b.dataset.act === 'next') { openKata(S.kata + 1); window.scrollTo({ top: $('#tab-kata').offsetTop - 12 }); }
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
