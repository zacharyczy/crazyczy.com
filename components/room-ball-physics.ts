export type Magnet = { x: number; z: number; team: number; number: number };
export type BallState = {
  x: number;
  z: number;
  vx: number;
  vz: number;
  goal?: -1 | 1;
};
export const BALL_RADIUS = 0.06;
export const MAGNET_RADIUS = 0.11;
export const GOAL = {
  line: 2.08,
  halfWidth: 0.5 - BALL_RADIUS - 0.026,
  back: 2.37,
};
export const kickoff = (side: number): BallState => ({
  x: 0,
  z: 0,
  vx: -side * 0.43,
  vz: 0.27,
});
export const BALL_LIMITS = { x: 1.99, z: 1.1 };
export function createFormation(): Magnet[] {
  const half = [
    [-1.83, 0],
    [-1.12, -0.73],
    [-1.12, -0.25],
    [-1.12, 0.25],
    [-1.12, 0.73],
    [-0.68, -0.58],
    [-0.68, 0],
    [-0.68, 0.58],
    [-0.24, -0.65],
    [-0.24, 0],
    [-0.24, 0.65],
  ];
  return [...half, ...half.map(([x, z]) => [-x, -z])].map(([x, z], i) => ({
    x,
    z,
    team: i < 11 ? 0 : 1,
    number: (i % 11) + 1,
  }));
}
export function resolveBall(
  state: BallState,
  magnets: readonly Pick<Magnet, 'x' | 'z'>[],
): BallState {
  const next = { ...state };
  const minDistance = BALL_RADIUS + MAGNET_RADIUS;
  for (let pass = 0; pass < 4; pass++) {
    for (const magnet of magnets) {
      const dx = next.x - magnet.x,
        dz = next.z - magnet.z,
        distance = Math.hypot(dx, dz);
      if (distance >= minDistance) continue;
      const speed = Math.hypot(next.vx, next.vz) || 1;
      const nx = distance > 1e-8 ? dx / distance : -next.vx / speed,
        nz = distance > 1e-8 ? dz / distance : -next.vz / speed;
      next.x = magnet.x + nx * (minDistance + 0.0001);
      next.z = magnet.z + nz * (minDistance + 0.0001);
      const dot = next.vx * nx + next.vz * nz;
      if (dot < 0) {
        next.vx -= 2 * dot * nx;
        next.vz -= 2 * dot * nz;
      }
    }
    const endLimit =
      Math.abs(next.z) <= GOAL.halfWidth ? GOAL.back : BALL_LIMITS.x;
    if (next.x > endLimit) {
      next.x = endLimit;
      next.vx = -Math.abs(next.vx);
    }
    if (next.x < -endLimit) {
      next.x = -endLimit;
      next.vx = Math.abs(next.vx);
    }
    if (next.z > BALL_LIMITS.z) {
      next.z = BALL_LIMITS.z;
      next.vz = -Math.abs(next.vz);
    }
    if (next.z < -BALL_LIMITS.z) {
      next.z = -BALL_LIMITS.z;
      next.vz = Math.abs(next.vz);
    }
  }
  return next;
}
export function stepBall(
  state: BallState,
  magnets: readonly Pick<Magnet, 'x' | 'z'>[],
  delta: number,
): BallState {
  if (state.goal) return { ...state };
  const duration = Math.min(Math.max(delta, 0), 0.05),
    steps = Math.max(1, Math.ceil(duration / (1 / 120))),
    dt = duration / steps;
  let next = { ...state };
  for (let i = 0; i < steps; i++) {
    next = resolveBall(
      { ...next, x: next.x + next.vx * dt, z: next.z + next.vz * dt },
      magnets,
    );
    if (
      Math.abs(next.x) >= GOAL.line + BALL_RADIUS &&
      Math.abs(next.z) <= GOAL.halfWidth
    )
      return { ...next, goal: next.x > 0 ? 1 : -1 };
  }
  return next;
}

// Sweep to first contact, remove the inward component, and keep sliding tangentially.
export function moveMagnet(
  tokens: readonly Magnet[],
  index: number,
  target: { x: number; z: number },
  onSegment?: (
    from: { x: number; z: number },
    to: { x: number; z: number },
  ) => void,
): Magnet[] {
  const token = tokens[index];
  if (!token) return [...tokens];
  let x = token.x,
    z = token.z,
    dx = target.x - x,
    dz = target.z - z;
  const radius = MAGNET_RADIUS * 2 + 0.002;
  for (let iteration = 0; iteration < 8; iteration++) {
    const lengthSq = dx * dx + dz * dz;
    if (lengthSq < 1e-12) break;
    let fraction = 1,
      nx = 0,
      nz = 0;
    const contact = (t: number, a: number, b: number) => {
      if (t >= 0 && t <= fraction) {
        fraction = t;
        nx = a;
        nz = b;
      }
    };
    if (dx > 0 && x + dx > 1.88) contact((1.88 - x) / dx, -1, 0);
    if (dx < 0 && x + dx < -1.88) contact((-1.88 - x) / dx, 1, 0);
    if (dz > 0 && z + dz > 0.98) contact((0.98 - z) / dz, 0, -1);
    if (dz < 0 && z + dz < -0.98) contact((-0.98 - z) / dz, 0, 1);
    for (let i = 0; i < tokens.length; i++) {
      if (i === index) continue;
      const ox = x - tokens[i].x,
        oz = z - tokens[i].z,
        dot = ox * dx + oz * dz,
        c = ox * ox + oz * oz - radius * radius;
      if (dot >= 0) continue;
      const discriminant = dot * dot - lengthSq * c;
      if (discriminant < 0) continue;
      const t = c <= 0 ? 0 : (-dot - Math.sqrt(discriminant)) / lengthSq;
      const ax = ox + dx * t,
        az = oz + dz * t,
        len = Math.hypot(ax, az);
      if (len > 1e-10) contact(t, ax / len, az / len);
    }
    const move = Math.max(0, fraction - 1e-6 / Math.sqrt(lengthSq));
    const from = { x, z };
    x += dx * move;
    z += dz * move;
    onSegment?.(from, { x, z });
    if (fraction === 1) break;
    dx *= 1 - fraction;
    dz *= 1 - fraction;
    const inward = dx * nx + dz * nz;
    if (inward < 0) {
      dx -= inward * nx;
      dz -= inward * nz;
    }
  }
  return tokens.map((m, i) => (i === index ? { ...m, x, z } : m));
}
