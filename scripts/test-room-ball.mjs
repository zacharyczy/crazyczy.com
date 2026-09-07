import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { runInNewContext } from 'node:vm';
const source = ts.transpileModule(
  fs.readFileSync('components/room-ball-physics.ts', 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
const testModule = { exports: {} };
runInNewContext(source, { module: testModule, exports: testModule.exports });
const {
  stepBall,
  resolveBall,
  createFormation,
  BALL_LIMITS,
  BALL_RADIUS,
  MAGNET_RADIUS,
} = testModule.exports;
const { GOAL, kickoff } = testModule.exports;
const initial = { x: 0.15, z: 0.3, vx: 0.43, vz: 0.27 },
  speed = Math.hypot(initial.vx, initial.vz);
let ball = initial;
const magnets = createFormation();
for (let i = 0; i < 20000; i++) {
  ball = ball.goal ? kickoff(ball.goal) : stepBall(ball, magnets, 1 / 60);
  assert.ok(Math.abs(ball.x) <= GOAL.back && Math.abs(ball.z) <= BALL_LIMITS.z);
  assert.ok(Math.abs(Math.hypot(ball.vx, ball.vz) - speed) < 1e-9);
  for (const m of magnets)
    assert.ok(
      Math.hypot(ball.x - m.x, ball.z - m.z) >=
        BALL_RADIUS + MAGNET_RADIUS - 1e-6,
    );
}
assert.notEqual(ball.x, initial.x);
assert.ok(
  stepBall({ x: 1.985, z: 0.8, vx: 1, vz: 0 }, [], 0.03).vx < 0,
  'wall reflection',
);
assert.ok(
  stepBall({ x: -0.18, z: 0, vx: 1, vz: 0 }, [{ x: 0, z: 0 }], 0.03).vx < 0,
  'magnet reflection',
);
const dropped = resolveBall({ ...initial, x: 0, z: 0 }, [{ x: 0, z: 0 }]);
assert.ok(
  Math.hypot(dropped.x, dropped.z) > 0.17,
  'drag out of magnet overlap',
);
assert.notEqual(
  stepBall(dropped, [], 1 / 60).x,
  dropped.x,
  'release resumes motion',
);
console.log(
  'PASS: 20,000 rolling frames, grounding radius, wall/magnet reflection, speed preservation, drag separation and release.',
);

const { moveMagnet } = testModule.exports;
const pair = [
  { x: -0.7, z: 0, team: 0, number: 1 },
  { x: 0, z: 0, team: 1, number: 1 },
];
const blocked = moveMagnet(pair, 0, { x: 0.9, z: 0 });
assert.ok(blocked[0].x < -0.22, 'fast drag stops in front of obstacle');
let around = moveMagnet(blocked, 0, { x: -0.3, z: 0.5 });
around = moveMagnet(around, 0, { x: 0.7, z: 0.5 });
around = moveMagnet(around, 0, { x: 0.7, z: 0 });
assert.ok(around[0].x > 0.69, 'can deliberately go around obstacle');
let formation = createFormation();
for (let i = 0; i < 3000; i++) {
  const segments = [];
  const previous = formation,
    index = i % 22;
  formation = moveMagnet(
    formation,
    index,
    {
      x: Math.sin(i * 1.7) * 3,
      z: Math.cos(i * 0.79) * 2,
    },
    (a, b) => segments.push([a, b]),
  );
  assert.ok(
    Math.abs(formation[index].x) <= 1.88 + 1e-7 &&
      Math.abs(formation[index].z) <= 0.98 + 1e-7,
    'sliding respects board edges',
  );
  for (let j = 0; j < 22; j++)
    for (let k = j + 1; k < 22; k++)
      assert.ok(
        Math.hypot(
          formation[j].x - formation[k].x,
          formation[j].z - formation[k].z,
        ) >
          0.22 - 1e-7,
      );
  for (const [a, b] of segments)
    for (let t = 0; t <= 20; t++) {
      const x = a.x + ((b.x - a.x) * t) / 20,
        z = a.z + ((b.z - a.z) * t) / 20;
      for (let j = 0; j < 22; j++)
        if (j !== index)
          assert.ok(
            Math.hypot(x - previous[j].x, z - previous[j].z) > 0.22 - 1e-7,
            'sliding segments never penetrate',
          );
    }
}
console.log(
  'PASS: magnets block fast drags, route around obstacles, and remain separate through 3,000 randomized drags.',
);

for (const side of [-1, 1]) {
  let shot = { x: side * 1.98, z: 0.2, vx: side * 0.6, vz: 0 };
  for (let i = 0; i < 30 && !shot.goal; i++) shot = stepBall(shot, [], 1 / 60);
  assert.equal(shot.goal, side, 'full crossing of either goal line scores');
  assert.ok(Math.abs(shot.x) >= GOAL.line + BALL_RADIUS);
  const reset = kickoff(shot.goal);
  assert.equal(reset.x, 0);
  assert.equal(reset.z, 0);
  assert.ok(Math.hypot(reset.vx, reset.vz) > 0);
}
assert.equal(
  stepBall({ x: 2.1, z: 0.2, vx: 0.01, vz: 0 }, [], 1 / 60).goal,
  undefined,
  'whole ball must cross goal line',
);
console.log(
  'PASS: both goal mouths accept goals, outside posts still rebound, kickoff returns to centre.',
);

const glancing = moveMagnet(
  [
    { x: -0.5, z: 0, team: 0, number: 1 },
    { x: 0, z: 0, team: 1, number: 1 },
  ],
  0,
  { x: 0.5, z: 0.2 },
);
assert.ok(
  glancing[0].x > -0.22 && glancing[0].z > 0.2,
  'glancing drag retains tangent movement instead of sticking',
);
assert.ok(Math.hypot(glancing[0].x, glancing[0].z) > 0.22);
console.log(
  'PASS: oblique contact deflects and preserves tangential movement.',
);
