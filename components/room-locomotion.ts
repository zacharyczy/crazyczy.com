import { walkStep } from './room-physics';
export const JUMP_SPEED = 5.6;
export const GRAVITY = 18;
export function createLocomotion() {
  return { vx: 0, vz: 0, height: 0, vy: 0, phase: 0, gait: 0, landing: 0 };
}
export type Locomotion = ReturnType<typeof createLocomotion>;
/** Horizontal collisions remain solid while airborne; the room has one walkable floor. */
export function stepLocomotion(
  s: Locomotion,
  x: number,
  z: number,
  dx: number,
  dz: number,
  dt: number,
) {
  dt = Math.max(0, Math.min(dt, 0.04));
  const blend = 1 - Math.exp(-18 * dt);
  s.vx += (dx - s.vx) * blend;
  s.vz += (dz - s.vz) * blend;
  if (Math.abs(s.vx) < 0.001) s.vx = 0;
  if (Math.abs(s.vz) < 0.001) s.vz = 0;
  const p = walkStep(x, z, s.vx * dt, s.vz * dt);
  if (Math.abs(p.x - x) < 1e-8) s.vx = 0;
  if (Math.abs(p.z - z) < 1e-8) s.vz = 0;
  const distance = Math.hypot(p.x - x, p.z - z);
  s.phase += distance * 6.2;
  const walking = s.height === 0 && distance > 0.0001;
  s.gait +=
    ((walking ? Math.min(1, distance / Math.max(dt, 0.001) / 2.4) : 0) -
      s.gait) *
    (1 - Math.exp(-14 * dt));
  s.landing *= Math.exp(-18 * dt);
  if (s.height > 0 || s.vy > 0) {
    s.height += s.vy * dt - 0.5 * GRAVITY * dt * dt;
    s.vy -= GRAVITY * dt;
    if (s.height <= 0) {
      s.height = 0;
      s.vy = 0;
      s.landing = 1;
    }
  }
  return p;
}
export function beginJump(s: Locomotion) {
  if (s.height !== 0 || s.vy !== 0) return false;
  s.vy = JUMP_SPEED;
  return true;
}
export function stopLocomotion(s: Locomotion) {
  s.vx = s.vz = s.height = s.vy = s.gait = s.landing = 0;
}
