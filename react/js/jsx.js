/* Motor del Dojo de React: compila JSX con Babel, evalúa el código del usuario con los hooks a mano,
   monta componentes en una vista previa y ofrece helpers de DOM para los tests. */

const HOOKS = ['useState', 'useEffect', 'useRef', 'useMemo', 'useCallback', 'useReducer', 'useContext', 'createContext', 'Fragment', 'memo'];
const h = React.createElement;

/* Quien viene de un proyecto real escribe imports y exports: acá no hacen falta, se sacan */
function cleanSource(src) {
  return src
    .replace(/^\s*import\s[^\n]*?from\s*['"][^'"]+['"];?[ \t]*$/gm, '')
    .replace(/^\s*import\s*['"][^'"]+['"];?[ \t]*$/gm, '')
    .replace(/^\s*export\s+default\s+[A-Za-z_$][\w$]*;?[ \t]*$/gm, '')
    .replace(/^(\s*)export\s+(default\s+)?(?=function|class|const|let)/gm, '$1');
}

function compileJSX(src) {
  try {
    return Babel.transform(cleanSource(src), {
      presets: [['react', { runtime: 'classic' }]],
      sourceType: 'script',
      parserOpts: { allowReturnOutsideFunction: true }
    }).code;
  } catch (e) {
    /* Babel devuelve "unknown: Unexpected token (3:4)" más el fragmento de código */
    const err = new SyntaxError(String(e.message).replace(/^unknown:\s*/, ''));
    throw err;
  }
}

/* Consola que guarda lo que imprime el código del usuario (y opcionalmente avisa para redibujar) */
function makeConsole(logs, onLog) {
  const push = (kind) => (...args) => {
    logs.push({ kind, text: args.map((a) => fmt(a)).join(' ') });
    if (onLog) onLog();
  };
  return { log: push('log'), info: push('log'), debug: push('log'), table: push('log'), warn: push('warn'), error: push('error') };
}

/**
 * Compila y ejecuta `src`. Devuelve un objeto con los nombres pedidos en `names`
 * (los componentes de una kata, o App/Demo). Tira el error si no compila o si falla al ejecutarse.
 */
function evalCode(src, { names = [], scope = {}, con = console } = {}) {
  const code = compileJSX(src);
  const all = { React, ReactDOM, console: con, ...Object.fromEntries(HOOKS.map((k) => [k, React[k]])), ...scope };
  const tail = names.length
    ? '\n;return { ' + names.map((n) => n + ': typeof ' + n + ' !== "undefined" ? ' + n + ' : undefined').join(', ') + ' };'
    : '';
  const fn = new Function(...Object.keys(all), '"use strict";\n' + code + tail);
  return fn(...Object.values(all)) || {};
}

/* Captura los errores de render para mostrarlos en vez de dejar la vista previa en blanco */
class Boundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { if (this.props.onError) this.props.onError(error); }
  render() {
    if (this.state.error) return h('div', { className: 'pv-error' }, 'Error al renderizar: ' + this.state.error.message);
    return this.props.children;
  }
}

/* ---------- vista previa ---------- */
function mountPreview(host, element) {
  unmountPreview(host);
  const root = ReactDOM.createRoot(host);
  host._root = root;
  root.render(h(Boundary, null, element));
}

function unmountPreview(host) {
  if (host && host._root) {
    host._root.unmount();
    host._root = null;
  }
}

function showPreviewError(host, error) {
  unmountPreview(host);
  host.innerHTML = '<div class="pv-error">' + esc(fmt(error)) + '</div>';
}

/* ---------- helpers de DOM para los tests ---------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function makeDom() {
  const mounted = [];
  let host = document.getElementById('test-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'test-host';
    host.hidden = true;
    document.body.appendChild(host);
  }

  const d = {
    /* Monta un componente con sus props; tira el error si falla el primer render */
    mount(Comp, props = {}) {
      const container = document.createElement('div');
      host.appendChild(container);
      const root = ReactDOM.createRoot(container);
      let error = null;
      const render = (p) => ReactDOM.flushSync(() => root.render(h(Boundary, { onError: (e) => { error = e; } }, h(Comp, p))));
      render(props);
      const m = {
        container,
        get error() { return error; },
        rerender(p) { render(p); },
        unmount() { if (m.alive) { m.alive = false; root.unmount(); container.remove(); } },
        alive: true
      };
      mounted.push(m);
      if (error) throw error;
      return m;
    },
    cleanup() { mounted.forEach((m) => m.unmount()); },
    wait: sleep,
    text: (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null),
    texts: (root, sel) => [...root.querySelectorAll(sel)].map((el) => el.textContent.replace(/\s+/g, ' ').trim()),
    button(root, re) {
      return [...root.querySelectorAll('button')].find((b) => re.test(b.textContent.trim()));
    },
    async click(el, what = 'el botón') {
      if (!el) throw new Error('No encontré ' + what);
      el.click();
      await sleep(15);
    },
    /* Escribe en un input controlado como lo haría un usuario (dispara el onChange de React) */
    async type(input, value) {
      if (!input) throw new Error('No encontré el input');
      const proto = input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(15);
    },
    /* Dispara el submit de un form y devuelve el evento (para ver si llamaron a preventDefault) */
    async submit(form) {
      if (!form) throw new Error('No encontré el <form>');
      const ev = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(ev);
      await sleep(15);
      return ev;
    },
    async waitFor(fn, ms = 1000) {
      const t0 = performance.now();
      while (performance.now() - t0 < ms) {
        try { const v = fn(); if (v) return v; } catch (e) { /* todavía no */ }
        await sleep(15);
      }
      return fn();
    },
    /* La key que React le asignó al elemento de una lista (sube si el <li> está dentro de otro componente) */
    key(el) {
      const prop = Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
      let f = prop && el[prop];
      while (f && f.key == null && f.return && f.return.stateNode !== el.parentNode) f = f.return;
      return f ? f.key : null;
    }
  };
  return d;
}
