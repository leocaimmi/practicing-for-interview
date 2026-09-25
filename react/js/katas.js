/* Katas de React: escribís el componente, los tests lo montan de verdad, hacen clics y escriben como un usuario.
   Cada kata: id, t, d (enunciado), start, exports (componentes que se testean), tests(ex, t, d, m),
   preview(ex) → elemento para la vista previa, sol y why. */

/* Mocks: fetch simulado (usuarios y posts) y timers vigilados para saber si limpiás los intervalos */
function makeReactMocks() {
  const USERS = [
    { id: 1, name: 'Leanne Graham', email: 'Sincere@april.biz' },
    { id: 2, name: 'Ervin Howell', email: 'Shanna@melissa.tv' },
    { id: 3, name: 'Clementine Bauch', email: 'Nathan@yesenia.net' }
  ];
  const state = { usersFail: false };
  const calls = [];
  const respond = (status, body, ms) => new Promise((resolve) => setTimeout(() => resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => JSON.parse(JSON.stringify(body))
  }), ms));

  const fetch = (url) => {
    const u = String(url);
    calls.push(u);
    if (/\/users\/?$/.test(u)) return state.usersFail ? respond(500, { error: 'Internal Server Error' }, 40) : respond(200, USERS, 40);
    const post = u.match(/\/posts\/(\d+)$/);
    if (post) {
      const id = +post[1];
      /* El post 1 tarda más que el resto: sirve para probar respuestas que llegan desordenadas */
      return respond(200, { id, title: 'Título del post ' + id }, id === 1 ? 160 : 30);
    }
    return respond(404, { error: 'Not Found' }, 30);
  };

  const active = new Set();
  const setIntervalW = (fn, ms, ...args) => { const id = setInterval(fn, ms, ...args); active.add(id); return id; };
  const clearIntervalW = (id) => { clearInterval(id); active.delete(id); };

  return {
    scope: { fetch, setInterval: setIntervalW, clearInterval: clearIntervalW },
    state, calls, active,
    cleanup() { active.forEach((id) => clearInterval(id)); active.clear(); }
  };
}

const TAREAS = [
  { id: 7, texto: 'Estudiar SQL' },
  { id: 9, texto: 'Repasar React' },
  { id: 12, texto: 'Practicar Linux' }
];
const PRODUCTOS = [
  { id: 1, nombre: 'Yerba', precio: 3000 },
  { id: 2, nombre: 'Termo', precio: 45000 }
];

