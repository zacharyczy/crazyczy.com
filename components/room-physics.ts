export const STANDING = 2.7;
export const CROUCHING = 1.92;
export const BOUNDS = { minX: -6.12, maxX: 6.12, minZ: -6.1, maxZ: 6.3 };
export const OBSTACLES = [
  { name: 'desk', x0: -4.03, x1: 4.03, z0: -1.23, z1: 2.39 },
  { name: 'sofa', x0: -1.56, x1: 2.26, z0: 3.7, z1: 5.73 },
  { name: 'cabinet', x0: -5.63, x1: -2.87, z0: -6.3, z1: -5.43 },
  { name: 'bookcase', x0: -6.35, x1: -5.38, z0: 0.3, z1: 4.9 },
  { name: 'tv', x0: -1.63, x1: 2.73, z0: -6.19, z1: -5.09 },
];
export function walkStep(x: number, z: number, dx: number, dz: number) {
  const radius = 0.2;
  const blocked = (a: number, b: number) =>
    OBSTACLES.some(
      (o) =>
        a > o.x0 - radius &&
        a < o.x1 + radius &&
        b > o.z0 - radius &&
        b < o.z1 + radius,
    );
  const nx = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, x + dx));
  if (!blocked(nx, z)) x = nx;
  const nz = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, z + dz));
  if (!blocked(x, nz)) z = nz;
  return { x, z };
}
export function turnAngles(
  yaw: number,
  pitch: number,
  dx: number,
  dy: number,
  drag: boolean,
) {
  const sign = drag ? 1 : -1;
  return {
    yaw: yaw + dx * 0.0025 * sign,
    pitch: Math.max(-1.43, Math.min(1.43, pitch + dy * 0.0025 * sign)),
  };
}
