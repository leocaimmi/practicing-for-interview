/* "¿Qué pasa si…?": leés un componente, elegís qué va a pasar y después lo probás en vivo.
   Son las trampas clásicas de React que suelen aparecer en entrevistas. */

const PREDS = [
  {
    t: 'Tres setState seguidos',
    code: `function Demo() {
  const [n, setN] = useState(0);

  const sumarTres = () => {
    setN(n + 1);
    setN(n + 1);
    setN(n + 1);
  };

  return <button onClick={sumarTres}>n = {n}</button>;
}`,
    ask: 'Arranca en `n = 0` y hacés un clic. ¿Qué muestra el botón?',
    opts: ['n = 3', 'n = 1', 'n = 0'],
    ok: 1,
    why: [
      'En cada render, `n` es una constante con el valor de ese render: acá vale 0 durante todo el clic.',
      'Las tres llamadas dicen lo mismo: "poné n en 0 + 1". React agrupa las actualizaciones y el resultado es 1.',
      'Si necesitás basarte en el valor anterior, usá la forma con función: `setN((prev) => prev + 1)`.'
    ]
  },
  {
    t: 'setState con función',
    code: `function Demo() {
  const [n, setN] = useState(0);

  const sumarTres = () => {
    setN((prev) => prev + 1);
    setN((prev) => prev + 1);
    setN((prev) => prev + 1);
  };

  return <button onClick={sumarTres}>n = {n}</button>;
}`,
    ask: 'Arranca en `n = 0` y hacés un clic. ¿Qué muestra ahora?',
    opts: ['n = 1', 'n = 3', 'n = 2'],
    ok: 1,
    why: [
      'Con una función, React encola "sumale 1 a lo que haya" tres veces, y cada una recibe el resultado de la anterior: 0 → 1 → 2 → 3.',
      'Regla práctica: si el valor nuevo depende del anterior, usá la forma con función.'
    ]
  },
  {
    t: 'console.log después de setState',
    code: `function Demo() {
  const [n, setN] = useState(0);

  const sumar = () => {
    setN(n + 1);
    console.log('n vale', n);
  };

  return <button onClick={sumar}>n = {n}</button>;
}`,
    ask: 'Hacés el primer clic. ¿Qué imprime el `console.log`?',
    opts: ['n vale 1', 'n vale 0', 'n vale undefined'],
    ok: 1,
    why: [
      '`setN` no cambia la variable `n` en el momento: le pide a React un render nuevo, donde `n` va a valer 1.',
      'Mientras tanto, dentro de esta función, `n` sigue siendo el valor del render actual: 0.',
      'Si necesitás el valor nuevo, calculalo antes en una constante (`const nuevo = n + 1`) y usala.'
    ]
  },
  {
    t: 'Mutar un array del estado',
    code: `function Demo() {
  const [items, setItems] = useState(['yerba']);

  const agregar = () => {
    items.push('mate');
    setItems(items);
  };

  return (
    <div>
      <button onClick={agregar}>Agregar</button>
      <p>{items.length} items: {items.join(', ')}</p>
    </div>
  );
}`,
    ask: 'Hacés clic en Agregar. ¿Qué pasa en pantalla?',
    opts: ['Muestra 2 items', 'No cambia nada', 'Da un error'],
    ok: 1,
    why: [
      '`push` modifica el mismo array. Al llamar a `setItems(items)` le pasás la misma referencia que ya tenía.',
      'React compara el estado nuevo con el anterior por referencia: como es el mismo objeto, decide que no cambió nada y no vuelve a renderizar.',
      'La forma correcta es crear un array nuevo: `setItems([...items, \'mate\'])`.'
    ]
  },
  {
    t: 'useEffect sin dependencias',
    code: `function Demo() {
  const [n, setN] = useState(0);

  useEffect(() => {
    console.log('efecto con n =', n);
  });

  return <button onClick={() => setN(n + 1)}>n = {n}</button>;
}`,
    ask: 'El componente se monta y después hacés dos clics. ¿Cuántas veces se imprime "efecto"?',
    opts: ['1 vez', '3 veces', '2 veces'],
    ok: 1,
    why: [
      'Sin array de dependencias, el efecto corre después de cada render: el primero (al montar) y uno por cada clic.',
      'Con `[]` correría una sola vez, al montar. Con `[n]`, cada vez que cambia `n`.',
      'Si un efecto sin dependencias cambia el estado, provoca otro render, que corre el efecto de nuevo: loop infinito.'
    ]
  },
  {
    t: 'Un intervalo con closure viejo',
    code: `function Demo() {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSegundos(segundos + 1), 500);
    return () => clearInterval(id);
  }, []);

  return <p>Segundos: {segundos}</p>;
}`,
    ask: 'Esperás 3 segundos. ¿Qué muestra?',
    opts: ['Segundos: 6', 'Segundos: 1', 'Segundos: 0'],
    ok: 1,
    why: [
      'El efecto corre una sola vez (`[]`), y la función del intervalo se creó en ese primer render, cuando `segundos` valía 0.',
      'Cada medio segundo hace `setSegundos(0 + 1)`: siempre 1. Es un "closure viejo" (stale closure).',
      'Se arregla con la forma con función: `setSegundos((s) => s + 1)`, que siempre recibe el valor actual.'
    ]
  },
  {
    t: '¿El hijo se vuelve a renderizar?',
    code: `function Hijo() {
  console.log('render del Hijo');
  return <p>Soy el hijo y no recibo props</p>;
}

function Demo() {
  const [n, setN] = useState(0);
  return (
    <div>
      <button onClick={() => setN(n + 1)}>Padre: {n}</button>
      <Hijo />
    </div>
  );
}`,
    ask: 'Hacés un clic en el botón del padre. ¿El Hijo se vuelve a renderizar?',
    opts: ['No, porque no recibe props', 'Sí, se renderiza de nuevo', 'Solo si usa useEffect'],
    ok: 1,
    why: [
      'Cuando un componente se renderiza, por defecto se renderizan todos sus hijos, reciban props o no.',
      'Renderizar no significa tocar el DOM: React compara el resultado y solo cambia lo que hace falta.',
      'Si un hijo es costoso, se puede envolver en `React.memo` para que solo se renderice cuando cambian sus props.'
    ]
  },
  {
    t: 'key con el índice',
    code: `function Demo() {
  const [tareas, setTareas] = useState(['Estudiar', 'Entrenar', 'Cocinar']);

  return (
    <div>
      <button onClick={() => setTareas(tareas.slice(1))}>Borrar la primera</button>
      {tareas.map((tarea, i) => (
        <p key={i}>
          {tarea} <input placeholder="nota" />
        </p>
      ))}
    </div>
  );
}`,
    ask: 'Escribís "A", "B" y "C" en las notas de cada tarea y borrás la primera. ¿Qué nota queda al lado de "Entrenar"?',
    opts: ['B', 'A', 'Ninguna'],
    ok: 1,
    why: [
      'React usa la `key` para saber qué elemento es cuál. Con el índice, después de borrar, "Entrenar" pasa a tener la key 0.',
      'React ve que la key 0 sigue existiendo y reutiliza ese elemento, con su input y el texto "A". Solo cambia el texto de la tarea.',
      'Con una key estable (un id) React sabría que se borró "Estudiar" y sacaría su input.'
    ]
  },
  {
    t: 'El 0 que aparece solo',
    code: `function Demo() {
  const [mensajes] = useState([]);

  return (
    <div>
      {mensajes.length && <p>Tenés mensajes nuevos</p>}
    </div>
  );
}`,
    ask: 'No hay mensajes. ¿Qué se ve en pantalla?',
    opts: ['Nada', 'Un 0', 'Tenés mensajes nuevos'],
    ok: 1,
    why: [
      '`a && b` devuelve `a` si `a` es "falso". `mensajes.length` es 0, así que la expresión vale 0.',
      'React no muestra `false`, `null` ni `undefined`, pero los números sí: aparece un 0.',
      'Se arregla con una comparación que dé booleano: `mensajes.length > 0 && ...`.'
    ]
  }
];

