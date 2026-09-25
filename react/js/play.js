/* Playground: escribís un componente App y lo ves funcionando al lado. Acá fetch es el real. */

const EJEMPLOS = {
  usuarios: `// fetch real con loading, error y cleanup: lo típico que te piden en una entrevista
function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch('https://jsonplaceholder.typicode.com/users', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(setUsuarios)
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message);
      })
      .finally(() => setCargando(false));

    return () => controller.abort(); // si se desmonta, cancela el pedido
  }, []);

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p role="alert">Error: {error}</p>;

  return (
    <ul>
      {usuarios.map((u) => (
        <li key={u.id}>{u.name} · {u.email}</li>
      ))}
    </ul>
  );
}
`,
  contador: `function App() {
  const [n, setN] = useState(0);

  console.log('render con n =', n);

  return (
    <div>
      <h2>Contador: {n}</h2>
      <button onClick={() => setN(n + 1)}>+1</button>
      <button onClick={() => setN((prev) => prev - 1)}>-1</button>
      <button onClick={() => setN(0)}>Reiniciar</button>
    </div>
  );
}
`,
  tareas: `// Estado levantado: el padre guarda la lista y el hijo le avisa cuando se agrega una tarea
function FormTarea({ onAgregar }) {
  const [texto, setTexto] = useState('');

  const enviar = (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    onAgregar(texto.trim());
    setTexto('');
  };

  return (
    <form onSubmit={enviar}>
      <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Nueva tarea" />
      <button>Agregar</button>
    </form>
  );
}

function App() {
  const [tareas, setTareas] = useState([
    { id: 1, texto: 'Repasar hooks', hecha: false }
  ]);

  const agregar = (texto) => setTareas([...tareas, { id: Date.now(), texto, hecha: false }]);
  const alternar = (id) => setTareas(tareas.map((t) => (t.id === id ? { ...t, hecha: !t.hecha } : t)));
  const borrar = (id) => setTareas(tareas.filter((t) => t.id !== id));

  return (
    <div>
      <FormTarea onAgregar={agregar} />
      <ul>
        {tareas.map((t) => (
          <li key={t.id}>
            <input type="checkbox" checked={t.hecha} onChange={() => alternar(t.id)} />
            {t.hecha ? <s>{t.texto}</s> : t.texto}
            <button onClick={() => borrar(t.id)}>Borrar</button>
          </li>
        ))}
      </ul>
      <p>{tareas.filter((t) => !t.hecha).length} pendientes</p>
    </div>
  );
}
`,
  reloj: `// useEffect con cleanup: mostrá y ocultá el reloj y mirá la consola
function Reloj() {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    console.log('montado: arranca el intervalo');
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => {
      console.log('desmontado: limpio el intervalo');
      clearInterval(id);
    };
  }, []);

  return <p>Segundos: {segundos}</p>;
}

function App() {
  const [visible, setVisible] = useState(true);
  return (
    <div>
      <button onClick={() => setVisible(!visible)}>{visible ? 'Ocultar' : 'Mostrar'} reloj</button>
      {visible && <Reloj />}
    </div>
  );
}
`
};

function initPlayground() {
  $('#tab-play').innerHTML =
    '<div class="play">' +
    '<div>' +
    '<textarea class="ed" id="play-ed" aria-label="Editor del playground"></textarea>' +
    '<div class="row">' +
    '<select id="play-ej" aria-label="Cargar un ejemplo">' +
    '<option value="">Cargar un ejemplo…</option>' +
    '<option value="usuarios">fetch con loading y error</option>' +
    '<option value="contador">Contador con useState</option>' +
    '<option value="tareas">Lista de tareas (estado levantado)</option>' +
    '<option value="reloj">Reloj con cleanup</option>' +
    '</select>' +
    '<button type="button" class="primary push" id="play-run">Ejecutar</button>' +
    '</div>' +
    '<p class="desc note">Escribí un componente <code>App</code>: es el que se muestra. Los hooks ya están disponibles y <code>fetch</code> es el de verdad.</p>' +
    '</div>' +
    '<div class="side-out">' +
    '<div class="pv" id="play-pv"></div>' +
    '<div id="play-out"></div>' +
    '</div>' +
    '</div>';

  const ta = $('#play-ed');
  ta.value = S.play ?? EJEMPLOS.usuarios;
  setupEditor(ta, { onRun: runPlayground });
  ta.addEventListener('input', () => { S.play = ta.value; saveSoon(); });
  $('#play-run').addEventListener('click', runPlayground);
  $('#play-ej').addEventListener('change', (e) => {
    if (!e.target.value) return;
    loadPlayground(EJEMPLOS[e.target.value]);
    e.target.value = '';
  });
  runPlayground();
}

function loadPlayground(code) {
  $('#play-ed').value = code;
  S.play = code;
  save();
  runPlayground();
}

function runPlayground() {
  runDemo($('#play-ed').value, $('#play-pv'), $('#play-out'), 'App');
}

/* Lo usan las predicciones, la guía y las preguntas: "Abrir en el playground" */
function openInPlayground(code) {
  showTab('play');
  loadPlayground(code);
  $('#play-ed').focus();
}
