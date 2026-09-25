/* Guía rápida de React: un tema por vez, con qué es, cuándo se usa, un ejemplo que se ve funcionando y qué tener en cuenta.
   Los ejemplos definen un componente Demo, que se monta en la vista previa. */

const GUIDE = [
  {
    g: 'Base', t: 'Componentes y JSX',
    que: 'Un componente es una función que devuelve lo que se tiene que ver en pantalla. Eso que devuelve se escribe en JSX: parece HTML, pero es JavaScript.',
    cuando: 'Siempre: una app de React es un árbol de componentes. Cada parte reutilizable (un botón, una tarjeta, una lista) es un componente.',
    code: `function Tarjeta() {
  const nombre = 'Leo';
  return (
    <div className="tarjeta">
      <h3>Hola, {nombre}</h3>
      <p>2 + 2 = {2 + 2}</p>
    </div>
  );
}

function Demo() {
  return (
    <>
      <Tarjeta />
      <Tarjeta />
    </>
  );
}`,
    ojo: [
      'El nombre del componente va con mayúscula: `<Tarjeta />` es un componente, `<div>` es HTML.',
      'Las llaves `{ }` insertan cualquier expresión de JavaScript.',
      'Es `className` y no `class`, porque `class` es palabra reservada de JavaScript.',
      'Se devuelve un solo elemento raíz. Si no querés un `<div>` de más, usá un fragmento: `<> ... </>`.'
    ]
  },
  {
    g: 'Base', t: 'Props',
    que: 'Las props son los datos que un componente padre le pasa a un hijo, como si fueran los parámetros de una función.',
    cuando: 'Para reutilizar un componente con datos distintos: la misma tarjeta con distinto nombre, el mismo botón con distinto texto.',
    code: `function Saludo({ nombre, edad = 18 }) {
  return <p>{nombre} tiene {edad} años</p>;
}

function Demo() {
  return (
    <div>
      <Saludo nombre="Leo" edad={30} />
      <Saludo nombre="Ana" />
    </div>
  );
}`,
    ojo: [
      'Las props son de solo lectura: el hijo nunca las modifica.',
      'Los textos van entre comillas (`nombre="Leo"`); números, booleanos, objetos y funciones, entre llaves (`edad={30}`).',
      'Con destructuring en el parámetro podés poner valores por defecto.'
    ]
  },
  {
    g: 'Base', t: 'Listas y key',
    que: 'Para mostrar una lista, transformás el array de datos en un array de elementos con `map`. Cada elemento lleva una `key` única.',
    cuando: 'Cada vez que mostrás datos que vienen en un array: productos, usuarios, mensajes.',
    code: `const productos = [
  { id: 1, nombre: 'Yerba', precio: 3000 },
  { id: 2, nombre: 'Termo', precio: 45000 },
  { id: 3, nombre: 'Mate', precio: 12000 }
];

function Demo() {
  return (
    <ul>
      {productos.map((p) => (
        <li key={p.id}>{p.nombre}: \${p.precio}</li>
      ))}
    </ul>
  );
}`,
    ojo: [
      'La `key` le dice a React qué elemento es cuál entre renders. Tiene que ser única y estable: un id.',
      'Evitá usar el índice como key si la lista se puede reordenar o borrar: React mezcla los elementos (mirá la predicción "key con el índice").'
    ]
  },
  {
    g: 'Base', t: 'Renderizado condicional',
    que: 'Mostrar una cosa u otra según una condición, usando JavaScript común: `if`, ternario o `&&`.',
    cuando: 'Cargando o no, logueado o no, lista vacía o con datos.',
    code: `function Estado({ cargando, error }) {
  if (cargando) return <p>Cargando...</p>;
  return error ? <p role="alert">Error: {error}</p> : <p>Todo bien</p>;
}

function Demo() {
  const mensajes = 3;
  return (
    <div>
      <Estado cargando={true} />
      <Estado cargando={false} error="HTTP 500" />
      <Estado cargando={false} />
      {mensajes > 0 && <p>Tenés {mensajes} mensajes</p>}
    </div>
  );
}`,
    ojo: [
      'Con varios casos, los `if` con `return` temprano se leen mejor que ternarios anidados.',
      'Cuidado con `lista.length && <Algo />`: si el largo es 0, aparece un "0" en pantalla. Usá `lista.length > 0 &&`.',
      'Devolver `null` significa "no mostrar nada".'
    ]
  },
  {
    g: 'Estado', t: 'useState',
    que: 'El estado es la memoria del componente: datos que cambian con el tiempo. `useState` te da el valor actual y una función para cambiarlo; al cambiarlo, React vuelve a renderizar.',
    cuando: 'Para todo lo que cambia por interacción del usuario o por datos que llegan: un contador, el texto de un input, si un menú está abierto.',
    code: `function Demo() {
  const [clicks, setClicks] = useState(0);
  const [abierto, setAbierto] = useState(false);

  return (
    <div>
      <button onClick={() => setClicks(clicks + 1)}>Clicks: {clicks}</button>
      <button onClick={() => setAbierto(!abierto)}>
        {abierto ? 'Cerrar' : 'Abrir'} menú
      </button>
      {abierto && <p>Soy el menú</p>}
    </div>
  );
}`,
    ojo: [
      'Una variable común (`let x`) no sirve: se reinicia en cada render y React no se entera de que cambió.',
      'El valor nuevo se ve en el próximo render, no en la línea siguiente al `set`.',
      'Si el valor nuevo depende del anterior, usá la forma con función: `setClicks((c) => c + 1)`.'
    ]
  },
  {
    g: 'Estado', t: 'Eventos',
    que: 'Los eventos se manejan pasando una función a props como `onClick`, `onChange` o `onSubmit`.',
    cuando: 'Para responder a lo que hace el usuario.',
    code: `function Demo() {
  const [log, setLog] = useState('Todavía nada');

  const saludar = (nombre) => setLog('Hola, ' + nombre);

  return (
    <div>
      <button onClick={() => setLog('Hiciste clic')}>Clic</button>
      <button onClick={() => saludar('Leo')}>Saludar</button>
      <input placeholder="Escribí algo" onChange={(e) => setLog('Escribiste: ' + e.target.value)} />
      <p>{log}</p>
    </div>
  );
}`,
    ojo: [
      'Pasá la función, no la llames: `onClick={saludar}` o `onClick={() => saludar(\'Leo\')}`. Con `onClick={saludar(\'Leo\')}` se ejecutaría en cada render.',
      'El evento (`e`) trae datos útiles: `e.target.value` en un input, `e.preventDefault()` en un form.'
    ]
  },
  {
    g: 'Estado', t: 'Formularios controlados',
    que: 'Un input controlado toma su valor del estado (`value`) y actualiza el estado en cada tecla (`onChange`). Así React siempre sabe qué hay escrito.',
    cuando: 'En formularios donde necesitás validar, limpiar el campo o usar el texto mientras se escribe.',
    code: `function Demo() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(null);
  const valido = email.includes('@');

  const enviar = (e) => {
    e.preventDefault(); // evita que se recargue la página
    setEnviado(email);
    setEmail('');
  };

  return (
    <form onSubmit={enviar}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
      <button disabled={!valido}>Enviar</button>
      {!valido && email && <p role="alert">Falta el @</p>}
      {enviado && <p>Enviado: {enviado}</p>}
    </form>
  );
}`,
    ojo: [
      '`value` + `onChange` van juntos: con `value` solo, el input queda bloqueado.',
      'Usá `onSubmit` en el `<form>` (funciona también con Enter) y llamá a `e.preventDefault()`.',
      'La validez no va en otro estado: se calcula a partir del email.'
    ]
  },
  {
    g: 'Estado', t: 'Levantar el estado',
    que: 'Cuando dos componentes necesitan el mismo dato, el estado se sube al padre común. El padre baja el dato por props y el hijo avisa cambios llamando a una función que recibe por props.',
    cuando: 'Un formulario que agrega a una lista que muestra otro componente, un filtro que afecta a una tabla.',
    code: `function Buscador({ texto, onCambio }) {
  return <input value={texto} onChange={(e) => onCambio(e.target.value)} placeholder="Filtrar" />;
}

function Lista({ items }) {
  return <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>;
}

function Demo() {
  const [texto, setTexto] = useState('');
  const frutas = ['Banana', 'Manzana', 'Naranja', 'Mandarina'];
  const filtradas = frutas.filter((f) => f.toLowerCase().includes(texto.toLowerCase()));

  return (
    <div>
      <Buscador texto={texto} onCambio={setTexto} />
      <Lista items={filtradas} />
    </div>
  );
}`,
    ojo: [
      'Los datos bajan por props y los eventos suben por funciones.',
      'Si tenés que pasar una prop por muchos niveles solo para que llegue abajo ("prop drilling"), considerá Context.'
    ]
  },
  {
    g: 'Estado', t: 'Estado con objetos y arrays',
    que: 'El estado nunca se modifica directamente: se reemplaza por una copia nueva. Para eso se usan spread, `map` y `filter`.',
    cuando: 'Siempre que el estado sea un objeto o un array: agregar, editar o borrar elementos.',
    code: `function Demo() {
  const [usuario, setUsuario] = useState({ nombre: 'Leo', edad: 30 });
  const [tags, setTags] = useState(['react']);

  return (
    <div>
      <p>{usuario.nombre}, {usuario.edad} años · tags: {tags.join(', ')}</p>
      <button onClick={() => setUsuario({ ...usuario, edad: usuario.edad + 1 })}>Cumplir años</button>
      <button onClick={() => setTags([...tags, 'hooks'])}>Agregar tag</button>
      <button onClick={() => setTags(tags.filter((t) => t !== 'hooks'))}>Quitar "hooks"</button>
    </div>
  );
}`,
    ojo: [
      'Agregar: `[...lista, nuevo]`. Borrar: `lista.filter(...)`. Editar: `lista.map(x => x.id === id ? { ...x, cambio } : x)`.',
      'Si hacés `push` y le pasás el mismo array a `set`, React no ve el cambio (compara referencias).'
    ]
  },
  {
    g: 'Efectos', t: 'useEffect y sus dependencias',
    que: '`useEffect` ejecuta código después de que el componente se muestra. Sirve para sincronizarse con algo de afuera de React: una API, un timer, el título de la página.',
    cuando: 'Pedir datos, suscribirse a eventos, timers. No para calcular datos a partir de props o estado (eso se calcula directo en el render).',
    code: `function Demo() {
  const [n, setN] = useState(0);

  useEffect(() => {
    console.log('corre una sola vez, al montar');
  }, []);

  useEffect(() => {
    console.log('corre cuando cambia n:', n);
  }, [n]);

  return <button onClick={() => setN(n + 1)}>n = {n}</button>;
}`,
    ojo: [
      'Sin array: corre después de cada render. Con `[]`: solo al montar. Con `[n]`: al montar y cada vez que cambia `n`.',
      'Todo lo que el efecto usa de props o estado va en las dependencias.',
      'En desarrollo, con StrictMode, React monta, desmonta y vuelve a montar a propósito: por eso a veces un efecto con `[]` corre dos veces.'
    ]
  },
  {
    g: 'Efectos', t: 'Pedir datos con useEffect',
    que: 'El patrón clásico: tres estados (datos, cargando, error), un `useEffect` con `[]` que hace el `fetch` y un render según el estado.',
    cuando: 'Cuando un componente necesita datos de una API al mostrarse. Este ejemplo pega a una API de prueba real.',
    code: `function Demo() {
  const [posts, setPosts] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        setPosts(await res.json());
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
  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}`,
    ojo: [
      'La función del efecto no puede ser `async`: se declara una función `async` adentro y se la llama.',
      'Sin el `[]`, cada `set` provocaría un render, que volvería a pedir: loop infinito.',
      'En proyectos reales se suele usar TanStack Query o similar, que resuelve caché, reintentos y carreras.'
    ]
  },
  {
    g: 'Efectos', t: 'Cleanup',
    que: 'La función que devuelve un efecto es su limpieza. React la ejecuta cuando el componente se desmonta y antes de volver a correr el efecto.',
    cuando: 'Para apagar lo que el efecto prendió: intervalos, suscripciones, listeners, pedidos en curso.',
    code: `function Reloj() {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    console.log('arranca el intervalo');
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => {
      console.log('limpio el intervalo');
      clearInterval(id);
    };
  }, []);

  return <p>Segundos: {segundos}</p>;
}

function Demo() {
  const [visible, setVisible] = useState(true);
  return (
    <div>
      <button onClick={() => setVisible(!visible)}>{visible ? 'Ocultar' : 'Mostrar'}</button>
      {visible && <Reloj />}
    </div>
  );
}`,
    ojo: [
      'Sin cleanup, el intervalo sigue corriendo aunque el componente ya no exista (pérdida de memoria).',
      'Para un `fetch`, el cleanup puede cancelar el pedido con `AbortController` o marcar una variable para ignorar la respuesta.'
    ]
  },
  {
    g: 'Otros hooks', t: 'useRef',
    que: '`useRef` guarda un valor que persiste entre renders pero que, al cambiar, no provoca un render. También sirve para acceder a un elemento del DOM.',
    cuando: 'Hacer foco en un input, guardar el id de un timer, contar algo sin mostrarlo.',
    code: `function Demo() {
  const inputRef = useRef(null);
  const renders = useRef(0);
  const [texto, setTexto] = useState('');

  renders.current += 1;

  return (
    <div>
      <input ref={inputRef} value={texto} onChange={(e) => setTexto(e.target.value)} />
      <button onClick={() => inputRef.current.focus()}>Hacer foco</button>
      <p>Renders: {renders.current}</p>
    </div>
  );
}`,
    ojo: [
      'El valor está en `.current`.',
      'Si lo que guardás se tiene que ver en pantalla, va en el estado, no en un ref.'
    ]
  },
  {
    g: 'Otros hooks', t: 'useMemo y useCallback',
    que: '`useMemo` guarda el resultado de un cálculo y solo lo recalcula si cambian sus dependencias. `useCallback` hace lo mismo con una función.',
    cuando: 'Solo cuando hay un problema de rendimiento medido: cálculos pesados o funciones que se pasan a hijos envueltos en `React.memo`.',
    code: `function Demo() {
  const [n, setN] = useState(20);
  const [otro, setOtro] = useState(0);

  const primos = useMemo(() => {
    console.log('calculando primos hasta', n);
    const lista = [];
    for (let i = 2; i <= n; i++) {
      if (lista.every((p) => i % p !== 0)) lista.push(i);
    }
    return lista;
  }, [n]);

  return (
    <div>
      <button onClick={() => setN(n + 10)}>Hasta {n}</button>
      <button onClick={() => setOtro(otro + 1)}>Otro estado: {otro}</button>
      <p>{primos.join(', ')}</p>
    </div>
  );
}`,
    ojo: [
      'Mirá la consola: al tocar "Otro estado" no se recalcula, porque `n` no cambió.',
      'No hace falta usarlos en todos lados: agregan complejidad y la mayoría de los cálculos son baratos.'
    ]
  },
  {
    g: 'Otros hooks', t: 'Context',
    que: 'Context permite compartir un dato con todo un árbol de componentes sin pasarlo por props nivel por nivel.',
    cuando: 'Datos "globales": el usuario logueado, el tema (claro u oscuro), el idioma.',
    code: `const TemaContext = createContext('claro');

function Boton() {
  const tema = useContext(TemaContext);
  return <button>Soy un botón {tema}</button>;
}

function Barra() {
  return <div><Boton /></div>; // no recibe ni pasa el tema
}

function Demo() {
  const [tema, setTema] = useState('claro');
  return (
    <TemaContext.Provider value={tema}>
      <Barra />
      <button onClick={() => setTema(tema === 'claro' ? 'oscuro' : 'claro')}>Cambiar tema</button>
    </TemaContext.Provider>
  );
}`,
    ojo: [
      'Cuando cambia el valor del Provider, se re-renderizan todos los que lo usan.',
      'Para estado global complejo se suele usar una librería (Zustand, Redux Toolkit), pero Context alcanza para casos simples.'
    ]
  },
  {
    g: 'Otros hooks', t: 'Custom hooks',
    que: 'Un custom hook es una función que empieza con `use` y usa otros hooks. Sirve para reutilizar lógica con estado entre componentes.',
    cuando: 'Cuando repetís la misma combinación de estado y efectos en varios lugares: pedir datos, leer el tamaño de la ventana, un contador.',
    code: `function useContador(inicial = 0) {
  const [n, setN] = useState(inicial);
  const sumar = () => setN((x) => x + 1);
  const reiniciar = () => setN(inicial);
  return { n, sumar, reiniciar };
}

function Demo() {
  const a = useContador();
  const b = useContador(10);
  return (
    <div>
      <button onClick={a.sumar}>A: {a.n}</button>
      <button onClick={b.sumar}>B: {b.n}</button>
      <button onClick={() => { a.reiniciar(); b.reiniciar(); }}>Reiniciar</button>
    </div>
  );
}`,
    ojo: [
      'Cada componente que usa el hook tiene su propio estado: A y B son independientes.',
      'El nombre tiene que empezar con `use` para que React (y el linter) apliquen las reglas de los hooks.'
    ]
  },
  {
    g: 'Otros hooks', t: 'Reglas de los hooks',
    que: 'Los hooks se llaman siempre en el nivel superior del componente y en el mismo orden en cada render.',
    cuando: 'Siempre. React identifica cada `useState` por el orden en que se llama.',
    code: `function Perfil({ logueado }) {
  // ❌ Mal: un hook dentro de un if
  // if (logueado) {
  //   const [nombre, setNombre] = useState('');
  // }

  // ✅ Bien: el hook siempre se llama; la condición va adentro o en el render
  const [nombre, setNombre] = useState('');
  if (!logueado) return <p>Iniciá sesión</p>;
  return <input value={nombre} onChange={(e) => setNombre(e.target.value)} />;
}`,
    run: false,
    ojo: [
      'Nada de hooks dentro de `if`, `for` o funciones comunes.',
      'Solo se llaman desde componentes o desde otros custom hooks.',
      'El `return` temprano va después de todos los hooks.'
    ]
  }
];

