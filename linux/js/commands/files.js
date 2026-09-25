/* Comandos de navegación y manejo de archivos:
   pwd, cd, ls, tree, mkdir, touch, cp, mv, rm, rmdir */

C.pwd = () => ({ out: S.cwd + '\n' });

C.cd = (a) => {
  if (a.length > 1) return { err: 'bash: cd: too many arguments', code: 1 };
  let target = a[0], show = false;
  if (!target || target === '~') target = HOME;
  else if (target === '-') { target = S.prev; show = true; }
  const abs = norm(target), n = getNode(abs);
  if (!n) return { err: `bash: cd: ${a[0]}: No such file or directory`, code: 1 };
  if (n.type !== 'dir') return { err: `bash: cd: ${a[0]}: Not a directory`, code: 1 };
  S.prev = S.cwd; S.cwd = abs;
  return { out: show ? abs + '\n' : '' };
};

C.ls = (a, io) => {
  const { f, rest } = parseFlags(a);
  const long = f.has('l'), all = f.has('a') || f.has('A'), tty = io.tty;
  const targets = rest.length ? rest : ['.'];
  const err = [], parts = [];
  let code = 0;

  const row = (name, n, abs) => {
    const size = n.type === 'dir' ? 4096 : byteLength(n.content), o = ownerOf(abs);
    const pre = (n.type === 'dir' ? 'd' : '-') + n.mode + ' ' + (n.type === 'dir' ? 2 : 1) + ' ' +
      o.padEnd(4) + ' ' + o.padEnd(4) + ' ' + String(size).padStart(5) + ' ' + lsDate(n.mtime) + ' ';
    return (tty ? esc(pre) : pre) + nameHtml(name, n, tty);
  };

  const files = [], dirs = [];
  for (const t of targets) {
    const abs = norm(t), n = getNode(abs);
    if (!n) { err.push(`ls: cannot access '${t}': No such file or directory`); code = 2; continue; }
    (n.type === 'dir' ? dirs : files).push([t, n, abs]);
  }
  if (files.length) {
    parts.push(long
      ? files.map(([t, n, abs]) => row(t, n, abs)).join('\n')
      : files.map(([t, n]) => nameHtml(t, n, tty)).join(tty ? '  ' : '\n'));
  }
  for (const [t, n, abs] of dirs) {
    let names = Object.keys(n.children).sort((x, y) => x.replace(/^\./, '').localeCompare(y.replace(/^\./, '')));
    if (!all) names = names.filter((x) => !x.startsWith('.'));
    let ents = names.map((x) => [x, n.children[x], (abs === '/' ? '' : abs) + '/' + x]);
    if (f.has('a')) ents = [['.', n, abs], ['..', getNode(splitPath(abs)[0]) || n, splitPath(abs)[0]], ...ents];
    let block = targets.length > 1 ? (tty ? esc(t) : t) + ':\n' : '';
    if (long) block += 'total ' + (ents.length * 4) + (ents.length ? '\n' : '') + ents.map(([x, m, p]) => row(x, m, p)).join('\n');
    else block += ents.map(([x, m]) => nameHtml(x, m, tty)).join(tty ? '  ' : '\n');
    parts.push(block);
  }
  const out = parts.filter((x) => x !== '').join(targets.length > 1 ? '\n\n' : '\n');
  return { out: out ? out + '\n' : '', html: tty, err: err.join('\n'), code };
};

C.tree = (a, io) => {
  const t = a[0] || '.', n = getNode(norm(t));
  if (!n) return { err: `${t} [error opening dir]`, code: 2 };
  if (n.type !== 'dir') return { out: t + '\n' };
  let dirCount = 0, fileCount = 0;
  const L = [nameHtml(t, n, io.tty)];
  (function walk(d, prefix) {
    const names = Object.keys(d.children).filter((x) => !x.startsWith('.')).sort();
    names.forEach((nm, i) => {
      const last = i === names.length - 1, c = d.children[nm];
      L.push(prefix + (last ? '└── ' : '├── ') + nameHtml(nm, c, io.tty));
      if (c.type === 'dir') { dirCount++; walk(c, prefix + (last ? '    ' : '│   ')); } else fileCount++;
    });
  })(n, '');
  L.push('', `${dirCount} directories, ${fileCount} files`);
  return { out: L.join('\n') + '\n', html: io.tty };
};

C.mkdir = (a) => {
  const { f, rest } = parseFlags(a);
  if (!rest.length) return { err: 'mkdir: missing operand', code: 1 };
  const err = [];
  for (const t of rest) {
    const abs = norm(t);
    if (getNode(abs)) { if (!f.has('p')) err.push(`mkdir: cannot create directory '${t}': File exists`); continue; }
    if (!writable(abs)) { err.push(`mkdir: cannot create directory '${t}': Permission denied`); continue; }
    const [parentAbs, name] = splitPath(abs), parent = getNode(parentAbs);
    if (!parent) {
      if (!f.has('p')) { err.push(`mkdir: cannot create directory '${t}': No such file or directory`); continue; }
      let cur = S.fs; // -p: crea toda la cadena
      for (const seg of abs.slice(1).split('/')) {
        if (!cur.children[seg]) cur.children[seg] = newDir();
        cur = cur.children[seg];
        if (cur.type !== 'dir') { err.push(`mkdir: cannot create directory '${t}': Not a directory`); break; }
      }
      continue;
    }
    if (parent.type !== 'dir') { err.push(`mkdir: cannot create directory '${t}': Not a directory`); continue; }
    parent.children[name] = newDir();
  }
  return { err: err.join('\n'), code: err.length ? 1 : 0 };
};

