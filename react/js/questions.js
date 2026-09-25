/* Preguntas de entrevista sobre React como tarjetas: primero la respondés en voz alta, después ves
   la respuesta corta (lo que dirías), la explicación simple y, si hay, un ejemplo funcionando. */

const QUESTIONS = [
  {
    g: 'Conceptos', t: '¿Qué es React?',
    corta: 'Es una librería de JavaScript para construir interfaces a partir de componentes. Vos describís cómo se ve la pantalla según los datos, y React se encarga de actualizarla cuando los datos cambian.',
    explica: [
      'Es declarativo: no le decís "agregá este `<li>`", le decís "la lista es esto" y React calcula qué cambiar.',
      'Todo se arma con componentes reutilizables, que son funciones.',
      'Es una librería, no un framework completo: para rutas, pedidos o estado global se suman otras herramientas (o se usa un framework como Next.js).'
    ]
  },
  {
    g: 'Conceptos', t: '¿Qué es JSX?',
    corta: 'Es una sintaxis parecida a HTML que se escribe dentro de JavaScript. Un compilador (como Babel) la transforma en llamadas a `React.createElement`.',
    explica: [
      'No es HTML: es JavaScript. Por eso se usa `className` en vez de `class` y `{ }` para meter expresiones.',
      'Se puede usar dentro de un `if`, guardar en variables o devolver desde funciones, como cualquier valor.'
    ],
    code: `// Esto:
const a = <h2 className="titulo">Hola, {nombre}</h2>;

// Se compila a esto:
const b = React.createElement('h2', { className: 'titulo' }, 'Hola, ', nombre);`
  },
  {
    g: 'Conceptos', t: '¿Qué es el Virtual DOM?',
    corta: 'Es una representación en memoria de cómo debería verse la interfaz. Cuando cambia el estado, React arma una nueva, la compara con la anterior y aplica en el DOM real solo las diferencias.',
    explica: [
      'Tocar el DOM real es lento; comparar objetos en memoria es rápido.',
      'A esa comparación se la llama reconciliación. Las `key` le ayudan a saber qué elemento de una lista es cuál.',
      'Por eso "renderizar" no significa "redibujar toda la pantalla": React cambia solo lo necesario.'
    ]
  },
  {
    g: 'Conceptos', t: '¿Props o estado?',
    corta: 'Las props son datos que un componente recibe de su padre y no puede modificar. El estado son datos propios del componente que sí puede cambiar, y al cambiarlos se vuelve a renderizar.',
    explica: [
      'Props: como los parámetros de una función. Estado: como la memoria del componente.',
      'Un mismo dato puede ser estado en el padre y prop en el hijo.',
      'Si algo se puede calcular a partir de props o de otro estado, no va en el estado: se calcula.'
    ],
    code: `function Hijo({ valor }) {
  return <p>El hijo recibe por props: {valor}</p>;
}

function Demo() {
  const [valor, setValor] = useState(0);
  return (
    <div>
      <button onClick={() => setValor(valor + 1)}>El padre cambia su estado: {valor}</button>
      <Hijo valor={valor} />
    </div>
  );
}`
  },
  {
    g: 'Conceptos', t: '¿Cuándo se vuelve a renderizar un componente?',
    corta: 'Cuando cambia su estado, cuando se renderiza su padre, o cuando cambia un Context que usa.',
    explica: [
      'Que el padre se renderice alcanza, aunque las props del hijo no hayan cambiado.',
      'Para evitarlo en componentes costosos existe `React.memo`, que solo lo renderiza si cambian sus props.',
      'Renderizar no es lo mismo que tocar el DOM: React compara y cambia solo lo necesario.'
    ]
  },
  {
    g: 'Estado', t: '¿Por qué no hay que modificar el estado directamente?',
    corta: 'Porque React detecta los cambios comparando referencias. Si modificás el mismo objeto o array, la referencia es la misma y React no se entera: no vuelve a renderizar.',
    explica: [
      'Siempre se crea una copia nueva: spread para objetos (`{ ...obj }`), y spread, `map` o `filter` para arrays.',
      'Además, mutar el estado rompe herramientas como el "deshacer" y hace el código difícil de seguir.'
    ],
    code: `function Demo() {
  const [lista, setLista] = useState(['a']);
  return (
    <div>
      <button onClick={() => { lista.push('x'); setLista(lista); }}>Mutar (no anda)</button>
      <button onClick={() => setLista([...lista, 'y'])}>Copia nueva (anda)</button>
      <p>{lista.join(', ')}</p>
    </div>
  );
}`
  },
  {
    g: 'Estado', t: '¿Por qué después de un setState el valor no cambia enseguida?',
    corta: 'Porque `setState` no cambia la variable: le pide a React un render nuevo. En el render actual el valor sigue siendo el mismo; el nuevo aparece en el próximo render.',
    explica: [
      'React además agrupa varias actualizaciones seguidas en un solo render (batching).',
      'Si el valor nuevo depende del anterior, se usa la forma con función: `setN((prev) => prev + 1)`.'
    ],
    code: `function Demo() {
  const [n, setN] = useState(0);
  const [log, setLog] = useState('');
  const sumar = () => {
    setN(n + 1);
    setLog('Justo después del set, n todavía vale ' + n);
  };
  return (
    <div>
      <button onClick={sumar}>n = {n}</button>
      <p>{log}</p>
    </div>
  );
}`
  },
  {
    g: 'Estado', t: '¿Para qué sirve la key en una lista?',
    corta: 'Para que React identifique cada elemento entre renders. Así, si agregás, borrás o reordenás, sabe cuál es cuál y no mezcla su estado.',
    explica: [
      'Tiene que ser única entre hermanos y estable: lo ideal es un id que venga de los datos.',
      'El índice sirve solo si la lista nunca cambia de orden ni se borran elementos.',
      'Con una key incorrecta aparecen errores raros: inputs con el texto de otro elemento, por ejemplo.'
    ]
  },
  {
    g: 'Estado', t: '¿Componente controlado o no controlado?',
    corta: 'En un input controlado, el valor vive en el estado de React (`value` + `onChange`). En uno no controlado, el valor lo guarda el propio DOM y se lee cuando hace falta, por ejemplo con un `ref`.',
    explica: [
      'Controlado: ideal para validar mientras se escribe, limpiar el campo o deshabilitar un botón.',
      'No controlado: más simple para formularios chicos, o con librerías como React Hook Form.'
    ],
    code: `function Demo() {
  const [controlado, setControlado] = useState('');
  const ref = useRef(null);
  const [leido, setLeido] = useState('');
  return (
    <div>
      <input value={controlado} onChange={(e) => setControlado(e.target.value)} placeholder="controlado" />
      <p>Mientras escribís: {controlado}</p>
      <input ref={ref} placeholder="no controlado" />
      <button onClick={() => setLeido(ref.current.value)}>Leer</button>
      <p>Leído al tocar el botón: {leido}</p>
    </div>
  );
}`
  },
  {
    g: 'Estado', t: '¿Qué es "levantar el estado"?',
    corta: 'Cuando dos componentes necesitan el mismo dato, se mueve el estado al padre común. El padre lo pasa por props y los hijos avisan cambios llamando a funciones que también reciben por props.',
    explica: [
      'Los datos bajan (props) y los eventos suben (callbacks).',
      'Si hay que pasar props por muchos niveles solo para que lleguen abajo, eso se llama prop drilling, y se puede resolver con Context.'
    ]
  },
  {
    g: 'Hooks', t: '¿Qué es un hook?',
    corta: 'Es una función especial de React, que empieza con `use`, para usar estado y otras capacidades de React dentro de componentes de función.',
    explica: [
      'Los más usados: `useState` (estado), `useEffect` (efectos), `useRef`, `useContext`, `useMemo` y `useCallback`.',
      'Reglas: se llaman siempre en el nivel superior del componente (nunca dentro de `if` o `for`) y solo desde componentes o custom hooks.',
      'React identifica cada hook por el orden en que se llama; por eso ese orden no puede cambiar entre renders.'
    ]
  },
  {
    g: 'Hooks', t: '¿Cómo funciona useEffect y su array de dependencias?',
    corta: 'Ejecuta código después del render para sincronizarse con algo de afuera. El array dice cuándo volver a correrlo: sin array, en cada render; con `[]`, solo al montar; con `[a, b]`, cuando cambian `a` o `b`.',
    explica: [
      'Todo lo que el efecto usa de props o estado va en las dependencias.',
      'Si devuelve una función, esa es la limpieza: corre al desmontar y antes de volver a ejecutar el efecto.',
      'No es para calcular datos derivados: eso se calcula directo en el render.'
    ],
    code: `function Demo() {
  const [n, setN] = useState(0);
  const [log, setLog] = useState([]);

  useEffect(() => {
    setLog((l) => [...l, 'efecto con [n]: n = ' + n]);
  }, [n]);

  return (
    <div>
      <button onClick={() => setN(n + 1)}>Cambiar n ({n})</button>
      <ul>{log.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}`
  },
  {
    g: 'Hooks', t: '¿Para qué sirve el cleanup de un useEffect?',
    corta: 'Para deshacer lo que hizo el efecto: limpiar un intervalo, cancelar una suscripción o un pedido. React lo ejecuta al desmontar el componente y antes de volver a correr el efecto.',
    explica: [
      'Sin cleanup quedan intervalos y listeners vivos: pérdida de memoria y actualizaciones de componentes que ya no existen.',
      'En pedidos a una API sirve para ignorar respuestas viejas cuando cambian las dependencias.'
    ]
  },
  {
    g: 'Hooks', t: '¿Cómo harías un fetch en un componente?',
    corta: 'Con tres estados (datos, cargando y error) y un `useEffect` con `[]` que hace el pedido con `try/catch`, revisa `res.ok` y actualiza los estados. En un proyecto real usaría TanStack Query, que además maneja caché y reintentos.',
    explica: [
      'La función del efecto no puede ser `async`: se declara una adentro y se llama.',
      'El `finally` apaga el cargando pase lo que pase.',
      'Si el pedido depende de una prop (un id), va en las dependencias y se ignora la respuesta vieja en el cleanup.'
    ],
    code: `function Demo() {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/users/1');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        setUser(await res.json());
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
  return <p>{user.name} · {user.email}</p>;
}`
  },
  {
    g: 'Hooks', t: '¿useRef o useState?',
    corta: '`useState` es para datos que se ven en pantalla: cambiarlos provoca un render. `useRef` guarda un valor que persiste entre renders pero no provoca render al cambiar; también sirve para acceder a un elemento del DOM.',
    explica: [
      'Casos típicos de `useRef`: hacer foco en un input, guardar el id de un timer, guardar el valor anterior de algo.',
      'Se lee y se escribe en `.current`.'
    ]
  },
  {
    g: 'Hooks', t: '¿Cuándo usarías useMemo y useCallback?',
    corta: 'Solo cuando hay un problema de rendimiento: `useMemo` para no repetir un cálculo pesado y `useCallback` para no crear una función nueva en cada render cuando se la paso a un hijo memorizado.',
    explica: [
      'Los dos reciben dependencias y solo recalculan cuando estas cambian.',
      'Usarlos en todos lados no hace la app más rápida: agrega complejidad. Primero se mide.'
    ]
  },
  {
    g: 'Hooks', t: '¿Qué es Context y cuándo lo usás?',
    corta: 'Es una forma de compartir un dato con todo un árbol de componentes sin pasarlo por props nivel por nivel. Lo uso para datos globales como el usuario logueado, el tema o el idioma.',
    explica: [
      'Se crea con `createContext`, se provee con `<MiContext.Provider value={...}>` y se lee con `useContext(MiContext)`.',
      'Cada vez que cambia el valor, se re-renderizan todos los que lo usan: para estado global grande conviene una librería como Zustand o Redux Toolkit.'
    ]
  },
  {
    g: 'Hooks', t: '¿Por qué un useEffect corre dos veces en desarrollo?',
    corta: 'Por el StrictMode: en desarrollo, React monta, desmonta y vuelve a montar cada componente a propósito, para detectar efectos que no se limpian bien. En producción corre una sola vez.',
    explica: [
      'Si al correr dos veces algo se rompe (dos suscripciones, dos intervalos), falta el cleanup.',
      'No hay que "arreglarlo" sacando el StrictMode: hay que escribir el efecto con su limpieza.'
    ]
  },
  {
    g: 'Hooks', t: '¿Componentes de clase o de función?',
    corta: 'Hoy se usan componentes de función con hooks. Los de clase son la forma vieja: usaban `this.state` y métodos de ciclo de vida como `componentDidMount`. Los sigo pudiendo leer en código existente.',
    explica: [
      '`componentDidMount` equivale a un `useEffect` con `[]`, y `componentWillUnmount` a su cleanup.',
      'Lo único que todavía requiere una clase es un Error Boundary (capturar errores de render).'
    ]
  }
];

