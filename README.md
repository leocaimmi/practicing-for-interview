# practicing-for-interview

Herramientas propias para repasar los requisitos de una búsqueda de **programador full-stack**.
Tomé la lista de requisitos, marqué lo que tenía flojo y armé algo para practicarlo en vez de solo leer teoría.

**Demo:** https://leocaimmi.github.io/practicing-for-interview/

## Módulos

| Módulo | Estado | Qué practica |
|---|---|---|
| [Linux · Dojo de terminal](linux/) | ✅ listo | Navegación, archivos, pipes, redirecciones, permisos, procesos, apt, nano |
| [JavaScript ES6+ · Dojo de JavaScript](javascript/) | ✅ listo | Event loop, promesas, async/await, arrow functions, fetch |
| [React · Dojo de React](react/) | ✅ listo | Props, estado, hooks, useEffect con fetch, cleanup |
| SQL | en cola | JOINs, claves foráneas, agregaciones |
| APIs REST y JSON | en cola | Verbos HTTP, códigos de estado, idempotencia |
| Git | en cola | Branch, merge vs rebase, pull requests |
| n8n | en cola | Webhook → base de datos → respuesta JSON |

## Dojo de terminal

Nunca había usado Linux, así que en lugar de levantar una VM armé un simulador de Ubuntu que corre en el navegador:

- **Sistema de archivos virtual** con home, carpetas del sistema, archivos ocultos y permisos `rwx`.
- **Parser de bash** propio: comillas, variables (`$HOME`, `$?`), pipes `|`, redirecciones `>` `>>` `<`, operadores `&&` `||` `;` y comodines `*` `?`.
- **Más de 40 comandos**: `ls -la`, `cd -`, `cp -r`, `mv`, `rm -r`, `grep -rn`, `find -name`, `chmod 755`, `ps aux`, `kill`, `sudo apt install`, `nano`, `curl` y más, con los mismos mensajes de error que Ubuntu.
- **Realismo donde enseña algo**: `./deploy.sh` falla con `Permission denied` hasta hacer `chmod +x`; `apt` sin `sudo` falla por el lock; matar un proceso de `root` tira `Operation not permitted`.
- **20 misiones guiadas** con pista y explicación, más una guía rápida de comandos y preguntas típicas de entrevista.
- **Vista árbol**: un toggle en la barra de la terminal alterna entre la consola y el sistema de archivos dibujado como la estructura de un proyecto. Marca dónde estás parado, con qué comando se creó cada carpeta o archivo, y lleva el historial de lo que creaste y borraste.
- **Pistas** cuando algo típico sale mal, por ejemplo una ruta relativa que falla porque ya estás adentro de esa carpeta.
- `curl` simulado contra `jsonplaceholder.typicode.com` para practicar REST (`-X`, `-d`, `-i`).
- Autocompletado con Tab, historial con ↑↓, teclas rápidas en celular y progreso guardado en `localStorage`.

### Estructura

```
linux/
├── index.html
├── css/styles.css
└── js/
    ├── state.js          # árbol inicial, procesos y persistencia
    ├── fs.js             # rutas, nodos y permisos
    ├── parser.js         # tokenizer y parser de bash
    ├── shell.js          # ejecución, pipes, salida, historial, autocompletado
    ├── commands/
    │   ├── files.js      # cd, ls, tree, mkdir, touch, cp, mv, rm, rmdir
    │   ├── text.js       # cat, head, tail, wc, sort, grep, find
    │   ├── system.js     # chmod, ps, kill, apt, curl
    │   └── help.js       # help y man en castellano
    ├── nano.js           # editor
    ├── missions.js       # misiones guiadas
    ├── tree.js           # vista árbol e historial de cambios
    └── main.js           # arranque
```

HTML, CSS y JavaScript sin frameworks ni build: se abre `index.html` y anda.

## Dojo de JavaScript

La oferta aclara que usan IA pero esperan que puedas **comprender, justificar y defender** el código. Por eso este módulo es para escribir a mano y explicar:

- **12 ejercicios de event loop** del tipo "¿en qué orden se imprime?". El código se ejecuta de verdad en el navegador, así que la respuesta correcta es la salida real y no una escrita a mano. Cada uno trae el porqué paso a paso.
- **14 katas con tests** que corren en el navegador: arrow functions, destructuring y spread, `map`/`filter`/`reduce`, closures, `new Promise`, reject, promisify, `.then` → `async/await`, `try/catch`, `Promise.all`, `fetch` con `res.ok` y timeout con `Promise.race`. Los tests detectan los errores típicos: pedidos en serie en vez de paralelo, `return` sin `await` dentro del `try`, `fetch` sin revisar `res.ok`.
- Cada kata tiene una solución de referencia y **"Cómo lo defendés"**: lo que hay que poder decir en voz alta.
- **Playground** con `fetch` real contra jsonplaceholder y `await` en el nivel superior.
- **Guía rápida** por temas: qué es, cuándo se usa, un ejemplo que se ejecuta y muestra qué imprime, y un botón para probarlo en el playground.
- **Preguntas de entrevista** como tarjetas: primero la respondés en voz alta y después ves la respuesta corta, una explicación simple y un ejemplo.
- Cada panel scrollea por dentro, como la consola del Dojo de Linux: la página no se mueve.

## Dojo de React

Componentes escritos a mano, con tests que los montan y los usan como lo haría una persona: hacen clic, escriben en los inputs y envían formularios. React 18 y Babel se cargan desde un CDN y el JSX se compila en el navegador, así que sigue sin haber build.

- **10 katas con tests**: props, listas y `key`, `useState`, inputs controlados y datos derivados, formularios que le avisan al padre, renderizado condicional, estado con arrays sin mutar, `useEffect` con `fetch` (cargando, error y datos), cleanup de un intervalo y respuestas que llegan desordenadas. Los tests detectan la key con índice, el `push` sobre el estado, el loop infinito por falta de `[]`, el closure viejo en `setInterval`, la falta de cleanup y la carrera entre pedidos.
- **9 predicciones de "¿qué pasa si…?"**: las trampas clásicas (tres `setState` seguidos, mutar un array, `useEffect` sin dependencias, key con índice, el `0` que aparece solo), con la demo funcionando para comprobarlo.
- **Playground** con vista previa en vivo y consola.
- **Guía rápida** y **preguntas** con el mismo formato que en JavaScript, pero con el resultado renderizado.

## Código compartido

Los dos dojos comparten estilos y herramientas en `assets/`:

```
assets/
├── dojo.css              # tema, paneles con scroll propio, editor, consola, tests
└── js/
    ├── dom.js            # $, esc, listas laterales, scroll dentro de los paneles, alto de los paneles
    ├── highlight.js      # resaltado de sintaxis (incluye JSX)
    ├── runner.js         # ejecuta código, captura console.* y espera timers/promesas
    ├── editor.js         # textarea con Tab, sangría automática y Ctrl+Enter
    └── tester.js         # chequeos de las katas (eq, ok, rejects, src)

javascript/js/            # state, loop, katas, play, guide, questions, main
react/js/                 # state, jsx (compila y monta), katas, predict, play, guide, questions, main
```

## Correr local

```bash
git clone https://github.com/leocaimmi/practicing-for-interview.git
cd practicing-for-interview
python3 -m http.server 8000   # o simplemente abrir index.html
```

## Deploy

Cada push a `main` publica el sitio en GitHub Pages con el workflow de `.github/workflows/pages.yml`
(en *Settings → Pages → Source* elegir **GitHub Actions**).
