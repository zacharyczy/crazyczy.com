'use client';
import { useEffect, useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { usePixelMaterials } from './room-materials';

type Point = [number, number, number];
export function RoomShell() {
  const maps = usePixelMaterials();
  const floorTexture = useMemo(() => { const map = maps.oak.clone(); map.center.set(.5, .5); map.rotation = Math.PI / 2; return map; }, [maps.oak]);
  useEffect(() => () => floorTexture.dispose(), [floorTexture]);
  const panels = [
    { position: [0, 3.24, -6.5] as Point, size: [13, 6.48, .2] as Point },
    { position: [-6.5, 3.24, .1] as Point, size: [.2, 6.48, 13.2] as Point },
    // The right wall has a genuine floor-to-ceiling window opening.
    { position: [6.5, 3.24, -5.38] as Point, size: [.2, 6.48, 2.24] as Point },
    { position: [6.5, 3.24, 4.88] as Point, size: [.2, 6.48, 3.64] as Point },
    { position: [6.5, 6.12, -.6] as Point, size: [.2, .72, 7.32] as Point },
    // A full-height wooden door sits behind and to the right of the sofa.
    { position: [-1.875, 3.24, 6.7] as Point, size: [9.25, 6.48, .2] as Point },
    { position: [5.675, 3.24, 6.7] as Point, size: [1.65, 6.48, .2] as Point },
    { position: [3.8, 5.34, 6.7] as Point, size: [2.1, 2.28, .2] as Point },
  ];
  return <group onPointerOver={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
    <mesh position={[0, -.1, .1]} receiveShadow><boxGeometry args={[13.2, .2, 13.4]} /><meshStandardMaterial color="#30251e" /></mesh>
    {Array.from({ length: 12 }, (_, row) => Array.from({ length: 6 }, (_, column) => {
      const x = -5.4 + column * 2.16;
      const z = -5.96 + row * 1.1;
      return <mesh key={`${row}-${column}`} position={[x, .01, z]} receiveShadow><boxGeometry args={[2.145, .035, 1.085]} /><meshStandardMaterial map={floorTexture} color={['#dbbb8d', '#f1d4a6', '#d7b68b', '#e8c396'][(column + row * 3) % 4]} roughness={.82} /></mesh>;
    }))}
    {panels.map((panel, i) => <mesh key={i} position={panel.position} receiveShadow><boxGeometry args={panel.size} /><meshStandardMaterial map={maps.plaster} color="#f0e9dc" roughness={.96} /></mesh>)}
    <mesh position={[0, 6.5, .1]} receiveShadow><boxGeometry args={[13.2, .2, 13.4]} /><meshStandardMaterial map={maps.plaster} color="#f2e7d0" roughness={1} /></mesh>
    <group position={[0, .75, -6.35]}>
      <mesh receiveShadow><boxGeometry args={[12.8, 1.5, .08]} /><meshStandardMaterial map={maps.walnut} color="#bfb4a2" roughness={.8} /></mesh>
      {[-.69, .71].map((y) => <mesh key={y} position={[0, y, .065]}><boxGeometry args={[12.9, .055, .075]} /><meshStandardMaterial map={maps.oak} color="#ccaa7c" /></mesh>)}
      {Array.from({ length: 13 }, (_, i) => <mesh key={i} position={[-6 + i, 0, .055]}><boxGeometry args={[.045, 1.4, .04]} /><meshStandardMaterial map={maps.walnut} color="#c2ac85" /></mesh>)}
    </group>
    {[-1, 1].map((side) => <group key={side} position={[side * 6.34, .16, .1]}>
      <mesh><boxGeometry args={[.1, .28, 13.15]} /><meshStandardMaterial map={maps.walnut} roughness={.7} /></mesh>
      <mesh position={[0, 6.08, 0]}><boxGeometry args={[.15, .16, 13.15]} /><meshStandardMaterial map={maps.oak} color="#c5a77a" /></mesh>
    </group>)}
    <mesh position={[0, 6.23, -6.32]}><boxGeometry args={[12.8, .18, .18]} /><meshStandardMaterial map={maps.oak} color="#c5a77a" /></mesh>
    <mesh position={[0, 6.23, 6.5]}><boxGeometry args={[12.8, .18, .18]} /><meshStandardMaterial map={maps.oak} color="#c5a77a" /></mesh>
    <group name="rug" position={[0, .065, 1.1]} scale={[1, 1, 6.3 / 5.35]}>
      <mesh receiveShadow><boxGeometry args={[7.4, .04, 5.35]} /><meshStandardMaterial map={maps.cloth} color="#8b4538" roughness={1} /></mesh>
      {[-1, 1].map((side) => <group key={side}>
        <mesh position={[side * 3.44, .026, 0]}><boxGeometry args={[.15, .016, 4.92]} /><meshStandardMaterial map={maps.cloth} color="#dfc18b" /></mesh>
        <mesh position={[0, .026, side * 2.42]}><boxGeometry args={[7.02, .016, .14]} /><meshStandardMaterial map={maps.cloth} color="#dfc18b" /></mesh>
        {Array.from({ length: 36 }, (_, i) => <mesh key={i} position={[-3.4 + i * .194, -.005, side * 2.77]}><boxGeometry args={[.025, .02, .2]} /><meshStandardMaterial color="#b9a98b" /></mesh>)}
      </group>)}
      {Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[-2.7 + (i % 4) * 1.8, .032, i < 4 ? -1.8 : 1.8]} rotation={[0, Math.PI / 4, 0]}><boxGeometry args={[.18, .02, .18]} /><meshStandardMaterial color="#b89d68" /></mesh>)}
    </group>
  </group>;
}

