'use client';
import { useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { usePixelMaterials } from './room-materials';
import { Hotspot } from './room-interaction';
import { roomGuide, studyLabel } from '@/lib/room-guide';
import type { StudyPanel } from '@/lib/room-guide';
import type { Language } from '@/lib/content';
import type { RoomView } from './room-navigation';
type P = [number, number, number];
export const LAPTOP = {
  tilt: -0.18,
  screen: {
    position: [
      0,
      1.3375 + 0.46 * Math.cos(0.18) + 0.024 * Math.sin(0.18),
      0.06 - 0.46 * Math.sin(0.18) + 0.024 * Math.cos(0.18),
    ] as P,
    width: 1.28,
    height: 0.8,
  },
};
export const STUDY_VIEWS: Record<StudyPanel, RoomView> = {
  map: {
    id: 'map',
    position: [-6.24, 3.78, -3.1],
    normal: [1, 0, 0],
    width: 4.08,
    height: 2.51,
    padding: 1.12,
  },
  writing: {
    id: 'writing',
    position: [-2.35, 1.36, 0.8],
    normal: [0, 0.9, 0.44],
    width: 2.2,
    height: 1.5,
    padding: 1.08,
  },
  computer: {
    id: 'computer',
    position: LAPTOP.screen.position,
    normal: [0, Math.sin(0.18), Math.cos(0.18)],
    width: LAPTOP.screen.width,
    height: LAPTOP.screen.height,
    padding: 1.12,
  },
  tactics: {
    id: 'tactics',
    position: [2.43, 1.42, 0.5],
    normal: [0, 0.95, 0.32],
    width: 2.6,
    height: 1.4,
    padding: 1.15,
  },
  guide: {
    id: 'guide',
    position: [3.4, 2.5, -6.2],
    width: 2.35,
    height: 1.55,
    padding: 1.2,
  },
  suggestions: {
    id: 'suggestions',
    position: [3.4, 2.5, -6.2],
    width: 2.35,
    height: 1.55,
    padding: 1.2,
  },
};
function Box({
  p = [0, 0, 0],
  s,
  c = '#ad8457',
  wood = false,
  r = [0, 0, 0],
}: {
  p?: P;
  s: P;
  c?: string;
  wood?: boolean;
  r?: P;
}) {
  const m = usePixelMaterials();
  return (
    <mesh position={p} rotation={r} castShadow receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial
        map={wood ? m.walnut : undefined}
        color={c}
        roughness={0.78}
      />
    </mesh>
  );
}
type Block = { p: P; s: P; c: string; r?: number };
function Blocks({ items }: { items: Block[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const m = usePixelMaterials();
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    items.forEach((b, i) => {
      dummy.position.set(...b.p);
      dummy.scale.set(...b.s);
      dummy.rotation.set(0, 0, b.r ?? 0);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
      ref.current!.setColorAt(i, new THREE.Color(b.c));
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor)
      ref.current!.instanceColor.needsUpdate = true;
    ref.current!.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, items.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry />
      <meshStandardMaterial map={m.paper} roughness={0.95} />
    </instancedMesh>
  );
}
export function makeBookcaseBooks() {
  const result: Block[] = [];
  const colors = [
    '#786247',
    '#49665d',
    '#963f35',
    '#c4a66b',
    '#4c627a',
    '#ded0ae',
    '#6b4d62',
    '#9a7b48',
    '#344e59',
    '#897366',
    '#5f6944',
  ];
  // Each bay has its own stack location, gaps and mix of paperbacks/hardcovers.
  const stacks = [
    [-1, 1],
    [0, -1],
    [1, 0],
    [-1, -1],
    [0, 1],
  ];
  for (let row = 0; row < 5; row++)
    for (let bay = 0; bay < 2; bay++) {
      const base = 0.21 + row * 0.86,
        left = bay === 0 ? -2.17 : 0.07,
        right = bay === 0 ? -0.07 : 2.17;
      const stack = stacks[row][bay],
        stackWidth = 0.48 + (row % 3) * 0.035;
      let from = left,
        to = right;
      if (stack !== 0) {
        const center =
          stack < 0 ? left + stackWidth / 2 : right - stackWidth / 2;
        let y = base;
        const count = 3 + ((row + bay) % 4);
        for (let n = 0; n < count; n++) {
          const thickness = 0.044 + ((n + row * 2) % 4) * 0.01,
            width = stackWidth - 0.025 * (n % 3),
            offset = (n % 2) * 0.025;
          result.push(
            {
              p: [center + offset, y + thickness / 2, 0.01],
              s: [width, thickness, 0.52],
              c: colors[(n * 3 + row + bay) % colors.length],
            },
            {
              p: [center + offset, y + thickness / 2, 0.023],
              s: [width - 0.035, thickness - 0.015, 0.51],
              c: '#e4d7b2',
            },
          );
          y += thickness + 0.002;
        }
        if (stack < 0) from += stackWidth + 0.1;
        else to -= stackWidth + 0.1;
      }
      let x = from,
        number = 0;
      while (x < to - 0.05) {
        const seed = number * 17 + row * 31 + bay * 23;
        const width = 0.045 + (seed % 8) * 0.008,
          height = 0.43 + ((seed * 7) % 11) * 0.029;
        const angle =
          number === ((row * 3 + bay * 2) % 9) + 4 ? (bay ? -0.12 : 0.1) : 0;
        const extent =
          width * Math.cos(angle) + height * Math.abs(Math.sin(angle));
        if (x + extent > to) break;
        const center = x + extent / 2,
          cy =
            base +
            (height * Math.cos(angle) + width * Math.abs(Math.sin(angle))) / 2;
        const color = colors[(seed + Math.floor(number / 3)) % colors.length];
        const part = (
          px: number,
          py: number,
          pz: number,
          sx: number,
          sy: number,
          sz: number,
          c: string,
        ) =>
          result.push({
            p: [
              center + px * Math.cos(angle) - py * Math.sin(angle),
              cy + px * Math.sin(angle) + py * Math.cos(angle),
              pz,
            ],
            s: [sx, sy, sz],
            c,
            r: angle,
          });
        part(0, 0, 0, width, height, 0.54, color);
        part(0, 0, -0.025, width - 0.014, height - 0.025, 0.485, '#ded2b5');
        part(0, height * 0.28, 0.279, width * 0.7, 0.018, 0.012, '#dcccaa');
        if (seed % 3 !== 0)
          part(0, -height * 0.23, 0.279, width * 0.65, 0.009, 0.012, '#b9aa89');
        x += extent + 0.008 + (seed % 3) * 0.004;
        // Uneven breathing space replaces identical rows of equally spaced books.
        if (number === 5 + ((row + bay) % 5)) x += 0.035 + row * 0.011;
        number++;
      }
    }
  return result;
}
export function Bookcase() {
  const books = useMemo(() => makeBookcaseBooks(), []);
  return (
    <group
      name="bookcase"
      position={[-5.94, 0, 2.6]}
      rotation={[0, Math.PI / 2, 0]}
    >
      <Box p={[0, 2.365, -0.35]} s={[4.6, 4.73, 0.1]} wood c="#8e765a" />
      {[-2.25, 2.25].map((x) => (
        <Box
          key={x}
          p={[x, 2.365, 0]}
          s={[0.12, 4.73, 0.86]}
          wood
          c="#c3a885"
        />
      ))}
      {[0.15, 1.01, 1.87, 2.73, 3.59, 4.68].map((y) => (
        <Box key={y} p={[0, y, 0]} s={[4.6, 0.12, 0.86]} wood c="#c3a885" />
      ))}
      <Box p={[0, 0.07, 0.04]} s={[4.58, 0.14, 0.82]} wood />
      <Box p={[0, 2.4, 0]} s={[0.09, 4.52, 0.79]} wood c="#b29a79" />
      <Blocks items={books} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Box
          key={i}
          p={[1.14, 0.28 + i * 0.86, 0.13]}
          s={[0.035, 0.38, 0.45]}
          c="#76613e"
        />
      ))}
    </group>
  );
}
function SmallPlant() {
  const m = usePixelMaterials();
  return (
    <group>
      <mesh position={[0, 0.13, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.25, 10]} />
        <meshStandardMaterial map={m.plaster} color="#a86742" />
      </mesh>
      <mesh position={[0, 0.257, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.135, 12]} />
        <meshStandardMaterial color="#43352a" />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <group key={i} rotation={[0, i * 2.4, 0]}>
          <mesh
            position={[0.1, 0.33 + (i % 3) * 0.045, 0]}
            rotation={[0, 0, -0.8]}
            scale={[0.07, 0.2, 0.026]}
            castShadow
          >
            <sphereGeometry args={[1, 8, 5]} />
            <meshStandardMaterial color={i % 2 ? '#65804b' : '#3c634c'} />
          </mesh>
          <mesh
            position={[0.18, 0.22 - (i % 3) * 0.1, 0]}
            rotation={[0, 0, -0.3]}
            scale={[0.065, 0.15, 0.025]}
            castShadow
          >
            <sphereGeometry args={[1, 8, 5]} />
            <meshStandardMaterial color="#4f7045" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
export function CollectionShelves() {
  return (
    <group name="collection-shelves" position={[-4.25, 0, -6.03]}>
      {[-1.25, 1.25].map((x) => (
        <Box
          key={x}
          p={[x, 2.46, 0]}
          s={[0.055, 1.65, 0.07]}
          wood
          c="#c9ac90"
        />
      ))}
      {[2.36, 3.13].map((y) => (
        <Box key={y} p={[0, y, 0.14]} s={[2.72, 0.09, 0.62]} wood c="#c9ac90" />
      ))}
      <group position={[-0.85, 2.405, 0.18]}>
        <Box p={[0, 0.16, 0]} s={[0.25, 0.3, 0.23]} c="#c79c69" />
        <Box p={[0, 0.39, 0]} s={[0.32, 0.25, 0.25]} c="#d5b17d" />
        {[-1, 1].map((side) => (
          <group key={side}>
            <Box
              p={[side * 0.11, 0.55, 0]}
              s={[0.095, 0.14, 0.16]}
              c="#c79c69"
              r={[0, 0, side * -0.18]}
            />
            <Box
              p={[side * 0.075, 0.41, 0.131]}
              s={[0.04, 0.035, 0.015]}
              c="#282b23"
            />
          </group>
        ))}
        <Box p={[0, 0.35, 0.135]} s={[0.025, 0.02, 0.02]} c="#986454" />
        <Box
          p={[0.18, 0.16, -0.035]}
          s={[0.08, 0.25, 0.08]}
          c="#c79c69"
          r={[0, 0, -0.6]}
        />
      </group>
      <group position={[0.8, 3.18, 0.1]}>
        <SmallPlant />
      </group>
      <group position={[-0.63, 3.32, 0.14]}>
        <Box s={[0.5, 0.28, 0.24]} c="#3c4038" />
        <Box p={[0, 0.17, 0]} s={[0.2, 0.075, 0.2]} c="#a1a18a" />
        <mesh position={[0.06, 0, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.17, 12]} />
          <meshStandardMaterial color="#282c2b" metalness={0.4} />
        </mesh>
        <mesh position={[0.06, 0, 0.27]}>
          <circleGeometry args={[0.073, 16]} />
          <meshStandardMaterial
            color="#2e626b"
            metalness={0.4}
            roughness={0.15}
          />
        </mesh>
        <Box p={[-0.18, 0.075, 0.13]} s={[0.08, 0.035, 0.015]} c="#e9cfa3" />
      </group>
      <Blocks
        items={['#52685b', '#b29162', '#844c3d'].map((c, i) => ({
          p: [-0.05, 2.455 + i * 0.075, 0.16] as P,
          s: [0.52, 0.065, 0.37] as P,
          c,
        }))}
      />
    </group>
  );
}
export function DetailedFloorLamp({ on }: { on: boolean }) {
  const m = usePixelMaterials();
  return (
    <group position={[-2.24, 0, -5.78]}>
      <mesh position={[0, 0.09, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.39, 0.16, 16]} />
        <meshStandardMaterial
          color="#363831"
          metalness={0.55}
          roughness={0.45}
        />
      </mesh>
      <mesh position={[0, 1.44, 0]} castShadow>
        <cylinderGeometry args={[0.026, 0.038, 2.7, 12]} />
        <meshStandardMaterial
          color="#8b774e"
          metalness={0.65}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 2.72, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.55, 0.62, 16, 1, true]} />
        <meshStandardMaterial
          map={m.cloth}
          color="#e2c597"
          side={THREE.DoubleSide}
          roughness={1}
        />
      </mesh>
      <mesh position={[0, 2.72, 0]}>
        <cylinderGeometry args={[0.266, 0.532, 0.6, 16, 1, true]} />
        <meshStandardMaterial
          color="#fff0c9"
          side={THREE.BackSide}
          emissive="#ffc875"
          emissiveIntensity={on ? 0.12 : 0}
        />
      </mesh>
      {[2.405, 3.035].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[i ? 0.28 : 0.55, 0.018, 6, 16]} />
          <meshStandardMaterial color="#b39a6d" />
        </mesh>
      ))}
      <mesh position={[0, 2.55, 0]}>
        <sphereGeometry args={[0.11, 12, 8]} />
        <meshStandardMaterial
          color="#fff2ca"
          emissive="#ffce8b"
          emissiveIntensity={on ? 1.3 : 0}
        />
      </mesh>
      <Box p={[0, 2.34, 0]} s={[0.11, 0.13, 0.11]} c="#766a4d" />
      <Box p={[0.1, 2.19, 0]} s={[0.045, 0.1, 0.045]} c="#c9a970" />
      <pointLight
        position={[0, 2.49, 0]}
        intensity={on ? 19 : 0}
        distance={7}
        color="#ffcb88"
      />
    </group>
  );
}
export function DetailedPendant() {
  const m = usePixelMaterials();
  return (
    <group position={[0.3, 6.36, 0.55]}>
      <mesh position={[0, -0.015, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.1, 16]} />
        <meshStandardMaterial color="#766040" metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.51, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.95, 8]} />
        <meshStandardMaterial color="#352f28" />
      </mesh>
      <mesh position={[0, -1.06, 0]}>
        <cylinderGeometry args={[0.1, 0.17, 0.2, 12]} />
        <meshStandardMaterial color="#8b7350" metalness={0.6} />
      </mesh>
      <mesh position={[0, -1.25, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.6, 0.45, 20, 1, true]} />
        <meshStandardMaterial
          map={m.plaster}
          color="#ab7952"
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, -1.24, 0]}>
        <cylinderGeometry args={[0.165, 0.58, 0.425, 20, 1, true]} />
        <meshStandardMaterial color="#f1d9ab" side={THREE.BackSide} />
      </mesh>
      {[-1.475, -1.44].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.59, 0.016, 6, 20]} />
          <meshStandardMaterial color="#91794f" metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, -1.32, 0]}>
        <sphereGeometry args={[0.12, 12, 8]} />
        <meshStandardMaterial
          color="#fff0cc"
          emissive="#ffc879"
          emissiveIntensity={1.6}
        />
      </mesh>
      <pointLight
        position={[0, -1.48, 0]}
        intensity={25}
        distance={9}
        color="#ffcf97"
      />
    </group>
  );
}
export function DetailedGuitar() {
  const m = usePixelMaterials();
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.08);
    s.bezierCurveTo(-0.6, 0.06, -0.66, 0.52, -0.37, 0.83);
    s.bezierCurveTo(-0.2, 1.03, -0.51, 1.14, -0.34, 1.4);
    s.bezierCurveTo(-0.2, 1.57, 0.2, 1.57, 0.34, 1.4);
    s.bezierCurveTo(0.51, 1.14, 0.2, 1.03, 0.37, 0.83);
    s.bezierCurveTo(0.66, 0.52, 0.6, 0.06, 0, 0.08);
    return s;
  }, []);
  return (
    <group
      name="detailed-guitar"
      position={[4.5, 0.12, -5.81]}
      rotation={[0, -0.14, -0.1]}
      scale={1.06}
    >
      <mesh castShadow>
        <extrudeGeometry
          args={[
            shape,
            {
              depth: 0.24,
              bevelEnabled: true,
              bevelSegments: 1,
              steps: 1,
              bevelSize: 0.025,
              bevelThickness: 0.025,
              curveSegments: 10,
            },
          ]}
        />
        <meshStandardMaterial map={m.oak} color="#bc8d54" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.268]} scale={[0.955, 0.975, 1]}>
        <shapeGeometry args={[shape, 10]} />
        <meshStandardMaterial map={m.oak} color="#e2bd7c" />
      </mesh>
      <mesh position={[0, 1.1, 0.278]}>
        <circleGeometry args={[0.155, 24]} />
        <meshStandardMaterial color="#241c14" />
      </mesh>
      <mesh position={[0, 1.1, 0.28]}>
        <ringGeometry args={[0.158, 0.177, 24]} />
        <meshStandardMaterial color="#8f5f35" />
      </mesh>
      <Box p={[0, 0.52, 0.3]} s={[0.34, 0.1, 0.06]} c="#59402c" />
      <Box p={[0, 0.55, 0.336]} s={[0.25, 0.022, 0.018]} c="#e7d2a2" />
      <Box p={[0, 2.02, 0.1]} s={[0.17, 1.45, 0.16]} wood c="#69503c" />
      <Box p={[0, 2.02, 0.197]} s={[0.18, 1.42, 0.035]} c="#45352a" />
      <Box p={[0, 2.89, 0.1]} s={[0.27, 0.37, 0.18]} wood c="#a17d52" />
      {Array.from({ length: 15 }, (_, i) => (
        <Box
          key={i}
          p={[0, 1.47 + i * 0.077, 0.222]}
          s={[0.18, 0.009, 0.014]}
          c="#c7c0a4"
        />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <Box
          key={i}
          p={[-0.062 + i * 0.025, 1.66, 0.25]}
          s={[0.003, 2.24, 0.003]}
          c={i < 3 ? '#cbb98a' : '#e0dac4'}
        />
      ))}
      {[-1, 1].flatMap((side) =>
        [0, 1, 2].map((i) => (
          <group key={`${side}${i}`}>
            <Box
              p={[side * 0.18, 2.8 + i * 0.092, 0.12]}
              s={[0.095, 0.03, 0.035]}
              c="#bab79f"
            />
            <Box
              p={[side * 0.23, 2.8 + i * 0.092, 0.12]}
              s={[0.04, 0.065, 0.075]}
              c="#c2bda4"
            />
          </group>
        )),
      )}
      <group position={[1.0, 0.43, 0.05]}>
        {['#915e46', '#4e706a', '#c2a269', '#d9c8a4'].map((c, i) => (
          <group
            key={c}
            position={[i * 0.045, i * 0.04, i * 0.045]}
            rotation={[0, 0, i * 0.04]}
          >
            <Box s={[0.65, 0.69, 0.035]} c={c} />
            <Box p={[0, 0.09, 0.023]} s={[0.43, 0.1, 0.01]} c="#e1c892" />
          </group>
        ))}
      </group>
      <Box p={[0, 0.035, 0.02]} s={[0.6, 0.06, 0.65]} c="#35382f" />
      {[-1, 1].map((side) => (
        <Box
          key={side}
          p={[side * 0.27, 0.25, 0.1]}
          s={[0.035, 0.45, 0.045]}
          c="#35382f"
          r={[0, 0, side * 0.2]}
        />
      ))}
    </group>
  );
}
export function PixelLabel({
  text,
  width,
  height,
  color = '#423e2d',
  background = '#e1cf98',
  font = 20,
}: {
  text: string;
  width: number;
  height: number;
  color?: string;
  background?: string;
  font?: number;
}) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = Math.round((512 * height) / width);
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = color;
    ctx.font = `${font}px monospace`;
    let line = '',
      y = font * 1.7;
    for (const char of text) {
      if (char === '\n' || ctx.measureText(line + char).width > 470) {
        ctx.fillText(line, 21, y);
        y += font * 1.45;
        line = char === '\n' ? '' : char;
      } else line += char;
    }
    ctx.fillText(line, 21, y);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    return t;
  }, [text, width, height, color, background, font]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