let predPick = null;  // opción elegida (null = todavía no respondió)

function openPred(i) {
  S.pred = i;
  save();
  predPick = null;
  renderPred();
  $('#pred-main').scrollTop = 0;
}

function renderPred() {
  const list = $('#pred-list');
  list.innerHTML = listHTML(PREDS, S.pred, (p, i) => S.predDone[i], 'Predicción');
  keepInView(list, $('.cur', list));

  const p = PREDS[S.pred];
  const answered = predPick !== null;
  unmountPreview($('#pred-pv'));
  let html = '<p class="kicker">Predicción ' + (S.pred + 1) + ' de ' + PREDS.length + '</p>' +
    '<h2>' + esc(p.t) + '</h2>' +
    '<pre class="code">' + highlight(p.code) + '</pre>' +
    '<p class="desc ask">' + md(p.ask) + '</p>' +
    '<div class="opts">' + p.opts.map((o, i) => {
      const cls = !answered ? '' : i === p.ok ? 'right' : i === predPick ? 'wrong' : '';
      return '<button type="button" data-o="' + i + '" class="' + cls + '"' + (answered ? ' disabled' : '') + '><b>' + 'ABC'[i] + '</b>' + md(o) + '</button>';
    }).join('') + '</div>';

  if (answered) {
    html += predPick === p.ok
      ? '<div class="res ok">✓ Correcto. Ahora explicá el porqué sin leerlo.</div>'
      : '<div class="res bad">✗ No. La respuesta es la ' + 'ABC'[p.ok] + '. Probalo abajo.</div>';
    html += '<h3>Por qué</h3><ol class="why">' + p.why.map((w) => '<li>' + md(w) + '</li>').join('') + '</ol>' +
      '<h3 class="pv-label">Probalo en vivo <button type="button" data-act="reset">Reiniciar demo</button></h3>' +
      '<div class="pv" id="pred-pv"></div>' +
      (/console\.log/.test(p.code) ? '<h3>Consola</h3><div id="pred-out"></div>' : '') +
      '<div class="row">' +
      '<button type="button" data-act="retry">Reintentar</button>' +
      '<button type="button" data-act="play">Abrir en el playground</button>' +
      (S.pred < PREDS.length - 1 ? '<button type="button" class="primary push" data-act="next">Siguiente →</button>' : '') +
      '</div>';
  }
  $('#pred-main').innerHTML = html;
  if (answered) runDemo(p.code, $('#pred-pv'), $('#pred-out'));
}

$('#pred-list').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-i]');
  if (b) openPred(+b.dataset.i);
});

$('#pred-main').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || b.closest('.pv')) return;
  const p = PREDS[S.pred];
  if (b.dataset.o !== undefined) {
    predPick = +b.dataset.o;
    if (predPick === p.ok) { S.predDone[S.pred] = true; save(); renderStats(); }
    renderPred();
    scrollInside($('#pred-main'), $('#pred-main .res'));
  }
  const act = b.dataset.act;
  if (act === 'reset') runDemo(p.code, $('#pred-pv'), $('#pred-out'));
  if (act === 'retry') { predPick = null; renderPred(); }
  if (act === 'next') openPred(S.pred + 1);
  if (act === 'play') openInPlayground(p.code.replace(/function Demo\(/, 'function App('));
});