const KATAS = [
  {
    id: 'props',
    t: 'Componente con props',
    d: 'Escribí `Saludo`, que recibe la prop `nombre` y muestra un `<h2>` con el texto `Hola, Leo!` (con el nombre que llegue).',
    start: `function Saludo({ nombre }) {
  // devolvé un <h2> con el saludo
  return null;
}
`,
    exports: ['Saludo'],
    preview: (ex) => h(ex.Saludo, { nombre: 'Leo' }),
    async tests(ex, t, d) {
      const m = d.mount(ex.Saludo, { nombre: 'Leo' });
      await t.ok('Renderiza un `<h2>`', () => m.container.querySelector('h2'), 'No encontré ningún <h2>.');
      await t.eq('Con `nombre="Leo"` muestra "Hola, Leo!"', () => d.text(m.container.querySelector('h2')), 'Hola, Leo!');
      m.rerender({ nombre: 'Ana' });
      await t.eq('Si cambia la prop, cambia el texto: "Hola, Ana!"', () => d.text(m.container.querySelector('h2')), 'Hola, Ana!');
    },
    sol: `function Saludo({ nombre }) {
  return <h2>Hola, {nombre}!</h2>;
}`,
    why: [
      'Un componente es una función que recibe props y devuelve JSX: lo que se tiene que ver en pantalla.',
      'Las props llegan en un objeto; con destructuring (`{ nombre }`) saco directamente la que necesito.',
      'Adentro del JSX, las llaves `{ }` insertan cualquier expresión de JavaScript.',
      'Las props son de solo lectura: el componente no las modifica, solo las usa.'
    ]
  },
  {
    id: 'listas',
    t: 'Listas y keys',
    d: '`ListaTareas` recibe `tareas` (un array de `{ id, texto }`) y muestra un `<ul>` con un `<li>` por tarea. Cada `<li>` necesita una `key` estable. Si no hay tareas, muestra `<p>No hay tareas</p>` en lugar de la lista.',
    start: `function ListaTareas({ tareas }) {
  // Si no hay tareas: <p>No hay tareas</p>
  // Si hay: <ul> con un <li> por tarea (¡con key!)
  return null;
}
`,
    exports: ['ListaTareas'],
    preview: (ex) => h(ex.ListaTareas, { tareas: TAREAS }),
    async tests(ex, t, d) {
      const m = d.mount(ex.ListaTareas, { tareas: TAREAS });
      await t.eq('Muestra un `<li>` por tarea', () => d.texts(m.container, 'li'), ['Estudiar SQL', 'Repasar React', 'Practicar Linux']);
      await t.ok('Cada `<li>` tiene `key`', () => {
        const lis = [...m.container.querySelectorAll('li')];
        return lis.length && lis.every((li) => d.key(li) != null);
      }, 'Falta la key: React la necesita para saber qué elemento es cuál entre renders.');
      await t.eq('La key es el `id` de la tarea (no el índice)', () => [...m.container.querySelectorAll('li')].map((li) => d.key(li)), ['7', '9', '12']);
      const vacia = d.mount(ex.ListaTareas, { tareas: [] });
      await t.eq('Sin tareas muestra "No hay tareas"', () => d.text(vacia.container.querySelector('p')), 'No hay tareas');
      await t.ok('Sin tareas no muestra la lista', () => !vacia.container.querySelector('li, ul'));
    },
    sol: `function ListaTareas({ tareas }) {
  if (tareas.length === 0) {
    return <p>No hay tareas</p>;
  }

  return (
    <ul>
      {tareas.map((tarea) => (
        <li key={tarea.id}>{tarea.texto}</li>
      ))}
    </ul>
  );
}`,
    why: [
      'Para mostrar una lista, transformo el array de datos en un array de elementos con `map`.',
      'La `key` le permite a React identificar cada elemento entre renders: si agrego, borro o reordeno, sabe cuál es cuál y no mezcla su estado.',
      'Uso el `id` y no el índice: el índice cambia cuando borrás o reordenás, y eso provoca errores sutiles (inputs con el texto equivocado, por ejemplo).',
      'El `return` temprano para el caso vacío hace el componente más fácil de leer que un ternario gigante.'
    ]
  },
  {
    id: 'contador',
    t: 'useState: un contador',
    d: '`Contador` muestra `<p>Clicks: 0</p>` y dos botones: `+1` suma uno y `Reiniciar` vuelve a 0. Usá `useState` (ya está disponible, no hace falta importarlo).',
    start: `function Contador() {
  // const [clicks, setClicks] = useState(0);
  return null;
}
`,
    exports: ['Contador'],
    preview: (ex) => h(ex.Contador),
    async tests(ex, t, d) {
      const m = d.mount(ex.Contador);
      const p = () => d.text(m.container.querySelector('p'));
      await t.eq('Arranca en "Clicks: 0"', p, 'Clicks: 0');
      await d.click(d.button(m.container, /^\+1$/), 'el botón +1');
      await d.click(d.button(m.container, /^\+1$/), 'el botón +1');
      await t.eq('Dos clics en `+1` → "Clicks: 2"', p, 'Clicks: 2');
      await d.click(d.button(m.container, /^Reiniciar$/i), 'el botón Reiniciar');
      await t.eq('`Reiniciar` vuelve a "Clicks: 0"', p, 'Clicks: 0');
      t.src('Usás `useState`', /useState\s*\(/);
    },
    sol: `function Contador() {
  const [clicks, setClicks] = useState(0);

  return (
    <div>
      <p>Clicks: {clicks}</p>
      <button onClick={() => setClicks(clicks + 1)}>+1</button>
      <button onClick={() => setClicks(0)}>Reiniciar</button>
    </div>
  );
}`,
    why: [
      '`useState(0)` devuelve un par: el valor actual y la función para cambiarlo. Lo desarmo con destructuring de arrays.',
      'Cuando llamo a `setClicks`, React vuelve a ejecutar el componente con el valor nuevo y actualiza la pantalla.',
      'No sirve una variable común (`let clicks`): se reinicia en cada render y React no se entera de que cambió.',
      'En `onClick` paso una función (`() => setClicks(...)`), no el resultado de llamarla. `onClick={setClicks(0)}` se ejecutaría en cada render.'
    ]
  },
  {
    id: 'buscador',
    t: 'Input controlado y datos derivados',
    d: '`Buscador` recibe `items` (un array de strings). Muestra un `<input placeholder="Buscar...">` y abajo un `<ul>` solo con los items que contienen lo escrito, sin importar mayúsculas. Guardá en el estado únicamente el texto: la lista filtrada se calcula.',
    start: `function Buscador({ items }) {
  // un solo useState: el texto del input
  return null;
}
`,
    exports: ['Buscador'],
    preview: (ex) => h(ex.Buscador, { items: ['React', 'Redux', 'Node', 'Express'] }),
    async tests(ex, t, d) {
      const items = ['React', 'Redux', 'Node', 'Express'];
      const m = d.mount(ex.Buscador, { items });
      const input = () => m.container.querySelector('input');
      await t.eq('Sin texto muestra todos', () => d.texts(m.container, 'li'), items);
      await d.type(input(), 're');
      await t.eq('Con "re" filtra (sin importar mayúsculas)', () => d.texts(m.container, 'li'), ['React', 'Redux', 'Express']);
      await d.type(input(), 'NODE');
      await t.eq('Con "NODE" queda solo Node', () => d.texts(m.container, 'li'), ['Node']);
      await t.ok('El input es controlado (su value viene del estado)', () => input().value === 'NODE' && /value\s*=\s*\{/.test(stripComments(t.code)),
        'Pasale value={texto} y onChange al input.');
      t.src('Un solo `useState`: la lista filtrada se calcula, no se guarda', /useState[\s\S]*useState/, false,
        'Tenés más de un useState. Lo que se puede calcular a partir de otro estado o de las props no va en el estado.');
    },
    sol: `function Buscador({ items }) {
  const [texto, setTexto] = useState('');

  const filtrados = items.filter((item) =>
    item.toLowerCase().includes(texto.toLowerCase())
  );

  return (
    <div>
      <input
        placeholder="Buscar..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <ul>
        {filtrados.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}`,
    why: [
      'Input controlado: su `value` sale del estado y cada tecla actualiza el estado con `onChange`. React es la única fuente de verdad.',
      'La lista filtrada no va en el estado: se calcula en cada render a partir de `items` y `texto`. Si la guardara aparte, podría quedar desincronizada.',
      '`e.target.value` es el texto actual del input.',
      'Acá uso el propio texto como key porque los items no se repiten; con datos reales usaría un id.'
    ]
  },
  {
    id: 'form',
    t: 'Formulario: el hijo le avisa al padre',
    d: '`FormTarea` recibe `onAgregar`. Tiene un `<form>` con un `<input>` y un botón `Agregar`. Al enviar: evitá que se recargue la página, llamá a `onAgregar` con el texto sin espacios de más y vaciá el input. Si el texto está vacío, no hagas nada.',
    start: `function FormTarea({ onAgregar }) {
  return null;
}
`,
    exports: ['FormTarea'],
    preview: (ex) => h(function Padre() {
      const [lista, setLista] = React.useState([]);
      return h('div', null, h(ex.FormTarea, { onAgregar: (texto) => setLista((l) => [...l, texto]) }),
        h('p', null, 'El padre recibió: ' + (lista.length ? lista.join(', ') : '(nada todavía)')));
    }),
    async tests(ex, t, d) {
      const recibidos = [];
      const m = d.mount(ex.FormTarea, { onAgregar: (x) => recibidos.push(x) });
      const form = m.container.querySelector('form');
      const input = m.container.querySelector('input');
      await t.ok('Hay un `<form>` con un `<input>`', () => form && input, 'Usá un <form> con onSubmit: así funciona también apretando Enter.');
      if (!form || !input) return;
      await d.type(input, '  Estudiar hooks  ');
      const ev = await d.submit(form);
      await t.eq('Llama a `onAgregar` con el texto sin espacios de más', () => recibidos, ['Estudiar hooks']);
      await t.ok('Llamás a `e.preventDefault()`', () => ev.defaultPrevented, 'Sin preventDefault el navegador recarga la página al enviar el form.');
      await t.eq('Vacía el input después de agregar', () => m.container.querySelector('input').value, '');
      await d.type(m.container.querySelector('input'), '   ');
      await d.submit(form);
      await t.eq('Si está vacío, no llama a `onAgregar`', () => recibidos.length, 1);
    },
    sol: `function FormTarea({ onAgregar }) {
  const [texto, setTexto] = useState('');

  const enviar = (e) => {
    e.preventDefault();
    const limpio = texto.trim();
    if (!limpio) return;
    onAgregar(limpio);
    setTexto('');
  };

  return (
    <form onSubmit={enviar}>
      <input value={texto} onChange={(e) => setTexto(e.target.value)} />
      <button>Agregar</button>
    </form>
  );
}`,
    why: [
      'Los datos bajan por props y los eventos suben por funciones: el padre le pasa `onAgregar` y el hijo la llama. Así "levantás el estado".',
      '`e.preventDefault()` evita el comportamiento por defecto del form, que es recargar la página.',
      'Uso `onSubmit` en el `<form>` y no `onClick` en el botón: así también funciona apretando Enter.',
      'Después de agregar, vacío el input poniendo el estado en `\'\'` (funciona porque es controlado).'
    ]
  },
  {
    id: 'condicional',
    t: 'Renderizado condicional',
    d: '`Resultado` recibe `cargando`, `error` y `datos`. Si `cargando`, muestra `<p>Cargando...</p>`. Si hay `error`, `<p role="alert">Error: ...</p>`. Si `datos` está vacío, `<p>Sin resultados</p>`. Si no, un `<ul>` con los datos.',
    start: `function Resultado({ cargando, error, datos }) {
  return null;
}
`,
    exports: ['Resultado'],
    preview: (ex) => h('div', null,
      h(ex.Resultado, { cargando: true, error: null, datos: [] }),
      h(ex.Resultado, { cargando: false, error: 'HTTP 500', datos: [] }),
      h(ex.Resultado, { cargando: false, error: null, datos: ['Yerba', 'Termo'] })),
    async tests(ex, t, d) {
      const cargando = d.mount(ex.Resultado, { cargando: true, error: null, datos: [] });
      await t.eq('Cargando → "Cargando..."', () => d.text(cargando.container), 'Cargando...');
      const error = d.mount(ex.Resultado, { cargando: false, error: 'HTTP 500', datos: [] });
      await t.eq('Con error → `<p role="alert">` "Error: HTTP 500"', () => d.text(error.container.querySelector('[role="alert"]')), 'Error: HTTP 500');
      const vacio = d.mount(ex.Resultado, { cargando: false, error: null, datos: [] });
      await t.eq('Sin datos → "Sin resultados"', () => d.text(vacio.container), 'Sin resultados');
      const ok = d.mount(ex.Resultado, { cargando: false, error: null, datos: ['Yerba', 'Termo'] });
      await t.eq('Con datos → la lista', () => d.texts(ok.container, 'li'), ['Yerba', 'Termo']);
      const ambos = d.mount(ex.Resultado, { cargando: true, error: 'HTTP 500', datos: [] });
      await t.eq('Si está cargando, eso tiene prioridad', () => d.text(ambos.container), 'Cargando...');
    },
    sol: `function Resultado({ cargando, error, datos }) {
  if (cargando) return <p>Cargando...</p>;
  if (error) return <p role="alert">Error: {error}</p>;
  if (datos.length === 0) return <p>Sin resultados</p>;

  return (
    <ul>
      {datos.map((dato) => (
        <li key={dato}>{dato}</li>
      ))}
    </ul>
  );
}`,
    why: [
      'Con `return` tempranos cada caso queda en una línea y el orden marca la prioridad: primero cargando, después error, después vacío.',
      'Adentro del JSX también se puede usar `condicion && <Algo />` o un ternario, pero con varios casos los `if` se leen mejor.',
      'Cuidado con `datos.length && ...`: si el largo es 0, React muestra un "0" en pantalla. Mejor `datos.length > 0 && ...`.',
      'Estos tres estados (cargando, error, datos) son los que siempre aparecen al pedir datos a una API.'
    ]
  },
  {
    id: 'carrito',
    t: 'Estado con arrays sin mutar',
    d: '`Carrito` recibe `productos` (`{ id, nombre, precio }`). Por cada producto hay un botón `Agregar Yerba`. Abajo, un `<ul>` con un `<li>` por cada item agregado (con el nombre y un botón `Quitar` que saca solo ese item) y `<p>Total: $51000</p>`.',
    start: `function Carrito({ productos }) {
  // const [items, setItems] = useState([]);
  return null;
}
`,
    exports: ['Carrito'],
    preview: (ex) => h(ex.Carrito, { productos: PRODUCTOS }),
    async tests(ex, t, d) {
      const m = d.mount(ex.Carrito, { productos: PRODUCTOS });
      const total = () => d.text([...m.container.querySelectorAll('p')].find((p) => /Total/i.test(p.textContent)));
      await t.eq('Arranca con "Total: $0"', total, 'Total: $0');
      await d.click(d.button(m.container, /Agregar Yerba/), 'el botón "Agregar Yerba"');
      await d.click(d.button(m.container, /Agregar Termo/), 'el botón "Agregar Termo"');
      await d.click(d.button(m.container, /Agregar Yerba/), 'el botón "Agregar Yerba"');
      await t.eq('Después de agregar Yerba, Termo y Yerba hay 3 items', () => m.container.querySelectorAll('li').length, 3);
      await t.eq('El total es "Total: $51000"', total, 'Total: $51000');
      await d.click(m.container.querySelector('li button'), 'el botón Quitar del primer item');
      await t.eq('`Quitar` en el primer item deja 2 items', () => m.container.querySelectorAll('li').length, 2);
      await t.eq('Y el total baja a "Total: $48000"', total, 'Total: $48000');
      t.src('No usás `push` ni `splice` sobre el estado', /\.(push|splice)\(/, false, 'Mutar el array no avisa a React: creá uno nuevo con [...items, x] o filter.');
    },
    sol: `function Carrito({ productos }) {
  const [items, setItems] = useState([]);

  const agregar = (producto) => {
    // uid: identifica este item aunque haya dos del mismo producto
    setItems([...items, { ...producto, uid: Date.now() + Math.random() }]);
  };

  const quitar = (uid) => {
    setItems(items.filter((item) => item.uid !== uid));
  };

  const total = items.reduce((suma, item) => suma + item.precio, 0);

  return (
    <div>
      {productos.map((p) => (
        <button key={p.id} onClick={() => agregar(p)}>Agregar {p.nombre}</button>
      ))}
      <ul>
        {items.map((item) => (
          <li key={item.uid}>
            {item.nombre} <button onClick={() => quitar(item.uid)}>Quitar</button>
          </li>
        ))}
      </ul>
      <p>Total: \${total}</p>
    </div>
  );
}`,
    why: [
      'Nunca modifico el array del estado: para agregar creo uno nuevo con spread (`[...items, nuevo]`) y para quitar uso `filter`.',
      'React compara por referencia: si hago `items.push(x)` y `setItems(items)`, es el mismo array y React no vuelve a renderizar.',
      'Cada item agregado lleva un `uid` propio: si hay dos Yerbas, `Quitar` saca solo la que tocaste. Filtrar por el id del producto borraría las dos.',
      'El total no va en el estado: se calcula con `reduce` a partir de los items.'
    ]
  },
  {
    id: 'fetch',
    t: 'useEffect con fetch',
    d: '`Usuarios` pide `https://jsonplaceholder.typicode.com/users` al montarse. Mientras espera muestra `<p>Cargando...</p>`; cuando llega, un `<ul>` con el `name` de cada usuario; si falla (status no ok), `<p role="alert">Error: HTTP 500</p>`. Un solo pedido: nada de loops infinitos. (Acá `fetch` es simulado).',
    start: `function Usuarios() {
  // tres estados: usuarios, cargando y error
  // useEffect(() => { ... }, []);
  return null;
}
`,
    exports: ['Usuarios'],
    preview: (ex) => h(ex.Usuarios),
    async tests(ex, t, d, m) {
      const ok = d.mount(ex.Usuarios);
      await t.eq('Al principio muestra "Cargando..."', () => d.text(ok.container), 'Cargando...');
      await d.waitFor(() => ok.container.querySelectorAll('li').length === 3, 800);
      await t.eq('Cuando llega, muestra los nombres', () => d.texts(ok.container, 'li'), ['Leanne Graham', 'Ervin Howell', 'Clementine Bauch']);
      await t.ok('Ya no dice "Cargando..."', () => !/Cargando/.test(ok.container.textContent));
      await d.wait(150);
      const pedidos = m.calls.filter((u) => /\/users/.test(u)).length;
      await t.eq('Hace un solo pedido (dependencias `[]`)', () => pedidos, 1);
      ok.unmount();

      m.state.usersFail = true;
      const mal = d.mount(ex.Usuarios);
      await d.waitFor(() => mal.container.querySelector('[role="alert"]'), 800);
      await t.eq('Si la API responde 500 → "Error: HTTP 500"', () => d.text(mal.container.querySelector('[role="alert"]')), 'Error: HTTP 500');
      await t.ok('Con error tampoco queda "Cargando..."', () => !/Cargando/.test(mal.container.textContent));
    },
    sol: `function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        setUsuarios(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p role="alert">Error: {error}</p>;

  return (
    <ul>
      {usuarios.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}`,
    why: [
      '`useEffect` corre después de que el componente se muestra: es el lugar para efectos como pedir datos, timers o suscripciones.',
      'El `[]` del final son las dependencias: vacío significa "solo al montar". Sin ese array, el efecto correría después de cada render, y como el efecto cambia el estado, sería un loop infinito.',
      'La función del efecto no puede ser `async` (tiene que devolver nada o una función de limpieza), por eso declaro `cargar` adentro y la llamo.',
      'Manejo los tres estados: cargando, error y datos. El `finally` apaga el cargando pase lo que pase.',
      'En un proyecto real se suele usar una librería como TanStack Query, pero hay que saber hacerlo a mano.'
    ]
  },
  {
    id: 'cleanup',
    t: 'Cleanup: un reloj que no pierde memoria',
    d: '`Reloj` recibe `intervalo` (en ms, por defecto 1000) y muestra `<p>Segundos: N</p>`, sumando 1 cada `intervalo`. Cuando el componente se desmonta, el intervalo se tiene que limpiar.',
    start: `function Reloj({ intervalo = 1000 }) {
  // useEffect con setInterval... y su cleanup
  return null;
}
`,
    exports: ['Reloj'],
    preview: (ex) => h(ex.Reloj, { intervalo: 1000 }),
    async tests(ex, t, d, m) {
      const r = d.mount(ex.Reloj, { intervalo: 40 });
      await t.eq('Arranca en "Segundos: 0"', () => d.text(r.container.querySelector('p')), 'Segundos: 0');
      await d.wait(210);
      await t.ok('Sigue sumando (después de 5 intervalos va por 3 o más)', () => {
        const n = +(d.text(r.container.querySelector('p')) || '').replace(/\D/g, '');
        return n >= 3;
      }, () => 'Quedó en "' + d.text(r.container.querySelector('p')) + '". Si se clavó en 1, es un closure viejo: usá setSegundos((s) => s + 1).');
      await t.ok('Usa `setInterval`', () => m.active.size > 0, 'No encontré ningún setInterval activo.');
      r.unmount();
      await t.ok('Al desmontarse limpia el intervalo', () => m.active.size === 0, 'Devolvé una función de limpieza en el useEffect: return () => clearInterval(id).');
    },
    sol: `function Reloj({ intervalo = 1000 }) {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSegundos((s) => s + 1);
    }, intervalo);

    return () => clearInterval(id); // cleanup: corre al desmontar
  }, [intervalo]);

  return <p>Segundos: {segundos}</p>;
}`,
    why: [
      'La función que devuelve el efecto es el cleanup: React la llama cuando el componente se desmonta y antes de volver a correr el efecto.',
      'Sin cleanup, el intervalo sigue vivo aunque el componente ya no esté: pierde memoria y puede intentar actualizar un estado que no existe.',
      'Uso `setSegundos((s) => s + 1)`: la versión con función recibe siempre el valor más nuevo. Con `setSegundos(segundos + 1)` el intervalo ve siempre el `segundos` del primer render (closure viejo) y se queda en 1.',
      'Pongo `intervalo` en las dependencias: si cambia, se limpia el intervalo viejo y se crea uno nuevo.'
    ]
  },
  {
    id: 'deps',
    t: 'Dependencias y respuestas desordenadas',
    d: '`Post` recibe `id`, pide `https://jsonplaceholder.typicode.com/posts/{id}` y muestra el `title` en un `<h2>` (mientras tanto, `<p>Cargando...</p>`). Cuando cambia `id`, vuelve a pedir. Atención: si el pedido viejo llega después que el nuevo, hay que ignorarlo. (El post 1 tarda más a propósito).',
    start: `function Post({ id }) {
  return null;
}
`,
    exports: ['Post'],
    preview: (ex) => h(function ElegirPost() {
      const [id, setId] = React.useState(2);
      return h('div', null,
        [1, 2, 3].map((n) => h('button', { key: n, onClick: () => setId(n) }, 'Post ' + n)),
        h(ex.Post, { id }));
    }),
    async tests(ex, t, d) {
      const m = d.mount(ex.Post, { id: 2 });
      await t.ok('Mientras carga muestra "Cargando..."', () => /Cargando/.test(m.container.textContent));
      await d.waitFor(() => m.container.querySelector('h2'), 600);
      await t.eq('Muestra el título del post 2', () => d.text(m.container.querySelector('h2')), 'Título del post 2');
      m.rerender({ id: 3 });
      await d.waitFor(() => /post 3/.test(m.container.textContent), 600);
      await t.eq('Cuando cambia `id`, pide de nuevo', () => d.text(m.container.querySelector('h2')), 'Título del post 3');

      const carrera = d.mount(ex.Post, { id: 1 });
      await d.wait(10);
      carrera.rerender({ id: 2 });
      await d.wait(300);
      await t.eq('Si el pedido viejo (post 1) llega tarde, se ignora', () => d.text(carrera.container.querySelector('h2')), 'Título del post 2');
    },
    sol: `function Post({ id }) {
  const [post, setPost] = useState(null);

  useEffect(() => {
    let ignorar = false;
    setPost(null);

    fetch(\`https://jsonplaceholder.typicode.com/posts/\${id}\`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignorar) setPost(data);
      });

    return () => {
      ignorar = true; // este pedido quedó viejo
    };
  }, [id]);

  if (!post) return <p>Cargando...</p>;
  return <h2>{post.title}</h2>;
}`,
    why: [
      'Todo lo que el efecto usa de afuera (props, estado) va en las dependencias: acá `[id]`. Si `id` cambia, el efecto se vuelve a ejecutar.',
      'Antes de correr de nuevo, React ejecuta el cleanup del efecto anterior. Ahí marco `ignorar = true` para el pedido viejo.',
      'Sin eso hay una "carrera": si el pedido del post 1 tarda más que el del 2, llega último y pisa lo que se ve. El usuario pidió el 2 y ve el 1.',
      'Otra opción es cancelar el pedido con `AbortController` y pasarle `signal` al `fetch`.'
    ]
  }
];

/* ---------- pantalla ---------- */
let kataRes = null;   // null | { running: true } | { results, logs }
let kataSol = false;
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
  unmountPreview($('#kata-pv'));
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
  renderKataSol();
}

function renderKataOut() {
  const out = $('#kata-out');
  unmountPreview($('#kata-pv'));
  if (!kataRes) { out.innerHTML = ''; return; }
  if (kataRes.running) { out.innerHTML = '<h3>Tests</h3><p class="running">Montando el componente y corriendo tests…</p>'; return; }
  const { results, logs } = kataRes;
  const passed = results.filter((r) => r.pass).length;
  const all = passed === results.length;
  out.innerHTML =
    '<h3 class="pv-label">Vista previa <span class="kicker">interactiva</span></h3><div class="pv" id="kata-pv"></div>' +
    '<h3>Tests</h3><ul class="tests">' + results.map((r) =>
      '<li class="' + (r.pass ? 'ok' : 'bad') + '"><span class="mk">' + (r.pass ? '✓' : '✗') + '</span><div>' + md(r.label) +
      (r.detail ? '<small>' + esc(r.detail) + '</small>' : '') + '</div></li>').join('') + '</ul>' +
    (all
      ? '<div class="res ok">✓ Pasaron los ' + results.length + ' tests.<p>Compará tu versión con la de referencia y explicá en voz alta por qué funciona, como en la entrevista.</p></div>'
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

  const logs = [];
  const con = makeConsole(logs);
  const mocks = makeReactMocks();
  const d = makeDom();
  const results = [];
  let ex = null;
  try {
    ex = evalCode(src, { names: k.exports, scope: mocks.scope, con });
  } catch (e) {
    results.push({ label: 'El código compila y corre', pass: false, detail: fmt(e) });
  }
  if (ex) {
    const missing = k.exports.filter((n) => typeof ex[n] !== 'function');
    missing.forEach((n) => results.push({ label: 'Existe el componente `' + n + '`', pass: false, detail: 'No lo encontré. ¿Lo declaraste con ese nombre exacto?' }));
    if (!missing.length) {
      const t = makeTester(results, src);
      t.code = src;
      try { await k.tests(ex, t, d, mocks); } catch (e) {
        results.push({ label: 'Los tests pudieron terminar', pass: false, detail: fmt(e) });
      }
    }
  }
  d.cleanup();
  mocks.cleanup();
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

  /* Vista previa con mocks nuevos, para que se pueda usar a mano */
  const host = $('#kata-pv');
  if (ex && !results.some((r) => /Existe el componente/.test(r.label))) {
    try {
      const fresh = makeReactMocks();
      const live = evalCode(src, { names: k.exports, scope: fresh.scope, con: makeConsole([]) });
      mountPreview(host, k.preview(live));
    } catch (e) { showPreviewError(host, e); }
  } else if (host) {
    host.innerHTML = '<div class="pv-error">Sin vista previa: el código no compila o falta el componente.</div>';
  }
  scrollInside($('#kata-main'), $('#kata-out'));
}

$('#kata-list').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-i]');
  if (b) openKata(+b.dataset.i);
});

$('#kata-main').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]');
  if (!b || b.closest('.pv')) return;
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