export function WoodenDoor() {
  const maps = usePixelMaterials();
  return <group position={[3.8, 0, 6.56]} rotation={[0, Math.PI, 0]}>
    {[-1, 1].map((side) => <mesh key={side} position={[side * 1, 2.09, .08]} castShadow><boxGeometry args={[.16, 4.18, .22]} /><meshStandardMaterial map={maps.walnut} roughness={.68} /></mesh>)}
    <mesh position={[0, 4.14, .08]} castShadow><boxGeometry args={[2.16, .18, .22]} /><meshStandardMaterial map={maps.walnut} /></mesh>
    <mesh position={[0, 2.04, 0]} castShadow receiveShadow><boxGeometry args={[1.84, 4.03, .14]} /><meshStandardMaterial map={maps.walnut} color="#e2bd88" roughness={.7} /></mesh>
    {[.91, 2.96].map((y) => <group key={y} position={[0, y, .08]}>
      <mesh><boxGeometry args={[1.45, 1.58, .025]} /><meshStandardMaterial map={maps.oak} color="#a88865" roughness={.8} /></mesh>
      {[-1, 1].map((side) => <group key={side}>
        <mesh position={[side * .73, 0, .025]}><boxGeometry args={[.055, 1.64, .05]} /><meshStandardMaterial map={maps.walnut} color="#e1be8f" /></mesh>
        <mesh position={[0, side * .79, .025]}><boxGeometry args={[1.49, .055, .05]} /><meshStandardMaterial map={maps.walnut} color="#e1be8f" /></mesh>
      </group>)}
    </group>)}
    <mesh position={[.67, 1.99, .14]}><boxGeometry args={[.13, .35, .045]} /><meshStandardMaterial color="#b79751" metalness={.75} roughness={.3} /></mesh>
    <mesh position={[.57, 2.07, .23]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.035, .035, .29, 12]} /><meshStandardMaterial color="#d7b568" metalness={.72} roughness={.27} /></mesh>
    {[.55, 2, 3.45].map((y) => <mesh key={y} position={[-.88, y, .11]}><cylinderGeometry args={[.035, .035, .18, 10]} /><meshStandardMaterial color="#9d7c46" metalness={.7} roughness={.4} /></mesh>)}
    <mesh position={[0, .04, .09]}><boxGeometry args={[1.88, .06, .32]} /><meshStandardMaterial map={maps.oak} /></mesh>
  </group>;
}

export function ReadingSofa() {
  const maps = usePixelMaterials();
  return <group name="sofa" position={[.35, 0, 4.72]} rotation={[0, Math.PI, 0]}>
    {[-1.4, 1.4].flatMap((x) => [-.7, .7].map((z) => <mesh key={`${x}-${z}`} position={[x, .2, z]} castShadow><boxGeometry args={[.15, .38, .15]} /><meshStandardMaterial map={maps.walnut} /></mesh>))}
    <RoundedBox args={[3.55, .38, 1.94]} radius={.09} smoothness={1} position={[0, .45, 0]} castShadow receiveShadow><meshStandardMaterial map={maps.cloth} color="#804833" roughness={.98} /></RoundedBox>
    {[-.82, .82].map((x) => <group key={x}>
      <RoundedBox args={[1.55, .35, 1.52]} radius={.12} smoothness={1} position={[x, .78, .12]} castShadow receiveShadow><meshStandardMaterial map={maps.cloth} color="#c27b50" roughness={1} /></RoundedBox>
      <RoundedBox args={[1.56, 1.23, .39]} radius={.13} smoothness={1} position={[x, 1.27, -.69]} rotation={[-.12, 0, 0]} castShadow><meshStandardMaterial map={maps.cloth} color="#b26b47" roughness={1} /></RoundedBox>
      <mesh position={[x, .75, .89]}><boxGeometry args={[1.38, .024, .019]} /><meshStandardMaterial color="#d5ab77" /></mesh>
    </group>)}
    {[-1, 1].map((side) => <RoundedBox key={side} args={[.26, .74, 1.85]} radius={.075} smoothness={1} position={[side * 1.73, .92, -.01]} castShadow><meshStandardMaterial map={maps.cloth} color="#a36142" roughness={1} /></RoundedBox>)}
    <RoundedBox args={[.72, .7, .22]} radius={.09} smoothness={1} position={[-1.1, 1.2, -.21]} rotation={[-.22, .12, -.24]} castShadow><meshStandardMaterial map={maps.cloth} color="#466c64" roughness={1} /></RoundedBox>
    <group position={[1.05, 1.0, .25]}>
      <mesh rotation={[-.12, 0, .08]}><boxGeometry args={[.66, .055, 1.14]} /><meshStandardMaterial map={maps.cloth} color="#cfb781" /></mesh>
      {[-.24, -.12, 0, .12, .24].map((x) => <mesh key={x} position={[x, -.03, .67]} rotation={[-.8, 0, 0]}><boxGeometry args={[.025, .022, .26]} /><meshStandardMaterial color="#cfb781" /></mesh>)}
    </group>
  </group>;
}

