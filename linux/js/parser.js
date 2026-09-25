/* Parser de bash simplificado: comillas, variables, pipes, redirecciones,
   operadores && || ; y comodines * ? */

function varValue(k) {
  const vars = { HOME, USER: 'leo', PWD: S.cwd, SHELL: '/bin/bash', '?': String(S.lastCode), EDITOR: 'nano' };
  return vars[k] ?? '';
}

/* Línea → tokens. Palabra: {v, q} (q = venía entre comillas). Operador: {op} */
function tokenize(line) {
  const toks = [];
  let cur = null, i = 0;
  const push = () => { if (cur) { toks.push(cur); cur = null; } };

  while (i < line.length) {
    const c = line[i];
    if (c === ' ' || c === '\t') { push(); i++; continue; }
    if (c === '|') { push(); if (line[i + 1] === '|') { toks.push({ op: '||' }); i += 2; } else { toks.push({ op: '|' }); i++; } continue; }
    if (c === '&' && line[i + 1] === '&') { push(); toks.push({ op: '&&' }); i += 2; continue; }
    if (c === ';') { push(); toks.push({ op: ';' }); i++; continue; }
    if (c === '>') { push(); if (line[i + 1] === '>') { toks.push({ op: '>>' }); i += 2; } else { toks.push({ op: '>' }); i++; } continue; }
    if (c === '<') { push(); toks.push({ op: '<' }); i++; continue; }

    cur = cur || { v: '', q: false };
    if (c === "'") { // comillas simples: literal
      const j = line.indexOf("'", i + 1);
      if (j < 0) throw "bash: unexpected EOF while looking for matching `''";
      cur.v += line.slice(i + 1, j); cur.q = true; i = j + 1; continue;
    }
    if (c === '"') { // comillas dobles: expanden $VAR
      let j = i + 1, s = '';
      while (j < line.length && line[j] !== '"') {
        if (line[j] === '\\' && j + 1 < line.length) { s += line[j + 1]; j += 2; continue; }
        if (line[j] === '$') { const m = /^\$(\w+|\?)/.exec(line.slice(j)); if (m) { s += varValue(m[1]); j += m[0].length; continue; } }
        s += line[j]; j++;
      }
      if (j >= line.length) throw 'bash: unexpected EOF while looking for matching `"\'';
      cur.v += s; cur.q = true; i = j + 1; continue;
    }
    if (c === '\\' && i + 1 < line.length) { cur.v += line[i + 1]; i += 2; continue; }
    if (c === '$') { const m = /^\$(\w+|\?)/.exec(line.slice(i)); if (m) { cur.v += varValue(m[1]); i += m[0].length; continue; } }
    cur.v += c; i++;
  }
  push();
  return toks;
}

/* Expande ~ y comodines (solo en el último segmento de la ruta) */
function expandWord(t) {
  let v = t.v;
  if (!t.q && (v === '~' || v.startsWith('~/'))) v = HOME + v.slice(1);
  if (t.q || !/[*?]/.test(v)) return [v];
  const i = v.lastIndexOf('/'), dirPart = v.slice(0, i + 1), pattern = v.slice(i + 1);
  const dir = getNode(norm(dirPart || '.'));
  if (!dir || dir.type !== 'dir') return [v];
  const re = globToRegex(pattern);
  const matches = Object.keys(dir.children)
    .filter((n) => re.test(n) && (pattern.startsWith('.') || !n.startsWith('.')))
    .sort();
  return matches.length ? matches.map((n) => dirPart + n) : [v];
}

/* Tokens → secuencia de pipelines: [{ conn, pipe: [{ argv, redir }] }] */
function parseLine(toks) {
  const seq = [];
  let pipe = [], cmd = { argv: [], redir: [] }, conn = null;
  const close = () => {
    if (!cmd.argv.length && (pipe.length || cmd.redir.length)) throw "bash: syntax error near unexpected token `|'";
    if (cmd.argv.length) pipe.push(cmd);
    cmd = { argv: [], redir: [] };
  };

  for (let k = 0; k < toks.length; k++) {
    const t = toks[k];
    if (t.op === '|') {
      if (!cmd.argv.length) throw "bash: syntax error near unexpected token `|'";
      close();
    } else if (t.op === '&&' || t.op === '||' || t.op === ';') {
      close();
      if (pipe.length) seq.push({ conn, pipe });
      conn = t.op; pipe = [];
    } else if (t.op) {
      const next = toks[++k];
      if (!next || next.op) throw "bash: syntax error near unexpected token `newline'";
      cmd.redir.push({ op: t.op, target: expandWord(next)[0] });
    } else {
      cmd.argv.push(...expandWord(t));
    }
  }
  close();
  if (pipe.length) seq.push({ conn, pipe });
  return seq;
}