function openGuide(i) {
  S.guide = i;
  S.guideSeen[i] = true;
  save();
  renderGuide();
  $('#guide-main').scrollTop = 0;
}

function renderGuide() {
  const list = $('#guide-list');
  list.innerHTML = listHTML(GUIDE, S.guide, (x, i) => S.guideSeen[i], 'Tema');
  keepInView(list, $('.cur', list));

  const x = GUIDE[S.guide];
  const runs = x.run !== false;
  unmountPreview($('#guide-pv'));
  let html = '<p class="kicker">' + esc(x.g) + ' · tema ' + (S.guide + 1) + ' de ' + GUIDE.length + '</p>' +
    '<h2>' + esc(x.t) + '</h2>' +
    '<div class="desc"><p>' + md(x.que) + '</p></div>' +
    '<h3>Cuándo lo usás</h3><div class="desc"><p>' + md(x.cuando) + '</p></div>' +
    '<h3>Ejemplo</h3><pre class="code">' + highlight(x.code) + '</pre>';
  if (runs) {
    html += '<h3 class="pv-label">Resultado <button type="button" data-act="reset">Reiniciar</button></h3><div class="pv" id="guide-pv"></div>' +
      (/console\.log/.test(x.code) ? '<h3>Consola</h3><div id="guide-out"></div>' : '');
  }
  html += '<h3>Tené en cuenta</h3><ul class="notes">' + x.ojo.map((o) => '<li>' + md(o) + '</li>').join('') + '</ul>' +
    '<div class="row">' +
    '<button type="button" data-act="prev"' + (S.guide ? '' : ' disabled') + '>← Anterior</button>' +
    (runs ? '<button type="button" data-act="play">Probar en el playground</button>' : '') +
    (S.guide < GUIDE.length - 1 ? '<button type="button" class="primary push" data-act="next">Siguiente →</button>' : '') +
    '</div>';
  $('#guide-main').innerHTML = html;
  if (runs) runDemo(x.code, $('#guide-pv'), $('#guide-out'));
}

$('#guide-list').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-i]');
  if (b) openGuide(+b.dataset.i);
});

$('#guide-main').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]');
  if (!b || b.closest('.pv')) return;
  const x = GUIDE[S.guide];
  if (b.dataset.act === 'prev') openGuide(S.guide - 1);
  if (b.dataset.act === 'next') openGuide(S.guide + 1);
  if (b.dataset.act === 'reset') runDemo(x.code, $('#guide-pv'), $('#guide-out'));
  if (b.dataset.act === 'play') openInPlayground(x.code.replace(/function Demo\(/, 'function App('));
});