export function BrushDesk() {
  const maps = usePixelMaterials();
  const profile = useMemo(() => [new THREE.Vector2(.002, 0), new THREE.Vector2(.016, .035), new THREE.Vector2(.032, .105), new THREE.Vector2(.03, .17), new THREE.Vector2(.025, .19)], []);
  return <group position={[-2.85, 1.32, .35]} rotation={[0, .1, 0]}>
    {[0, 1, 2].map((sheet) => <mesh key={sheet} position={[.35 + sheet * .013, sheet * .012, .3 - sheet * .015]} rotation={[0, -.12 + sheet * .018, 0]} receiveShadow><boxGeometry args={[1.28, .009, .88]} /><meshStandardMaterial map={maps.paper} roughness={1} /></mesh>)}
    <mesh position={[.6, .049, .36]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.44, .31]} /><meshStandardMaterial color="#d9cda9" roughness={1} /></mesh>
    {[-.22, -.03, .16].map((x) => <group key={x} position={[x + .5, .055, .35]} rotation={[0, .2, 0]}>
      <mesh><boxGeometry args={[.025, .004, .3]} /><meshStandardMaterial color="#534d3a" roughness={1} /></mesh>
      <mesh position={[.045, 0, -.08]} rotation={[0, .55, 0]}><boxGeometry args={[.09, .004, .018]} /><meshStandardMaterial color="#534d3a" roughness={1} /></mesh>
    </group>)}
    <group position={[-.96, .06, .3]}>
      <RoundedBox args={[.43, .12, .58]} radius={.045} smoothness={2} castShadow><meshStandardMaterial color="#383832" roughness={.55} /></RoundedBox>
      <mesh position={[0, .065, .045]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.158, 24]} /><meshStandardMaterial color="#111916" roughness={.12} metalness={.15} /></mesh>
      <mesh position={[0, .1, -.19]} rotation={[0, .08, 0]}><boxGeometry args={[.11, .09, .28]} /><meshStandardMaterial color="#262a24" roughness={.4} /></mesh>
    </group>
    <group position={[-.16, 0, -.65]}>
      {[-.63, .63].map((x) => <group key={x}>
        <RoundedBox args={[.24, .06, .42]} radius={.02} smoothness={1} position={[x, .02, 0]} castShadow><meshStandardMaterial map={maps.walnut} /></RoundedBox>
        <mesh position={[x, .52, 0]} castShadow><boxGeometry args={[.08, 1.0, .09]} /><meshStandardMaterial map={maps.walnut} /></mesh>
        <mesh position={[x, 1.08, 0]}><boxGeometry args={[.15, .06, .15]} /><meshStandardMaterial map={maps.oak} /></mesh>
      </group>)}
      <RoundedBox args={[1.54, .1, .12]} radius={.025} smoothness={1} position={[0, 1.01, 0]} castShadow><meshStandardMaterial map={maps.walnut} /></RoundedBox>
      {[-.38, 0, .38].map((x, index) => <group key={x} position={[x, .11 + index * .035, .015]}>
        <mesh position={[0, .805 - index * .035, 0]}><torusGeometry args={[.04, .009, 6, 12]} /><meshStandardMaterial color="#967846" metalness={.55} roughness={.4} /></mesh>
        <mesh position={[0, .52, 0]} castShadow><cylinderGeometry args={[.025, .028, .53, 12]} /><meshStandardMaterial map={maps.oak} color={index === 1 ? '#e2bd74' : '#b99767'} roughness={.55} /></mesh>
        {[.29, .73].map((y) => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[.03, .03, .038, 12]} /><meshStandardMaterial color="#514230" roughness={.5} /></mesh>)}
        <mesh position={[0, .08, 0]} castShadow><latheGeometry args={[profile, 12]} /><meshStandardMaterial color={index === 1 ? '#a49470' : '#302b25'} roughness={.98} /></mesh>
        {[-.015, 0, .015].map((dx) => <mesh key={dx} position={[dx, .16, .026]} rotation={[0, 0, dx * 6]}><boxGeometry args={[.003, .1, .003]} /><meshStandardMaterial color="#181d16" /></mesh>)}
      </group>)}
    </group>
    <group position={[1.14, .12, -.22]}>
      <mesh castShadow><boxGeometry args={[.2, .22, .2]} /><meshStandardMaterial map={maps.walnut} color="#6e3629" /></mesh>
      <mesh position={[0, .13, 0]}><boxGeometry args={[.14, .05, .14]} /><meshStandardMaterial color="#987458" /></mesh>
    </group>
  </group>;
}

