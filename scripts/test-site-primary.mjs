import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { runInNewContext } from 'node:vm';
function load(file) {
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const mod = { exports: {} };
  runInNewContext(`(function(exports){${code}})`)(mod.exports);
  return mod.exports;
}
const routes = load('lib/routes.ts'),
  geo = load('lib/visitor-location.ts');
for (const path of [
  '',
  'blog',
  'blog/ppt-to-chinese',
  'games/snake',
  'terminal',
]) {
  for (const lang of ['en', 'zh']) {
    const url = routes.pageHref(lang, path),
      parsed = routes.parseSitePath(url);
    assert.equal(parsed.lang, lang);
    assert.equal(parsed.path, path);
    assert.equal(routes.parseSitePath(`/${lang}/${path}/`).path, path);
    assert.equal(
      routes.languageAlternates(lang, path).languages['x-default'],
      routes.pageHref('en', path),
    );
  }
}
for (const cf of [
  undefined,
  {},
  { latitude: '', longitude: 2 },
  { latitude: 99, longitude: 2 },
  { latitude: 'NaN', longitude: 2 },
])
  assert.equal(geo.visitorLocation(cf), null);
const location = geo.visitorLocation({
  latitude: '31.2304',
  longitude: '121.4737',
  city: 'Shanghai',
  country: 'CN',
  ip: 'private',
});
assert.equal(location.latitude, 31.2);
assert.equal(location.longitude, 121.5);
assert.equal(location.ip, undefined);
assert.ok(geo.mapPoint(location)[0] > 0);
assert.ok(geo.mapPoint({ latitude: -33, longitude: -70 })[1] < 0);
console.log(
  'PASS: canonical/translation paths, legacy parsing, default language and approximate visitor coordinates.',
);
