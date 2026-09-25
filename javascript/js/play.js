/* Playground: editor libre con consola. Acá fetch es el real, así que se pueden hacer pedidos reales a jsonplaceholder. */

const EJEMPLOS = {
  fetch: `// fetch real contra jsonplaceholder, con await en el nivel superior
const cargarUsuario = async (id) => {
  const res = await fetch(\`https://jsonplaceholder.typicode.com/users/\${id}\`);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
};

console.log('antes');
const { name, email, address: { city } } = await cargarUsuario(1);
console.log(name, email, city);
console.log('después');
`,
  paralelo: `// Secuencial contra paralelo: mirá cuánto tarda cada uno
const esperar = (ms, valor) => new Promise((r) => setTimeout(() => r(valor), ms));

let t0 = Date.now();
const a = await esperar(300, 'a');
const b = await esperar(300, 'b');
console.log('secuencial', [a, b], Date.now() - t0, 'ms');

t0 = Date.now();
const [c, d] = await Promise.all([esperar(300, 'c'), esperar(300, 'd')]);
console.log('paralelo', [c, d], Date.now() - t0, 'ms');
`,
  post: `// POST con JSON: lo mismo que harías contra tu API en Spring Boot
const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Entrevista', body: 'Lunes 15:20', userId: 1 })
});

console.log(res.status, res.statusText);
console.log(await res.json());
`,
  allSettled: `// Promise.all falla entero; allSettled te da todos los resultados
const ok = Promise.resolve('bien');
const mal = Promise.reject(new Error('falló'));

try {
  await Promise.all([ok, mal]);
} catch (e) {
  console.log('all:', e.message);
}

const resultados = await Promise.allSettled([ok, Promise.reject(new Error('falló'))]);
console.log(resultados);
`
};

function initPlayground() {
  const pane = $('#tab-play');
  pane.innerHTML =
    '<div class="play">' +
    '<div>' +
    '<textarea class="ed" id="play-ed" aria-label="Editor del playground"></textarea>' +
    '<div class="row">' +
    '<select id="play-ej" aria-label="Cargar un ejemplo">' +
    '<option value="">Cargar un ejemplo…</option>' +
    '<option value="fetch">fetch con async/await</option>' +
    '<option value="paralelo">Secuencial contra paralelo</option>' +
    '<option value="post">POST con JSON</option>' +
    '<option value="allSettled">Promise.all contra allSettled</option>' +
    '</select>' +
    '<button type="button" id="play-clear">Limpiar consola</button>' +
    '<button type="button" class="primary push" id="play-run">Ejecutar</button>' +
    '</div>' +
    '<p class="desc note">Acá <code>fetch</code> es el de verdad y podés usar <code>await</code> en el nivel superior. La salida se corta a los 8 segundos.</p>' +
    '</div>' +
    '<div><div id="play-out">' + renderConsole([]) + '</div></div>' +
    '</div>';

  const ta = $('#play-ed');
  ta.value = S.play ?? EJEMPLOS.fetch;
  setupEditor(ta, { onRun: runPlayground });
  ta.addEventListener('input', () => { S.play = ta.value; saveSoon(); });

  $('#play-run').addEventListener('click', runPlayground);
  $('#play-clear').addEventListener('click', () => { $('#play-out').innerHTML = renderConsole([]); });
  $('#play-ej').addEventListener('change', (e) => {
    if (!e.target.value) return;
    loadPlayground(EJEMPLOS[e.target.value]);
    e.target.value = '';
  });
}

function loadPlayground(code) {
  const ta = $('#play-ed');
  ta.value = code;
  S.play = code;
  save();
  $('#play-out').innerHTML = renderConsole([]);
}

let playRun = 0;
async function runPlayground() {
  const btn = $('#play-run');
  const run = ++playRun;
  btn.disabled = true;
  btn.textContent = 'Ejecutando…';
  const t0 = performance.now();
  const { logs } = await runCode($('#play-ed').value, { limit: 8000 });
  if (run !== playRun) return;
  logs.push({ kind: 'dim', text: '— terminó en ' + Math.round(performance.now() - t0) + ' ms' });
  $('#play-out').innerHTML = renderConsole(logs);
  btn.disabled = false;
  btn.textContent = 'Ejecutar';
}

/* Lo usan los ejercicios de event loop: "Abrir en el playground" */
function openInPlayground(code) {
  loadPlayground(code);
  showTab('play');
  $('#play-ed').focus();
}
