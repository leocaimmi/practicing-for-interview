/* Permisos, procesos, paquetes y utilidades del sistema:
   chmod, whoami, ps, kill, apt, curl, history, clear, env, etc. */

C.chmod = (a) => {
  if (a.length < 2) return { err: a.length ? `chmod: missing operand after '${a[0]}'` : 'chmod: missing operand', code: 1 };
  const [mode, ...files] = a, err = [];

  const apply = (cur) => {
    if (/^[0-7]{3}$/.test(mode)) { // octal: r=4 w=2 x=1
      return mode.split('').map((d) => { d = +d; return (d & 4 ? 'r' : '-') + (d & 2 ? 'w' : '-') + (d & 1 ? 'x' : '-'); }).join('');
    }
    const m = cur.split(''); // simbólico: u+x, go-w, a=r...
    for (const part of mode.split(',')) {
      const r = /^([ugoa]*)([+\-=])([rwx]*)$/.exec(part);
      if (!r) return null;
      const who = (r[1] || 'a').replace('a', 'ugo');
      for (const w of new Set(who)) {
        const off = { u: 0, g: 3, o: 6 }[w];
        ['r', 'w', 'x'].forEach((bit, bi) => {
          const has = r[3].includes(bit);
          if (r[2] === '+' && has) m[off + bi] = bit;
          if (r[2] === '-' && has) m[off + bi] = '-';
          if (r[2] === '=') m[off + bi] = has ? bit : '-';
        });
      }
    }
    return m.join('');
  };

  for (const t of files) {
    const abs = norm(t), n = getNode(abs);
    if (!n) { err.push(`chmod: cannot access '${t}': No such file or directory`); continue; }
    if (!writable(abs)) { err.push(`chmod: changing permissions of '${t}': Operation not permitted`); continue; }
    const next = apply(n.mode);
    if (next === null) return { err: `chmod: invalid mode: '${mode}'`, code: 1 };
    n.mode = next;
  }
  return { err: err.join('\n'), code: err.length ? 1 : 0 };
};

C.whoami = () => ({ out: (SUDO ? 'root' : 'leo') + '\n' });
C.hostname = () => ({ out: 'ubuntu\n' });
C.date = () => ({ out: new Date().toString().replace(/ GMT.*/, '') + '\n' });
C.uname = (a) => ({ out: (a.includes('-a') ? 'Linux ubuntu 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC x86_64 x86_64 x86_64 GNU/Linux' : 'Linux') + '\n' });
C.history = () => ({ out: S.hist.map((h, i) => String(i + 1).padStart(5) + '  ' + h).join('\n') + '\n' });
C.clear = () => { outEl.innerHTML = ''; return {}; };
/* cls es de Windows (cmd/PowerShell); en Linux no existe, pero se deja como alias de clear */
C.cls = C.clear;
C.env = () => ({ out: `USER=leo\nHOME=${HOME}\nPWD=${S.cwd}\nSHELL=/bin/bash\nLANG=es_AR.UTF-8\nEDITOR=nano\nPATH=/usr/local/bin:/usr/bin:/bin\n` });

/* ---------- procesos ---------- */
C.ps = (a) => {
  const full = a.some((x) => /aux|-e|-ef|ax/.test(x));
  if (!full) return { out: '    PID TTY          TIME CMD\n   3001 pts/0    00:00:00 bash\n   3150 pts/0    00:00:00 ps\n' };
  const rows = [...S.procs, { pid: 3150, user: 'leo', cpu: '0.0', mem: '0.0', cmd: 'ps ' + a.join(' ') }];
  return {
    out: 'USER         PID %CPU %MEM COMMAND\n' +
      rows.map((p) => p.user.padEnd(9) + String(p.pid).padStart(6) + '  ' + p.cpu.padStart(3) + '  ' + p.mem.padStart(3) + ' ' + p.cmd).join('\n') + '\n'
  };
};

C.kill = (a) => {
  const pids = a.filter((x) => !x.startsWith('-'));
  if (!pids.length) return { err: 'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]', code: 2 };
  const err = [], out = [];
  for (const p of pids) {
    const i = S.procs.findIndex((x) => String(x.pid) === p);
    if (i < 0) { err.push(`bash: kill: (${p}) - No such process`); continue; }
    const proc = S.procs[i];
    if (proc.pid === 3001) { out.push('(Ese es tu propio shell: en la vida real se te cerraba la terminal.)'); continue; }
    if (proc.user !== 'leo' && !SUDO) { err.push(`bash: kill: (${p}) - Operation not permitted`); continue; }
    S.procs.splice(i, 1);
  }
  return { out: out.length ? out.join('\n') + '\n' : '', err: err.join('\n'), code: err.length ? 1 : 0 };
};

C.top = () => ({ out: 'top es interactivo (se actualiza en vivo y salís con q). Acá usá ps aux para ver la lista.\n' });
C.htop = C.top;