export function StudyDesk({
  lang,
  onOpen,
}: {
  lang: Language;
  onOpen: (id: StudyPanel) => void;
}) {
  const m = usePixelMaterials();
  return (
    <>
      <group name="computer">
        <Hotspot
          label={studyLabel('computer', lang)}
          onActivate={() => onOpen('computer')}
        >
          <RoundedBox
            name="laptop-base"
            args={[1.48, 0.055, 0.95]}
            radius={0.025}
            smoothness={2}
            position={[0, 1.3075, 0.52]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              map={m.plaster}
              color="#bec6be"
              metalness={0.48}
              roughness={0.5}
            />
          </RoundedBox>
          {[-0.6, 0.6].flatMap((x) =>
            [0.14, 0.88].map((z) => (
              <Box
                key={`${x}-${z}`}
                p={[x, 1.276, z]}
                s={[0.14, 0.017, 0.08]}
                c="#3d4743"
              />
            )),
          )}
          <Box p={[0, 1.34, 0.43]} s={[1.29, 0.009, 0.37]} c="#505a53" />
          <Blocks
            items={Array.from({ length: 48 }, (_, i) => ({
              p: [
                -0.576 + (i % 12) * 0.105,
                1.349,
                0.29 + Math.floor(i / 12) * 0.083,
              ] as P,
              s: [0.091, 0.017, 0.067] as P,
              c: i % 12 === 0 ? '#727d70' : '#d8dccc',
            }))}
          />
          <Box p={[0, 1.341, 0.61]} s={[0.5, 0.014, 0.048]} c="#d8dccc" />
          <RoundedBox
            args={[0.43, 0.007, 0.21]}
            radius={0.017}
            smoothness={1}
            position={[0, 1.338, 0.81]}
          >
            <meshStandardMaterial
              color="#9ca9a0"
              metalness={0.4}
              roughness={0.6}
            />
          </RoundedBox>
          {[-0.55, 0.55].map((x) => (
            <mesh
              key={x}
              position={[x, 1.34, 0.066]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.033, 0.033, 0.2, 12]} />
              <meshStandardMaterial
                color="#7a8980"
                metalness={0.65}
                roughness={0.4}
              />
            </mesh>
          ))}
          <group position={[0, 1.3375, 0.06]} rotation={[LAPTOP.tilt, 0, 0]}>
            <RoundedBox
              name="laptop-lid"
              args={[1.46, 0.92, 0.035]}
              radius={0.025}
              smoothness={2}
              position={[0, 0.46, 0]}
              castShadow
            >
              <meshStandardMaterial
                map={m.plaster}
                color="#a8b5ad"
                metalness={0.5}
                roughness={0.45}
              />
            </RoundedBox>
            <Box p={[0, 0.46, 0.02]} s={[1.36, 0.85, 0.009]} c="#283d36" />
            <group position={[0, 0.46, 0.026]}>
              <PixelLabel
                text={
                  'CRAZY OS  •  2026\n\n> Projects\n\n_ Terminal  [minimized]'
                }
                width={1.28}
                height={0.8}
                background="#344f49"
                color="#ddd9b8"
                font={27}
              />
            </group>
            <mesh position={[0, 0.898, 0.026]}>
              <circleGeometry args={[0.008, 8]} />
              <meshStandardMaterial color="#172925" />
            </mesh>
          </group>
          <Box
            p={[-0.741, 1.309, 0.25]}
            s={[0.004, 0.019, 0.065]}
            c="#3a4943"
          />
          <Box p={[0.741, 1.309, 0.22]} s={[0.004, 0.015, 0.11]} c="#3a4943" />
          <Box p={[0.65, 1.34, 0.94]} s={[0.018, 0.007, 0.007]} c="#a4dbaa" />
        </Hotspot>
      </group>
      <group name="writing-paper" position={[-2.35, 1.35, 0.8]}>
        <Hotspot
          label={studyLabel('writing', lang)}
          onActivate={() => onOpen('writing')}
        >
          {[0, 1, 2, 3].map((i) => (
            <Box
              key={i}
              p={[i * 0.012, -0.035 + i * 0.009, -i * 0.015]}
              s={[2.12, 0.009, 1.36]}
              c={i % 2 ? '#ede0bb' : '#dfd0a6'}
              r={[0, (i - 2) * 0.012, 0]}
            />
          ))}
          <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
            <PixelLabel
              text={
                lang === 'zh'
                  ? 'FIELD NOTES / 文稿\n\n代码、想法，以及值得留下的事。\n\n文章 / 随笔 / 诗歌\n\n写下它，慢慢读。'
                  : 'FIELD NOTES / WRITING\n\nCode, ideas, and things worth keeping.\n\nArticles / Essays / Poems\n\nTake a moment. Read a little.'
              }
              width={2.06}
              height={1.3}
              background="#eadcb5"
              font={21}
            />
          </group>
          <Box
            p={[0.99, 0.026, 0.55]}
            s={[0.15, 0.015, 0.23]}
            c="#efdfb5"
            r={[0, 0, 0.14]}
          />
        </Hotspot>
      </group>
    </>
  );
}
export function StickyNotes({
  lang,
  onOpen,
}: {
  lang: Language;
  onOpen: (id: StudyPanel) => void;
}) {
  return (
    <group name="sticky-notes" position={[3.15, 2.5, -6.23]}>
      <Hotspot
        label={studyLabel('guide', lang)}
        onActivate={() => onOpen('guide')}
      >
        {roomGuide(lang)
          .slice(0, 6)
          .map((note, i) => (
            <group
              key={note.id}
              position={[
                ((i % 2) - 0.5) * 0.57,
                (1 - Math.floor(i / 2)) * 0.43,
                0.012 * (i % 2),
              ]}
              rotation={[0, 0, ((i % 3) - 1) * 0.035]}
            >
              <PixelLabel
                text={note.title + '\n' + note.text}
                width={0.53}
                height={0.39}
                font={35}
                background={['#e7cf88', '#b8c7a0', '#d2bca3'][i % 3]}
              />
              <Box p={[0, 0.192, 0.005]} s={[0.16, 0.055, 0.005]} c="#c6b895" />
            </group>
          ))}
      </Hotspot>
      <group position={[0.86, -0.02, 0.03]} rotation={[0, 0, -0.06]}>
        <Hotspot
          label={studyLabel('suggestions', lang)}
          onActivate={() => onOpen('suggestions')}
        >
          <PixelLabel
            text={
              lang === 'zh' ? '访客簿\n\n建议 →' : 'Visitor\nbook\n\nNotes →'
            }
            width={0.4}
            height={0.65}
            font={41}
            background="#cea07f"
          />
        </Hotspot>
      </group>
    </group>
  );
}
