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
      <meshStandardMaterial color={color} roughness={0.9} flatShading />
    </mesh>
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
      !rightArm.current
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
    leftLeg.current.rotation.x = stride;
    rightLeg.current.rotation.x = -stride;
    hands.current.position.copy(camera.position);
    hands.current.quaternion.copy(camera.quaternion);
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
      -0.38 + stride * 0.075,
      -0.78 + stride * 0.1,
    );
    rightArm.current.position.set(
      edge - reach * 0.18,
      -0.38 - stride * 0.075 + reach * 0.2,
      -0.78 - stride * 0.1 - reach * 0.27,
    );
    leftArm.current.rotation.set(-0.28 + stride * 0.2, 0, -0.12);
    rightArm.current.rotation.set(
      -0.28 - reach * 0.65 - stride * 0.2,
      -reach * 0.15,
      0.12 - reach * 0.2,
    );
  }, 0);
  return (
    <>
      <group ref={body} name="player-legs" visible={false}>
        {[-1, 1].map((side) => (
          <group
            key={side}
            ref={side < 0 ? leftLeg : rightLeg}
            position={[side * 0.2, 1.02, -0.3]}
          >
            <Block p={[0, -0.23, 0.17]} size={[0.29, 0.48, 0.28]} color="#384e5a" />
            <Block
              p={[0, -0.67, 0.04]}
              size={[0.28, 0.42, 0.31]}
              color="#435b65"
            />
            <Block
              p={[side * 0.125, -0.65, 0.04]}
              size={[0.018, 0.36, 0.2]}
              color="#607782"
            />
            <Block
              p={[0, -0.87, -0.18]}
              size={[0.32, 0.2, 0.5]}
              color="#65513c"
            />
            <Block
              p={[0, -0.99, -0.18]}
              size={[0.34, 0.06, 0.52]}
              color="#cebda1"
            />
            <Block
              p={[0, -0.78, -0.25]}
              size={[0.19, 0.025, 0.13]}
              color="#d7cbb4"
            />
          </group>
        ))}
      </group>
      <group ref={hands} name="player-hands" visible={false}>
        {[-1, 1].map((side) => (
          <group key={side} ref={side < 0 ? leftArm : rightArm}>
            <Block
              p={[0, -0.16, 0.03]}
              size={[0.16, 0.34, 0.19]}
              color="#4d6c62"
            />
            <Block
              p={[side * 0.073, -0.17, 0.03]}
              size={[0.018, 0.26, 0.14]}
              color="#779085"
            />
            <Block
              p={[0, 0.014, 0.016]}
              size={[0.17, 0.065, 0.2]}
              color="#bcc3a7"
            />
            <Block
              p={[0, 0.104, -0.012]}
              size={[0.15, 0.14, 0.17]}
              color="#c89470"
            />
            <Block
              p={[-side * 0.087, 0.067, -0.005]}
              size={[0.04, 0.075, 0.095]}
              color="#b77c59"
            />
            <Block
              p={[0, 0.177, -0.025]}
              size={[0.125, 0.013, 0.13]}
              color="#dfae86"
            />
          </group>
        ))}
      </group>
    </>
  );
}