/* ---------- paquetes ---------- */
C.apt = (a, io) => {
  const sub = a[0], pkgs = a.slice(1).filter((x) => !x.startsWith('-'));
  if (!sub) return { out: 'apt 2.7.14 (amd64)\nUsage: apt [options] command\n\nMost used commands:\n  update  - retrieve new lists of packages\n  upgrade - upgrade the system\n  install - install packages\n  remove  - remove packages\n  search  - search in package descriptions\n' };
  if (['update', 'upgrade', 'install', 'remove'].includes(sub) && !io.sudo) {
    return { err: 'E: Could not open lock file /var/lib/dpkg/lock-frontend - open (13: Permission denied)\nE: Unable to acquire the dpkg frontend lock (/var/lib/dpkg/lock-frontend), are you root?', code: 100 };
  }
  if (sub === 'update') return { out: 'Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease\nGet:2 http://security.ubuntu.com/ubuntu noble-security InRelease [126 kB]\nFetched 126 kB in 1s (98.4 kB/s)\nReading package lists... Done\nBuilding dependency tree... Done\nAll packages are up to date.\n' };
  if (sub === 'upgrade') return { out: 'Reading package lists... Done\nCalculating upgrade... Done\n0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.\n' };
  if (sub === 'install') {
    if (!pkgs.length) return { out: '0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.\n' };
    const out = ['Reading package lists... Done', 'Building dependency tree... Done'];
    for (const p of pkgs) {
      if (S.installed.includes(p)) { out.push(`${p} is already the newest version.`); continue; }
      out.push('The following NEW packages will be installed:', '  ' + p,
        '0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.',
        `Get:1 http://archive.ubuntu.com/ubuntu noble/main amd64 ${p} amd64 [194 kB]`,
        `Unpacking ${p} ...`, `Setting up ${p} ...`);
      S.installed.push(p);
      S.flags.apt = true;
    }
    return { out: out.join('\n') + '\n' };
  }
  if (sub === 'remove') { S.installed = S.installed.filter((x) => !pkgs.includes(x)); return { out: pkgs.map((p) => `Removing ${p} ...`).join('\n') + '\n' }; }
  if (sub === 'search') return { out: `${pkgs[0] || ''}/noble 1.0 amd64\n  (simulado)\n` };
  return { err: `E: Invalid operation ${sub}`, code: 100 };
};
C['apt-get'] = C.apt;

/* curl contra jsonplaceholder simulado: sirve para practicar REST */
C.curl = (a) => {
  let method = 'GET', data = null, url = null, showHeaders = false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    if (x === '-X' || x === '--request') method = (a[++i] || 'GET').toUpperCase();
    else if (x === '-d' || x === '--data') { data = a[++i]; if (method === 'GET') method = 'POST'; }
    else if (x === '-H' || x === '--header') i++;
    else if (x === '-i') showHeaders = true;
    else if (!x.startsWith('-')) url = x;
  }
  if (!url) return { err: "curl: try 'curl --help' for more information", code: 2 };

  const m = /jsonplaceholder\.typicode\.com\/(\w+)(?:\/(\d+))?/.exec(url);
  if (!m) return { err: `curl: (6) Could not resolve host: ${url.replace(/^https?:\/\//, '').split('/')[0]}\n(El simulador no tiene red. Probá con https://jsonplaceholder.typicode.com/users/1)`, code: 6 };

  const samples = {
    users: (id) => ({ id, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz' }),
    posts: (id) => ({ userId: 1, id, title: 'sunt aut facere repellat provident', body: 'quia et suscipit...' }),
    todos: (id) => ({ userId: 1, id, title: 'delectus aut autem', completed: false })
  };
  const make = samples[m[1]] || ((id) => ({ id }));
  const parse = () => { try { return JSON.parse(data || '{}'); } catch (e) { return { raw: data }; } };

  let status = 200, body;
  if (method === 'POST') { status = 201; body = { ...parse(), id: 101 }; }
  else if (method === 'PUT' || method === 'PATCH') body = { ...make(+m[2] || 1), ...parse() };
  else if (method === 'DELETE') body = {};
  else body = m[2] ? make(+m[2]) : [make(1), make(2)];

  const headers = showHeaders ? `HTTP/2 ${status}\ncontent-type: application/json; charset=utf-8\n\n` : '';
  return { out: headers + JSON.stringify(body, null, 2) + '\n' };
};

/* ---------- herramientas que no están en el simulador ---------- */
C.vim = () => ({ out: 'vim no está en este simulador: usá nano.\nDato útil: en vim se sale con Esc y después :q! (sin guardar) o :wq (guardando).\n' });
C.vi = C.vim;
C.code = () => ({ out: 'VS Code no está acá. En tu máquina, "code ." abre la carpeta actual en VS Code.\n' });
C.git = () => ({ out: 'git no está en este simulador.\n' });
C.node = () => ({ out: 'node no está instalado en este simulador.\n' });
C.npm = C.node;
C.python3 = () => ({ out: 'python3 no está instalado en este simulador.\n' });
C.python = C.python3;
C.exit = () => ({ out: 'logout\n(Es un simulador: la sesión sigue abierta. Probá clear.)\n' });
