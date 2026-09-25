# CLAUDE.md

Repo de práctica para una entrevista full-stack. Cada módulo es una herramienta interactiva que corre en el navegador.

## Stack y reglas
- HTML, CSS y JavaScript vanilla. **Sin frameworks, sin build, sin npm.** Tiene que andar abriendo `index.html`.
- Única excepción: el Dojo de React carga React 18 y Babel standalone desde jsDelivr para compilar y montar el JSX del usuario. El sitio en sí sigue sin build.
- Lo compartido entre dojos vive en `assets/` (`dojo.css` y `assets/js/`): `dom → state del módulo → highlight → runner → editor → tester → módulo`.
- Los módulos usan `<script defer>` clásicos (no ES modules) que comparten el scope global. El orden de los scripts en el HTML importa: `state → fs → parser → shell → commands/* → nano → missions → tree → main`.
- Los comandos del simulador se registran en `C.nombre = (args, io) => ({ out, err, code, html })`. `io.tty` indica si la salida va a pantalla (colores) o a un pipe/archivo (texto plano).
- Los mensajes de error imitan a Ubuntu en inglés; la interfaz y las explicaciones van en castellano rioplatense.
- El estado se guarda en `localStorage` con try/catch: la página tiene que andar aunque el storage esté bloqueado.

## Diseño
- Tema negro con verde flúor: tokens en `:root` (`--neon: #39ff14`, `--cyan`, `--red`...). Siempre usar los tokens, nunca colores sueltos.
- Fuentes: Ubuntu y Ubuntu Mono (Google Fonts).
- Responsive: sin scroll horizontal a 390 px; inputs a 16 px para que iOS no haga zoom; teclas rápidas en `@media (hover: none)`.

## Textos
- Castellano rioplatense formal: voseo sí, modismos no (nada de "metete", "celu", "de una") y nada de términos de España ("Guía rápida", no "Chuleta").
- No mencionar empresas ni marcas personales: el proyecto es solo práctica para la entrevista.

## Git
- Commits granulares, uno por pieza lógica, en castellano con Conventional Commits: `feat(linux):`, `style(linux):`, `fix:`, `docs:`, `ci:`.
- **Sin líneas de Co-Authored-By ni otra atribución en los commits.**
- Trabajar en ramas `feat/<modulo>` y mergear a `main` por PR.
- Cada push a `main` despliega a GitHub Pages (`.github/workflows/pages.yml`).

## Probar
```bash
python3 -m http.server 8000
# abrir http://localhost:8000/, /linux/, /javascript/ y /react/
```
Chequear en la consola que no haya errores de JS y probar a 390 px de ancho.

## Módulos
- `linux/` Dojo de terminal: listo.
- `javascript/` Dojo de JavaScript: listo. El código del usuario corre con `runCode` (AsyncFunction con `console` y timers envueltos); las katas reciben mocks por scope (`api`, `leerArchivo`, `fetch`).
- `react/` Dojo de React: listo. `jsx.js` compila con Babel (`evalCode`), monta con `mountPreview`/`runDemo` y da helpers de DOM para los tests (`makeDom`: mount, click, type, submit, waitFor, key). Los ejemplos de guía, preguntas y predicciones definen un componente `Demo`; el playground, `App`.
- Todas las pestañas con ítems usan el layout lista + tarjeta (`.lay`), con scroll propio y alto calculado por `fitPanes`.
- En cola: SQL, REST/JSON, Git, n8n. Cada uno en su carpeta con la misma estética, y se habilita su tarjeta en la landing (`index.html`).