export function DetailedCube({ position, rotation = 0, size = .54, order = 3 }: { position: Point; rotation?: number; size?: number; order?: 3 | 4 }) {
  const faces: { rotation: Point; color: string }[] = [
    { rotation: [0, 0, 0], color: '#cf493d' }, { rotation: [0, Math.PI, 0], color: '#e6a33c' },
    { rotation: [0, Math.PI / 2, 0], color: '#407259' }, { rotation: [0, -Math.PI / 2, 0], color: '#3a6caa' },
    { rotation: [-Math.PI / 2, 0, 0], color: '#eac956' }, { rotation: [Math.PI / 2, 0, 0], color: '#ece6d3' },
  ];
  const step = size / order;
  const indices = Array.from({ length: order }, (_, i) => i - (order - 1) / 2);
  return <group position={position} rotation={[0, rotation, 0]}>
    {indices.flatMap((x) => indices.flatMap((y) => indices.map((z) => <RoundedBox key={`${x}-${y}-${z}`} position={[x * step, y * step, z * step]} args={[step * .965, step * .965, step * .965]} radius={size * .02} smoothness={1} castShadow><meshStandardMaterial color="#171d1a" roughness={.4} /></RoundedBox>)))}
    {faces.map((face, faceIndex) => <group key={faceIndex} rotation={face.rotation}>
      {indices.flatMap((x) => indices.map((y) => <RoundedBox key={`${x}-${y}`} position={[x * step, y * step, size / 2 + .004]} args={[step * .8, step * .8, .009]} radius={.006} smoothness={1}>
        <meshStandardMaterial color={face.color} metalness={.02} roughness={.46} />
      </RoundedBox>))}
    </group>)}
  </group>;
}

export function DetailedPyramid({ position, scale = 1 }: { position: Point; scale?: number }) {
  const tiles = useMemo(() => {
    const v = [new THREE.Vector3(0, .36, 0), new THREE.Vector3(-.3, -.18, .2), new THREE.Vector3(.3, -.18, .2), new THREE.Vector3(0, -.18, -.32)];
    return [[0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 3, 2]].flatMap((face, side) => {
      const [a, b, c] = face.map((i) => v[i]);
      const normal = new THREE.Vector3().crossVectors(b.clone().sub(a), c.clone().sub(a)).normalize();
      if (normal.dot(a.clone().add(b).add(c)) < 0) normal.negate();
      const at = (i: number, j: number) => a.clone().addScaledVector(b.clone().sub(a), i / 3).addScaledVector(c.clone().sub(a), j / 3);
      const result: { vertices: Float32Array; normal: Float32Array; color: string }[] = [];
      const add = (points: THREE.Vector3[]) => {
        const center = points.reduce((sum, point) => sum.add(point), new THREE.Vector3()).multiplyScalar(1 / 3);
        result.push({ vertices: new Float32Array(points.flatMap((point) => point.sub(center).multiplyScalar(.88).add(center).addScaledVector(normal, .006).toArray())), normal: new Float32Array([...normal.toArray(), ...normal.toArray(), ...normal.toArray()]), color: ['#d9b646', '#408062', '#cd4c3c', '#427aaa'][side] });
      };
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3 - i; j++) {
        add([at(i, j), at(i + 1, j), at(i, j + 1)]);
        if (i + j < 2) add([at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)]);
      }
      return result;
    });
  }, []);
  return <group position={position} scale={scale} rotation={[0, -.28, 0]}>
    {tiles.map((tile, index) => <mesh key={index} castShadow><bufferGeometry><bufferAttribute attach="attributes-position" args={[tile.vertices, 3]} /><bufferAttribute attach="attributes-normal" args={[tile.normal, 3]} /></bufferGeometry><meshStandardMaterial color={tile.color} side={THREE.DoubleSide} roughness={.5} /></mesh>)}
  </group>;
}
