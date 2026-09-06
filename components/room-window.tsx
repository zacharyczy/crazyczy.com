'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { GardenPlant } from './room-plants';
import garden from '@/pic/jiangnan-garden-pixel.png';
import { usePixelMaterials } from './room-materials';

export function GardenWindow({ night, reducedMotion }: { night: boolean; reducedMotion: boolean }) {
  const maps = usePixelMaterials();
  const source = useTexture(garden.src);
  const backdrop = useMemo(() => {
    const texture = source.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, [source]);
  useEffect(() => () => backdrop.dispose(), [backdrop]);
  const rain = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const elapsed = useRef(0);
  const drops = useMemo(() => Array.from({ length: 170 }, (_, i) => ({ x: ((i * 43) % 167) / 167 * 7.1 - 3.55, y: ((i * 59) % 163) / 163 * 5.6, z: -.13 - (i % 3) * .18, speed: 1.2 + (i % 7) * .18 })), []);
  useFrame((_, delta) => {
    if (!rain.current) return;
    if (!reducedMotion) elapsed.current += Math.min(delta, .04);
    drops.forEach((drop, i) => {
      dummy.position.set(drop.x, .2 + THREE.MathUtils.euclideanModulo(drop.y - elapsed.current * drop.speed, 5.45), drop.z);
      dummy.rotation.set(0, 0, -.07);
      dummy.updateMatrix();
      rain.current!.setMatrixAt(i, dummy.matrix);
    });
    rain.current.instanceMatrix.needsUpdate = true;
  });
  return <group position={[6.48, 0, -.6]} rotation={[0, -Math.PI / 2, 0]}>
    {/* A distant view and a near garden create parallax behind the glass. */}
    <mesh position={[0, 3.35, -4.9]}><planeGeometry args={[18, 11]} /><meshBasicMaterial map={backdrop} color={night ? '#415873' : '#dce4cf'} toneMapped={false} /></mesh>
    <mesh position={[0, -.02, -3.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[14, 8]} /><meshStandardMaterial map={maps.cloth} color={night ? '#293e36' : '#74846a'} roughness={1} /></mesh>
    <GardenPlant position={[-2.55, 0, -1.5]} />
    <GardenPlant position={[2.65, 0, -1.25]} fern />
    {[-1, 1].map((side) => <group key={side}>
      <mesh position={[side * 3.63, 2.89, .04]} castShadow><boxGeometry args={[.16, 5.76, .42]} /><meshStandardMaterial map={maps.walnut} roughness={.75} /></mesh>
      <mesh position={[0, side < 0 ? .12 : 5.7, .04]} castShadow><boxGeometry args={[7.42, .16, .42]} /><meshStandardMaterial map={maps.walnut} roughness={.75} /></mesh>
    </group>)}
    {[-1.21, 1.21].map((x) => <mesh key={x} position={[x, 2.88, .06]} castShadow><boxGeometry args={[.08, 5.5, .18]} /><meshStandardMaterial map={maps.walnut} color="#c3ae92" roughness={.7} /></mesh>)}
    <mesh position={[0, 4.62, .075]} castShadow><boxGeometry args={[7.22, .065, .16]} /><meshStandardMaterial map={maps.walnut} color="#c3ae92" roughness={.7} /></mesh>
    <mesh position={[0, 2.89, .045]}><planeGeometry args={[7.1, 5.48]} /><meshPhysicalMaterial color={night ? '#8da9c8' : '#d8e8e1'} transparent opacity={.07} roughness={.2} metalness={.1} depthWrite={false} side={THREE.DoubleSide} /></mesh>
    <instancedMesh ref={rain} args={[undefined, undefined, drops.length]} frustumCulled={false}>
      <planeGeometry args={[.012, .105]} /><meshBasicMaterial color={night ? '#adc5e2' : '#edf5ec'} transparent opacity={.46} depthWrite={false} side={THREE.DoubleSide} />
    </instancedMesh>
    <mesh position={[0, .08, .35]} receiveShadow><boxGeometry args={[7.52, .12, .68]} /><meshStandardMaterial map={maps.oak} color="#d4ba8c" roughness={.8} /></mesh>
    <mesh position={[0, 5.98, .4]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.035, .035, 8.1, 12]} /><meshStandardMaterial color="#9b7e48" metalness={.6} roughness={.4} /></mesh>
    {[-1, 1].map((side) => <group key={side}>
      {Array.from({ length: 5 }, (_, i) => <group key={i} position={[side * (3.47 + i * .12), 0, .38 + (i % 2) * .05]}>
        <mesh position={[0, 3.02, 0]} castShadow><boxGeometry args={[.135, 5.65 - (i % 2) * .035, .16]} /><meshStandardMaterial map={maps.cloth} color={i % 2 ? '#b2b9a3' : '#c2c7b1'} roughness={1} /></mesh>
        <mesh position={[0, 5.94, 0]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[.046, .009, 6, 12]} /><meshStandardMaterial color="#88704a" metalness={.5} /></mesh>
      </group>)}
    </group>)}
  </group>;
}
