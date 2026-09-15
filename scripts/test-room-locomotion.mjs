import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { runInNewContext } from 'node:vm';
function load(name) {
  const code = ts.transpileModule(
    fs.readFileSync(`components/${name}.ts`, 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const mod = { exports: {} };
  runInNewContext(`(function(require,module,exports){${code}})`)(
    (id) => load(id.replace('./', '')),
    mod,
    mod.exports,
  );
  return mod.exports;
}
const {
  createLocomotion,
  stepLocomotion,
  beginJump,
  stopLocomotion,
  JUMP_SPEED,
  GRAVITY,
} = load('room-locomotion');
for (const fps of [30, 60, 144]) {
  const s = createLocomotion();
  assert.ok(beginJump(s));
  assert.equal(beginJump(s), false);
  let peak = 0,
    landed = false;
  for (let i = 0; i < fps * 2; i++) {
    stepLocomotion(s, 5.4, 4, 0, 0, 1 / fps);
    peak = Math.max(peak, s.height);
    assert.ok(s.height >= 0);
    if (s.height === 0 && s.vy === 0) landed = true;
  }
  assert.ok(Math.abs(peak - JUMP_SPEED ** 2 / (2 * GRAVITY)) < 0.01);
  assert.ok(landed);
  assert.equal(s.height, 0);
  assert.ok(beginJump(s));
  stopLocomotion(s);
  assert.equal(s.vy, 0);
  assert.equal(s.height, 0);
}
const s = createLocomotion();
let p = { x: 5.4, z: 4 };
p = stepLocomotion(s, p.x, p.z, 0, -2.4, 1 / 60);
assert.ok(s.vz < 0 && s.vz > -2.4);
for (let i = 0; i < 40; i++) p = stepLocomotion(s, p.x, p.z, 0, -2.4, 1 / 60);
assert.ok(s.phase > 0 && s.gait > 0.5);
for (let i = 0; i < 120; i++) p = stepLocomotion(s, p.x, p.z, 0, 0, 1 / 60);
assert.ok(Math.abs(s.vz) < 0.001 && s.gait < 0.001);
let wall = { x: 5.4, z: -5.9 };
for (let i = 0; i < 200; i++)
  wall = stepLocomotion(s, wall.x, wall.z, 0, -4.2, 1 / 60);
assert.equal(wall.z, -6.1);
assert.ok(s.gait < 0.001);
let desk = { x: 4.5, z: 0.5 };
beginJump(s);
for (let i = 0; i < 150; i++)
  desk = stepLocomotion(s, desk.x, desk.z, -2.4, 0, 1 / 60);
assert.ok(desk.x >= 4.23);
console.log(
  'PASS: jump arcs at 30/60/144 FPS, one jump per landing, grounded reset, acceleration, stopping gait, wall and airborne furniture collisions.',
);