let qOpen = false;  // respuesta visible

function openQuestion(i) {
  S.question = i;
  save();
  qOpen = false;
  renderQuestion();
  $('#q-main').scrollTop = 0;
}

function renderQuestion() {
  renderQuestionList();
  keepInView($('#q-list'), $('#q-list .cur'));

  const q = QUESTIONS[S.question];
  const known = !!S.qKnown[q.t];
  const demo = q.code && /function Demo\(/.test(q.code);
  unmountPreview($('#q-pv'));
  let html = '<p class="kicker">' + esc(q.g) + ' · pregunta ' + (S.question + 1) + ' de ' + QUESTIONS.length + '</p>' +
    '<h2>' + esc(q.t) + '</h2>';
  if (!qOpen) {
    html += '<div class="tip"><strong>Respondé en voz alta antes de mirar.</strong><p>Como en la entrevista: una frase corta primero y, si te piden más, un ejemplo.</p></div>' +
      '<div class="row"><button type="button" class="primary" data-act="reveal">Ver respuesta</button></div>';
  } else {
    html += '<div id="q-answer"><h3>Respuesta corta</h3><div class="say">' + md(q.corta) + '</div>' +
      '<h3>Explicado simple</h3><ul class="notes">' + q.explica.map((p) => '<li>' + md(p) + '</li>').join('') + '</ul>';
    if (q.code) {
      html += '<h3>Ejemplo</h3><pre class="code">' + highlight(q.code) + '</pre>' +
        (demo ? '<h3>Resultado</h3><div class="pv" id="q-pv"></div>' : '');
    }
    html += '</div><div class="row">' +
      '<button type="button" data-act="known">' + (known ? '✓ La sé (desmarcar)' : 'La sé') + '</button>' +
      (demo ? '<button type="button" data-act="play">Probar en el playground</button>' : '') +
      '</div>';
  }
  html += '<div class="row">' +
    '<button type="button" data-act="prev"' + (S.question ? '' : ' disabled') + '>← Anterior</button>' +
    (S.question < QUESTIONS.length - 1 ? '<button type="button" class="primary push" data-act="next">Siguiente →</button>' : '') +
    '</div>';
  $('#q-main').innerHTML = html;
  if (qOpen && demo) runDemo(q.code, $('#q-pv'), null);
}

$('#q-list').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-i]');
  if (b) openQuestion(+b.dataset.i);
});

$('#q-main').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]');
  if (!b || b.closest('.pv')) return;
  const q = QUESTIONS[S.question];
  const act = b.dataset.act;
  if (act === 'reveal') {
    qOpen = true;
    renderQuestion();
    scrollInside($('#q-main'), $('#q-answer'));
  }
  if (act === 'prev') openQuestion(S.question - 1);
  if (act === 'next') openQuestion(S.question + 1);
  if (act === 'play') openInPlayground(q.code.replace(/function Demo\(/, 'function App('));
  if (act === 'known') {
    if (S.qKnown[q.t]) delete S.qKnown[q.t];
    else S.qKnown[q.t] = true;
    save();
    renderStats();
    /* Solo cambia el botón: así no se reinicia la demo */
    b.textContent = S.qKnown[q.t] ? '✓ La sé (desmarcar)' : 'La sé';
    renderQuestionList();
  }
});

function renderQuestionList() {
  $('#q-list').innerHTML = listHTML(QUESTIONS, S.question, (q) => S.qKnown[q.t], 'Pregunta');
}
