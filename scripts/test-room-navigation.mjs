import assert from 'node:assert/strict';
import {
  STANDING,
  CROUCHING,
  BOUNDS,
  OBSTACLES,
  walkStep,
  turnAngles,
} from '../components/room-physics.ts';
assert.equal(STANDING, 2.7);
assert.equal(CROUCHING, 1.92);
for (const obstacle of OBSTACLES) {
  const midX = (obstacle.x0 + obstacle.x1) / 2,
    midZ = (obstacle.z0 + obstacle.z1) / 2;
  let p = { x: obstacle.x1 + 0.3, z: midZ };
  for (let i = 0; i < 100; i++) p = walkStep(p.x, p.z, -0.04, 0);
  assert.ok(
    p.x >= obstacle.x1 + 0.2 - 1e-9,
    obstacle.name + ' blocks sideways entry',
  );
  p = { x: midX, z: obstacle.z1 + 0.3 };
  for (let i = 0; i < 100; i++) p = walkStep(p.x, p.z, 0, -0.04);
  assert.ok(
    p.z >= obstacle.z1 + 0.2 - 1e-9,
    obstacle.name + ' blocks forward entry',
  );
}
let p = { x: 5, z: 3 };
for (let i = 0; i < 500; i++) p = walkStep(p.x, p.z, 0.05, 0.05);
assert.equal(p.x, BOUNDS.maxX);
assert.equal(p.z, BOUNDS.maxZ);
const drag = turnAngles(0, 0, 100, 100, true),
  mouse = turnAngles(0, 0, 100, 100, false);
assert.ok(
  drag.yaw > 0 && drag.pitch > 0,
  'drag right looks left, drag down looks up',
);
assert.ok(mouse.yaw < 0 && mouse.pitch < 0, 'mouse follows physical movement');
assert.equal(turnAngles(0, 0, 0, 10000, true).pitch, 1.43);
console.log(
  'PASS: two eye heights, every furniture collider, wall bounds, normal mouse and inverse drag, pitch limits. Browser tests cover view stack and pointer lock.',
);
