# practicing-for-interview

Herramientas propias para repasar los requisitos de una búsqueda de **programador full-stack**.
Tomé la lista de requisitos, marqué lo que tenía flojo y armé algo para practicarlo en vez de solo leer teoría.

**Demo:** https://leocaimmi.github.io/practicing-for-interview/

## Módulos

| Módulo | Estado | Qué practica |
|---|---|---|
| [Linux · Dojo de terminal](linux/) | ✅ listo | Navegación, archivos, pipes, redirecciones, permisos, procesos, apt, nano |
| [JavaScript ES6+ · Dojo de JavaScript](javascript/) | ✅ listo | Event loop, promesas, async/await, arrow functions, fetch |
| React | en cola | Props, estado, hooks |
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
- **20 misiones guiadas** con pista y explicación, más una chuleta y preguntas típicas de entrevista.
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
    └── main.js           # arranque
```

HTML, CSS y JavaScript sin frameworks ni build: se abre `index.html` y anda.

## Dojo de JavaScript

La oferta aclara que usan IA pero esperan que puedas **comprender, justificar y defender** el código. Por eso este módulo es para escribir a mano y explicar:

- **12 ejercicios de event loop** del tipo "¿en qué orden se imprime?". El código se ejecuta de verdad en el navegador, así que la respuesta correcta es la salida real y no una escrita a mano. Cada uno trae el porqué paso a paso.
- **14 katas con tests** que corren en el navegador: arrow functions, destructuring y spread, `map`/`filter`/`reduce`, closures, `new Promise`, reject, promisify, `.then` → `async/await`, `try/catch`, `Promise.all`, `fetch` con `res.ok` y timeout con `Promise.race`. Los tests detectan los errores típicos: pedidos en serie en vez de paralelo, `return` sin `await` dentro del `try`, `fetch` sin revisar `res.ok`.
- Cada kata tiene una solución de referencia y **"Cómo lo defendés"**: lo que hay que poder decir en voz alta.
- **Playground** con `fetch` real contra jsonplaceholder y `await` en el nivel superior.
- **Guía rápida** de sintaxis y **preguntas de entrevista**.

### Estructura

```
javascript/
├── index.html            # pestañas, guía rápida y preguntas
├── css/styles.css
└── js/
    ├── state.js          # progreso y borradores en localStorage
    ├── highlight.js      # resaltado de sintaxis
    ├── runner.js         # ejecuta código, captura console.* y espera timers/promesas
    ├── editor.js         # textarea con Tab, sangría automática y Ctrl+Enter
    ├── loop.js           # ejercicios de event loop
    ├── katas.js          # katas, mocks (api, leerArchivo, fetch) y tester
    ├── play.js           # playground
    └── main.js           # arranque
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
