/* Tester de las katas (JavaScript y React): cada chequeo agrega { label, pass, detail } a results.
   Depende de fmt (runner.js) y stripComments (highlight.js). */
const TIMEOUT = Symbol('timeout');
const within = (value, ms = 2000) => Promise.race([
  Promise.resolve(value),
  new Promise((_, reject) => setTimeout(() => reject(TIMEOUT), ms))
]);

function same(a, b) {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => same(a[k], b[k]));
}

const show = (v) => (typeof v === 'string' ? "'" + v + "'" : fmt(v));
const thrown = (e) => (e === TIMEOUT ? 'La promesa nunca se resolvió (¿te olvidaste de llamar a resolve?)' : 'Tiró ' + fmt(e));

function makeTester(results, src) {
  const code = stripComments(src);
  return {
    async eq(label, fn, expected) {
      try {
        const got = await within(fn());
        const pass = same(got, expected);
        results.push({ label, pass, detail: pass ? '' : 'Esperaba ' + show(expected) + ' y llegó ' + show(got) });
      } catch (e) { results.push({ label, pass: false, detail: thrown(e) }); }
    },
    async ok(label, fn, hint = '') {
      try {
        const pass = !!(await within(fn()));
        results.push({ label, pass, detail: pass ? '' : typeof hint === 'function' ? hint() : hint });
      } catch (e) { results.push({ label, pass: false, detail: thrown(e) }); }
    },
    async rejects(label, fn, message) {
      try {
        const got = await within(fn());
        results.push({ label, pass: false, detail: 'Resolvió con ' + show(got) + ' en vez de rechazar' });
      } catch (e) {
        const pass = e !== TIMEOUT && e instanceof Error && e.message.includes(message);
        results.push({ label, pass, detail: pass ? '' : e === TIMEOUT ? thrown(e) : 'Rechazó con ' + fmt(e) + ' y esperaba un Error con "' + message + '"' });
      }
    },
    src(label, re, want = true, hint = '') {
      const pass = re.test(code) === want;
      results.push({ label, pass, detail: pass ? '' : hint });
    }
  };
}
