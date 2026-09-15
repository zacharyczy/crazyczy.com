'use client';
import { useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Locomotion } from './room-locomotion';
export type AvatarMotion = {
  walking: Locomotion;
  visible: boolean;
  swing: number;
  eye: number;
  cameraOffset: number;
};
const noRaycast = () => {};
function Block({
  p,
  size,
  color,
}: {
  p: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={p} raycast={noRaycast} userData={{ ignoreRoomRay: true }}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.08}
        roughness={0.9}
        flatShading
      />
    </mesh>
  );
}
// Keep the hand a single Minecraft-style cuboid, continuous with the cuff.
function Hand({ side }: { side: number }) {
  return (
    <group position={[0, 0.035, 0]}>
      <Block p={[0, 0.064, 0]} size={[0.143, 0.145, 0.15]} color="#d1a07b" />
      <Block
        p={[side * 0.067, 0.055, 0]}
        size={[0.01, 0.12, 0.125]}
        color="#bd8968"
      />
    </group>
  );
}
function Sleeve({ side }: { side: number }) {
  return (
    <>
      <Block p={[0, -0.15, 0.026]} size={[0.165, 0.27, 0.18]} color="#47675d" />
      <Block
        p={[side * 0.073, -0.15, 0.02]}
        size={[0.018, 0.22, 0.12]}
        color="#658174"
      />
      <Block
        p={[0, -0.017, 0.014]}
        size={[0.17, 0.062, 0.18]}
        color="#8c9c81"
      />
      <Block
        p={[0, 0.015, 0.008]}
        size={[0.143, 0.014, 0.15]}
        color="#c4c5a8"
      />
    </>
  );
}
export function RoomAvatar({
  motion,
  reducedMotion,
}: {
  motion: RefObject<AvatarMotion>;
  reducedMotion: boolean;
}) {
  const body = useRef<THREE.Group>(null),
    hands = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null),
    rightLeg = useRef<THREE.Group>(null);
  const leftBodyArm = useRef<THREE.Group>(null),
    rightBodyArm = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null),
    rightArm = useRef<THREE.Group>(null);
  const scratch = useMemo(
    () => ({ euler: new THREE.Euler(0, 0, 0, 'YXZ') }),
    [],
  );
  useFrame(({ camera, size }) => {
    const m = motion.current,
      s = m.walking;
    if (
      !body.current ||
      !hands.current ||
      !leftLeg.current ||
      !rightLeg.current ||
      !leftArm.current ||
      !rightArm.current ||
      !leftBodyArm.current ||
      !rightBodyArm.current
    )
      return;
    body.current.visible = m.visible;
    hands.current.visible = m.visible || m.swing > 0;
    scratch.euler.setFromQuaternion(camera.quaternion, 'YXZ');
    body.current.position.set(
      camera.position.x,
      s.height + 0.04,
      camera.position.z,
    );
    body.current.rotation.y = scratch.euler.y;
    body.current.scale.y = m.eye / 2.7;
    const stride = Math.sin(s.phase) * s.gait * 0.34;
    leftLeg.current.rotation.x = 0.12 + stride;
    rightLeg.current.rotation.x = 0.12 - stride;
    hands.current.position.copy(camera.position);
    hands.current.quaternion.copy(camera.quaternion);
    const lookDown = THREE.MathUtils.smoothstep(-scratch.euler.x, 0.45, 1.05);
    const aspect = size.width / Math.max(1, size.height);
    const edge = Math.min(
      0.66,
      Math.tan(
        THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov / 2),
      ) *
        aspect *
        0.86 *
        0.82,
    );
    const swing = Math.sin(
      Math.PI * (1 - m.swing / (reducedMotion ? 0.14 : 0.34)),
    );
    const reach = m.swing > 0 ? Math.max(0, swing) : 0;
    leftArm.current.position.set(
      -edge,
      -0.4 - lookDown * 0.6 + stride * 0.065,
      -0.78 + stride * 0.1,
    );
    rightArm.current.position.set(
      edge - reach * 0.18,
      -0.4 - lookDown * 0.6 - stride * 0.065 + reach * 0.17,
      -0.78 - stride * 0.1 - reach * 0.27,
    );
    leftArm.current.rotation.set(-0.36 + stride * 0.2, -0.38, -0.22);
    leftBodyArm.current.rotation.x = -stride * 0.8;
    rightBodyArm.current.rotation.x = stride * 0.8 + reach * 0.95;
    rightArm.current.rotation.set(
      -0.36 - reach * 0.55 - stride * 0.2,
      0.38 - reach * 0.25,
      0.22 - reach * 0.25,
    );
  }, 0);
  return (
    <>
      <group ref={body} name="player-body" visible={false}>
        {/* The eyes sit above the collar: looking down reveals connected clothing. */}
        <group position={[0, 1.79, 0.23]} rotation={[0.24, 0, 0]}>
          <Block p={[0, 0, 0]} size={[0.72, 0.94, 0.42]} color="#47675d" />
          <Block
            p={[0, -0.31, -0.014]}
            size={[0.67, 0.36, 0.4]}
            color="#425f56"
          />
          <Block
            p={[0, 0, -0.218]}
            size={[0.045, 0.9, 0.016]}
            color="#688477"
          />
          <Block
            p={[-0.19, 0.19, -0.218]}
            size={[0.18, 0.16, 0.02]}
            color="#557569"
          />
          {[-0.31, -0.07, 0.17, 0.36].map((y) => (
            <Block
              key={y}
              p={[0, y, -0.231]}
              size={[0.026, 0.026, 0.015]}
              color="#c5bea0"
            />
          ))}
        </group>
        <Block
          p={[0, 1.19, -0.035]}
          size={[0.65, 0.27, 0.43]}
          color="#365675"
        />
        <Block
          p={[0, 1.327, -0.035]}
          size={[0.016, 0.006, 0.4]}
          color="#29445f"
        />
        {[-1, 1].map((side) => (
          <group key={side}>
            <Block
              p={[side * 0.23, 1.328, -0.075]}
              size={[0.012, 0.007, 0.22]}
              color="#7890a0"
            />
            <Block
              p={[side * 0.19, 1.328, 0.035]}
              size={[0.09, 0.007, 0.012]}
              color="#7890a0"
            />
          </group>
        ))}
        <Block
          p={[0, 1.29, -0.258]}
          size={[0.67, 0.055, 0.018]}
          color="#5b4637"
        />
        <Block p={[0, 1.29, -0.27]} size={[0.1, 0.07, 0.025]} color="#b7aa83" />
        {[-1, 1].map((side) => (
          <group
            key={side}
            ref={side < 0 ? leftBodyArm : rightBodyArm}
            position={[side * 0.46, 2.08, 0.1]}
            rotation={[0, 0, side * 0.06]}
          >
            <Block
              p={[0, -0.22, 0]}
              size={[0.23, 0.49, 0.29]}
              color="#47675d"
            />
            <group position={[0, -0.48, -0.02]} rotation={[0.12, 0, 0]}>
              <Block
                p={[0, -0.19, 0]}
                size={[0.21, 0.39, 0.25]}
                color="#527266"
              />
              <Block
                p={[0, -0.375, 0]}
                size={[0.22, 0.065, 0.26]}
                color="#8c9c81"
              />
              <group
                position={[0, -0.43, 0]}
                rotation={[Math.PI, 0, 0]}
                scale={1.35}
              >
                <Hand side={side} />
              </group>
            </group>
          </group>
        ))}
        {[-1, 1].map((side) => (
          <group
            key={side}
            ref={side < 0 ? leftLeg : rightLeg}
            position={[side * 0.18, 1.08, -0.18]}
          >
            <Block
              p={[0, -0.23, 0]}
              size={[0.29, 0.48, 0.28]}
              color="#365675"
            />
            <Block
              p={[0, -0.67, -0.02]}
              size={[0.28, 0.42, 0.31]}
              color="#436887"
            />
            <Block
              p={[side * 0.125, -0.65, -0.02]}
              size={[0.018, 0.36, 0.2]}
              color="#6d879b"
            />
            <Block
              p={[0, -0.93, -0.12]}
              size={[0.32, 0.2, 0.5]}
              color="#65513c"
            />
            <Block
              p={[0, -1.05, -0.12]}
              size={[0.34, 0.06, 0.52]}
              color="#cebda1"
            />
            <Block
              p={[0, -0.83, -0.19]}
              size={[0.19, 0.025, 0.13]}
              color="#d7cbb4"
            />
          </group>
        ))}
      </group>
      <group ref={hands} name="player-hands" visible={false}>
        {[-1, 1].map((side) => (
          <group key={side} ref={side < 0 ? leftArm : rightArm}>
            <Sleeve side={side} />
            <Hand side={side} />
          </group>
        ))}
      </group>
    </>
  );
}