C.touch = (a) => {
  if (!a.length) return { err: 'touch: missing file operand', code: 1 };
  const err = [];
  for (const t of a) {
    const abs = norm(t), n = getNode(abs);
    if (n) { n.mtime = Date.now(); continue; }
    const [parentAbs, name] = splitPath(abs), parent = getNode(parentAbs);
    if (!parent || parent.type !== 'dir') { err.push(`touch: cannot touch '${t}': No such file or directory`); continue; }
    if (!writable(abs)) { err.push(`touch: cannot touch '${t}': Permission denied`); continue; }
    parent.children[name] = newFile();
  }
  return { err: err.join('\n'), code: err.length ? 1 : 0 };
};

/* cp y mv comparten casi toda la lógica */
function copyOrMove(a, move) {
  const cmd = move ? 'mv' : 'cp';
  const { f, rest } = parseFlags(a);
  const recursive = move || f.has('r') || f.has('R');
  if (rest.length < 2) return { err: rest.length ? `${cmd}: missing destination file operand after '${rest[0]}'` : `${cmd}: missing file operand`, code: 1 };

  const dest = rest.pop(), destAbs = norm(dest), destNode = getNode(destAbs), err = [];
  if (rest.length > 1 && (!destNode || destNode.type !== 'dir')) return { err: `${cmd}: target '${dest}' is not a directory`, code: 1 };

  for (const src of rest) {
    const srcAbs = norm(src), srcNode = getNode(srcAbs);
    if (!srcNode) { err.push(`${cmd}: cannot stat '${src}': No such file or directory`); continue; }
    if (srcNode.type === 'dir' && !recursive) { err.push(`cp: -r not specified; omitting directory '${src}'`); continue; }

    const targetAbs = (destNode && destNode.type === 'dir') ? (destAbs === '/' ? '' : destAbs) + '/' + splitPath(srcAbs)[1] : destAbs;
    if (targetAbs === srcAbs) { err.push(`${cmd}: '${src}' and '${dest}' are the same file`); continue; }
    if (srcNode.type === 'dir' && (targetAbs + '/').startsWith(srcAbs + '/')) { err.push(`${cmd}: cannot ${move ? 'move' : 'copy'} a directory, '${src}', into itself, '${dest}'`); continue; }

    const [tParentAbs, tName] = splitPath(targetAbs), tParent = getNode(tParentAbs);
    if (!tParent || tParent.type !== 'dir') { err.push(`${cmd}: cannot ${move ? 'move' : 'create regular file'} '${dest}': No such file or directory`); continue; }
    if (!writable(targetAbs) || (move && !writable(srcAbs))) { err.push(`${cmd}: cannot ${move ? 'move' : 'create regular file'} '${dest}': Permission denied`); continue; }
    const existing = tParent.children[tName];
    if (existing && existing.type === 'dir' && srcNode.type !== 'dir') { err.push(`${cmd}: cannot overwrite directory '${dest}' with non-directory`); continue; }

    tParent.children[tName] = move ? srcNode : cloneNode(srcNode);
    if (move) {
      const [sp, sn] = splitPath(srcAbs);
      delete getNode(sp).children[sn];
      if (S.cwd === srcAbs || S.cwd.startsWith(srcAbs + '/')) S.cwd = targetAbs + S.cwd.slice(srcAbs.length);
    }
  }
  return { err: err.join('\n'), code: err.length ? 1 : 0 };
}
C.cp = (a) => copyOrMove(a, false);
C.mv = (a) => copyOrMove(a, true);

C.rm = (a) => {
  const { f, rest } = parseFlags(a);
  const recursive = f.has('r') || f.has('R'), force = f.has('f');
  if (!rest.length) return force ? {} : { err: 'rm: missing operand', code: 1 };
  const err = [];
  for (const t of rest) {
    if (t === '.' || t === '..' || /\/\.\.?$/.test(t)) { err.push(`rm: refusing to remove '.' or '..' directory: skipping '${t}'`); continue; }
    const abs = norm(t), n = getNode(abs);
    if (abs === '/' && recursive) { err.push("rm: it is dangerous to operate recursively on '/'\nrm: use --no-preserve-root to override this failsafe"); continue; }
    if (!n) { if (!force) err.push(`rm: cannot remove '${t}': No such file or directory`); continue; }
    if (n.type === 'dir' && !recursive) { err.push(`rm: cannot remove '${t}': Is a directory`); continue; }
    if (!writable(abs)) { err.push(`rm: cannot remove '${t}': Permission denied`); continue; }
    const [parentAbs, name] = splitPath(abs);
    delete getNode(parentAbs).children[name];
    if (S.cwd === abs || S.cwd.startsWith(abs + '/')) S.cwd = parentAbs;
  }
  return { err: err.join('\n'), code: err.length ? 1 : 0 };
};

C.rmdir = (a) => {
  if (!a.length) return { err: 'rmdir: missing operand', code: 1 };
  const err = [];
  for (const t of a) {
    const abs = norm(t), n = getNode(abs);
    if (!n) { err.push(`rmdir: failed to remove '${t}': No such file or directory`); continue; }
    if (n.type !== 'dir') { err.push(`rmdir: failed to remove '${t}': Not a directory`); continue; }
    if (Object.keys(n.children).length) { err.push(`rmdir: failed to remove '${t}': Directory not empty`); continue; }
    if (!writable(abs)) { err.push(`rmdir: failed to remove '${t}': Permission denied`); continue; }
    const [parentAbs, name] = splitPath(abs);
    delete getNode(parentAbs).children[name];
    if (S.cwd === abs) S.cwd = parentAbs;
  }
  return { err: err.join('\n'), code: err.length ? 1 : 0 };
};
