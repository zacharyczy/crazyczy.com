'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export function FootballField({ reducedMotion }: { reducedMotion: boolean }) {
  const ball = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector2(.15, .1));
  const shadow = useRef<THREE.Mesh>(null);
  const rolling = useMemo(() => ({ axis: new THREE.Vector3(), turn: new THREE.Quaternion() }), []);
  const radius = .15 * .4;
  const turfHeight = .124;

  useFrame((_, delta) => {
    if (!ball.current || reducedMotion) return;
    const step = Math.min(delta, .05);
    const dx = velocity.current.x * step, dz = velocity.current.y * step;
    ball.current.position.x += dx;
    ball.current.position.z += dz;
    if (Math.abs(ball.current.position.x) > 1.78) velocity.current.x = -Math.sign(ball.current.position.x) * Math.abs(velocity.current.x);
    if (Math.abs(ball.current.position.z) > .91) velocity.current.y = -Math.sign(ball.current.position.z) * Math.abs(velocity.current.y);
    rolling.axis.set(dz, 0, -dx).normalize();
    rolling.turn.setFromAxisAngle(rolling.axis, Math.hypot(dx, dz) / radius);
    ball.current.quaternion.premultiply(rolling.turn);
    if (shadow.current) { shadow.current.position.x = ball.current.position.x; shadow.current.position.z = ball.current.position.z; }

  });

  const stripes = [-1.8, -1.2, -.6, 0, .6, 1.2, 1.8];
  return (
    <group name="football-field" position={[1.05, 1.3325, .22]} scale={.65}>
      <RoundedBox args={[4.98, .2, 2.58]} radius={.1} castShadow receiveShadow>
        <meshStandardMaterial color="#193426" roughness={.72} />
      </RoundedBox>
      {stripes.map((x, index) => (
        <mesh key={x} position={[x, .115, 0]} receiveShadow>
          <boxGeometry args={[.58, .018, 2.34]} />
          <meshStandardMaterial color={index % 2 ? '#2f7545' : '#3e8650'} roughness={.94} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`goal-apron-${side}`} position={[side * 2.29, .116, 0]} receiveShadow>
          <boxGeometry args={[.44, .02, 1.18]} />
          <meshStandardMaterial color={side > 0 ? '#347a48' : '#397f4b'} roughness={.94} />
        </mesh>
      ))}
      {[
        [0, -1.17, 4.15, .018],
        [0, 1.17, 4.15, .018],
        [-2.07, 0, .018, 2.35],
        [2.07, 0, .018, 2.35],
      ].map((line, index) => (
        <mesh key={index} position={[line[0], .134, line[1]]}>
          <boxGeometry args={[line[2], .014, line[3]]} />
          <meshBasicMaterial color="#f7f1df" />
        </mesh>
      ))}
      <mesh position={[0, .132, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[.32, .345, 48]} />
        <meshBasicMaterial color="#f7f1df" />
      </mesh>
      <mesh position={[0, .133, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[.018, 2.34]} />
        <meshBasicMaterial color="#f7f1df" />
      </mesh>
      <mesh position={[0, .136, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.025, 18]} /><meshBasicMaterial color="#f7f1df" /></mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 1.35, .138, 0]}><boxGeometry args={[.018, .014, 1.38]} /><meshBasicMaterial color="#f7f1df" /></mesh>
          {[-.68, .68].map((z) => <mesh key={`penalty-side-${z}`} position={[side * 1.71, .138, z]}><boxGeometry args={[.72, .014, .018]} /><meshBasicMaterial color="#f7f1df" /></mesh>)}
          <mesh position={[side * 1.73, .139, 0]}><boxGeometry args={[.018, .014, .74]} /><meshBasicMaterial color="#f7f1df" /></mesh>
          {[-.36, .36].map((z) => <mesh key={`goal-area-${z}`} position={[side * 1.9, .139, z]}><boxGeometry args={[.34, .014, .018]} /><meshBasicMaterial color="#f7f1df" /></mesh>)}
          <mesh position={[side * 1.49, .141, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.022, 16]} /><meshBasicMaterial color="#f7f1df" /></mesh>
          <mesh position={[side * 1.49, .137, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[.29, .305, 40, 1, side > 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI]} />
            <meshBasicMaterial color="#f7f1df" />
          </mesh>
          <group position={[side * 2.08, .145, 0]}>
            {[-.5, .5].map((z) => <mesh key={`post-${z}`} position={[0, .31, z]} castShadow><cylinderGeometry args={[.026, .026, .62, 16]} /><meshStandardMaterial color="#f5f2e8" roughness={.46} /></mesh>)}
            <mesh position={[0, .62, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.026, .026, 1.05, 16]} /><meshStandardMaterial color="#f5f2e8" roughness={.46} /></mesh>
            {[-.5, .5].map((z) => <mesh key={`depth-${z}`} position={[side * .15, .62, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.018, .018, .3, 12]} /><meshStandardMaterial color="#e8e4d8" roughness={.6} /></mesh>)}
            <mesh position={[side * .3, .34, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.018, .018, 1.02, 12]} /><meshStandardMaterial color="#e8e4d8" roughness={.6} /></mesh>
            {[-.44, -.22, 0, .22, .44].map((z) => <mesh key={`net-v-${z}`} position={[side * .29, .31, z]}><boxGeometry args={[.009, .55, .009]} /><meshBasicMaterial color="#eeeade" transparent opacity={.72} /></mesh>)}
            {[.08, .2, .32, .44, .56].map((y) => <mesh key={`net-h-${y}`} position={[side * .29, y, 0]}><boxGeometry args={[.009, .009, 1]} /><meshBasicMaterial color="#eeeade" transparent opacity={.72} /></mesh>)}
            {[-.5, .5].flatMap((z) => [.1, .26, .42, .58].map((y) => <mesh key={`side-${z}-${y}`} position={[side * .15, y, z]}><boxGeometry args={[.29, .009, .009]} /><meshBasicMaterial color="#eeeade" transparent opacity={.62} /></mesh>))}
          </group>
        </group>
      ))}
      <mesh ref={shadow} position={[.15, turfHeight + .003, .1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 1.2, 20]} /><meshBasicMaterial color="#102d18" transparent opacity={.35} depthWrite={false} />
      </mesh>
      <group name="football" ref={ball} position={[.15, turfHeight + radius, .1]} scale={.4}>
        <mesh castShadow><sphereGeometry args={[.15, 20, 14]} /><meshPhysicalMaterial color="#f4f1e8" roughness={.42} clearcoat={.18} clearcoatRoughness={.55} /></mesh>
        {[
          [0, 1, 1.618], [0, -1, 1.618], [0, 1, -1.618], [0, -1, -1.618],
          [1, 1.618, 0], [-1, 1.618, 0], [1, -1.618, 0], [-1, -1.618, 0],
          [1.618, 0, 1], [-1.618, 0, 1], [1.618, 0, -1], [-1.618, 0, -1],
        ].map((coordinates, index) => {
          const direction = new THREE.Vector3(...coordinates as [number, number, number]).normalize();
          const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
          return (
            <group key={index} position={direction.clone().multiplyScalar(.151)} quaternion={quaternion}>
              <mesh><circleGeometry args={[.041, 5]} /><meshStandardMaterial color="#c9c6bd" roughness={.7} polygonOffset polygonOffsetFactor={-2} /></mesh>
              <mesh position={[0, 0, .0015]}><circleGeometry args={[.032, 5]} /><meshStandardMaterial color="#171817" roughness={.58} polygonOffset polygonOffsetFactor={-3} /></mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}
