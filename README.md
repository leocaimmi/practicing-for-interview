# practicing-for-interview

Herramientas propias para repasar los requisitos de una búsqueda de **programador full-stack**.
Tomé la lista de requisitos, marqué lo que tenía flojo y armé algo para practicarlo en vez de solo leer teoría.

**Demo:** https://leocaimmi.github.io/practicing-for-interview/

## Módulos

| Módulo | Estado | Qué practica |
|---|---|---|
| [Linux · Dojo de terminal](linux/) | ✅ listo | Navegación, archivos, pipes, redirecciones, permisos, procesos, apt, nano |
| JavaScript ES6+ | en cola | Promesas, async/await, arrow functions, event loop |
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
- **20 misiones guiadas** con pista y explicación, más una guía rápida de comandos y preguntas típicas de entrevista.
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

## Correr local

```bash
git clone https://github.com/leocaimmi/practicing-for-interview.git
cd practicing-for-interview
python3 -m http.server 8000   # o simplemente abrir index.html
```

## Deploy

Cada push a `main` publica el sitio en GitHub Pages con el workflow de `.github/workflows/pages.yml`
(en *Settings → Pages → Source* elegir **GitHub Actions**).
