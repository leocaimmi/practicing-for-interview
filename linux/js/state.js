/* Estado global del simulador: árbol inicial, procesos y persistencia. */
const HOME = '/home/leo';
const STORAGE_KEY = 'dojo-terminal-v1';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* Árbol inicial: string = archivo, objeto = carpeta */
const SPEC = {
  home: { leo: {
    '.bashrc': "# ~/.bashrc\nalias ll='ls -la'\nexport EDITOR=nano\nexport PATH=$PATH:$HOME/.local/bin\n",
    '.config': { 'settings.json': '{\n  "theme": "dark",\n  "lang": "es-AR"\n}\n' },
    'notas.txt': "Entrevista Becon\n- Lunes 28/09 15:20\n- Catamarca 3265\n- Llevar CV impreso\n",
    'deploy.sh': "#!/bin/bash\n# Script de deploy de ejemplo\necho \"Compilando proyecto...\"\necho \"Subiendo archivos al servidor...\"\necho \"Deploy terminado OK\"\n",
    documentos: {
      'cv.txt': "Leonardo Caimmi\nDesarrollador Full-Stack\nJavaScript, TypeScript, React, Python, SQL\n",
      'carta.txt': "Estimado equipo de Becodes Tech Group:\nMe interesa sumarme como programador full-stack.\n"
    },
    proyectos: {
      'pos-desktop': {
        'package.json': '{\n  "name": "pos-desktop",\n  "version": "1.4.0",\n  "scripts": { "dev": "vite", "build": "vite build" }\n}\n',
        'README.md': "# POS Desktop\nPunto de venta offline-first.\n",
        src: {
          'app.js': "import { db } from './db.js';\n\nexport async function cargarVentas() {\n  // TODO: manejar error de conexión\n  const ventas = await db.all('SELECT * FROM ventas');\n  return ventas;\n}\n",
          'db.js': "// TODO: agregar índice por fecha\nexport const db = openDatabase('pos.sqlite');\n"
        }
      },
      consultorio: {
        'main.py': "from fastapi import FastAPI\n\napp = FastAPI()\n\n# TODO: validar token JWT\n@app.get('/turnos')\ndef listar_turnos():\n    return []\n",
        api: { 'turnos.js': "export async function getTurnos() {\n  const res = await fetch('/api/turnos');\n  if (!res.ok) throw new Error('HTTP ' + res.status);\n  return res.json();\n}\n" }
      }
    },
    basura: { 'viejo.log': "[2025-01-10] error: timeout\n[2025-01-11] error: timeout\n", 'temp.txt': "" }
  } },
  etc: { hostname: "dessa\n", 'os-release': 'PRETTY_NAME="Ubuntu 24.04.1 LTS"\nNAME="Ubuntu"\nVERSION_ID="24.04"\n', hosts: "127.0.0.1 localhost\n127.0.1.1 dessa\n" },
  tmp: {},
  var: { log: { syslog: "Sep 25 09:48:01 dessa systemd[1]: Started cron.service.\nSep 25 09:48:05 dessa sshd[412]: Server listening on 0.0.0.0 port 22.\nSep 25 10:02:17 dessa node[2048]: API escuchando en :3000\nSep 25 10:05:44 dessa node[2048]: error: ECONNREFUSED 127.0.0.1:5432\n" } },
  usr: { bin: {}, local: {} }
};

const PROCS = [
  { pid: 1, user: 'root', cpu: '0.0', mem: '0.1', cmd: '/sbin/init' },
  { pid: 412, user: 'root', cpu: '0.0', mem: '0.2', cmd: '/usr/sbin/sshd -D' },
  { pid: 873, user: 'postgres', cpu: '0.3', mem: '1.9', cmd: 'postgres: 16/main' },
  { pid: 2048, user: 'leo', cpu: '2.4', mem: '3.1', cmd: 'node server.js' },
  { pid: 2103, user: 'leo', cpu: '1.1', mem: '4.6', cmd: 'node /usr/bin/n8n start' },
  { pid: 3001, user: 'leo', cpu: '0.0', mem: '0.1', cmd: '-bash' }
];

function buildTree(spec) {
  const now = Date.now();
  if (typeof spec === 'string') return { type: 'file', content: spec, mode: 'rw-r--r--', mtime: now };
  const dir = { type: 'dir', children: {}, mode: 'rwxr-xr-x', mtime: now };
  for (const k in spec) dir.children[k] = buildTree(spec[k]);
  return dir;
}

function freshState() {
  return {
    fs: buildTree(SPEC), cwd: HOME, prev: HOME, hist: [], flags: {}, done: [], mission: 0,
    procs: JSON.parse(JSON.stringify(PROCS)), installed: [], lastCode: 0
  };
}

let S = null;
let restored = false;
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) { S = JSON.parse(raw); restored = true; }
} catch (e) { /* storage bloqueado: seguimos en memoria */ }
if (!S || !S.fs) { S = freshState(); restored = false; }

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch (e) { /* sin storage */ }
}

/* Flags de ejecución compartidos */
let SUDO = false;      // true mientras corre un comando con sudo
let lastRan = [];      // comandos ejecutados en la última línea (para las misiones)
let scriptDepth = 0;   // evita recursión infinita en scripts
