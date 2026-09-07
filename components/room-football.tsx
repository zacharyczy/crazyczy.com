'use client';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Dispatch, SetStateAction } from 'react';
import {
  BALL_RADIUS,
  createFormation,
  resolveBall,
  stepBall,
  moveMagnet,
  kickoff,
} from './room-ball-physics';
import type { Magnet, BallState } from './room-ball-physics';

export function FootballField({
  active = false,
  resetId = 0,
}: {
  active?: boolean;
  resetId?: number;
}) {
  const { gl } = useThree();
  const ball = useRef<THREE.Group>(null),
    shadow = useRef<THREE.Mesh>(null),
    field = useRef<THREE.Group>(null);
  const [tokens, setTokens] = useState(createFormation);
  const state = useRef<BallState>({ x: 0.15, z: 0.3, vx: 0.43, vz: 0.27 });
  const goalTime = useRef(0);
  const [goalReward, setGoalReward] = useState(0);
  const goals = useRef(0);
  const drag = useRef<{ id: number; target: Element } | null>(null);
  const visible = useRef(true);
  const scratch = useMemo(
    () => ({
      point: new THREE.Vector3(),
      axis: new THREE.Vector3(),
      rotation: new THREE.Quaternion(),
      plane: new THREE.Plane(
        new THREE.Vector3(0, 1, 0),
        -(1.3195 + 0.52 * (0.124 + BALL_RADIUS)),
      ),
    }),
    [],
  );
  const radius = BALL_RADIUS,
    turfHeight = 0.124;
  useEffect(() => {
    if (!resetId) return;
    const frame = requestAnimationFrame(() => setTokens(createFormation()));
    return () => cancelAnimationFrame(frame);
  }, [resetId]);
  useEffect(() => {
    const release = () => {
      const held = drag.current;
      drag.current = null;
      if (held) {
        try {
          held.target.releasePointerCapture(held.id);
        } catch {
          /* Capture can already be released by the browser. */
        }
      }
    };
    const visibility = () => {
      visible.current = !document.hidden;
      if (document.hidden) release();
    };
    if (!active) release();
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      release();
      window.removeEventListener('blur', release);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [active]);
  const place = (next: typeof state.current) => {
    const previous = state.current,
      dx = next.x - previous.x,
      dz = next.z - previous.z;
    state.current = next;
    if (ball.current) {
      ball.current.position.set(next.x, turfHeight + radius, next.z);
      if (Math.hypot(dx, dz) > 1e-8) {
        scratch.axis.set(dz, 0, -dx).normalize();
        scratch.rotation.setFromAxisAngle(
          scratch.axis,
          Math.hypot(dx, dz) / radius,
        );
        ball.current.quaternion.premultiply(scratch.rotation);
      }
    }
    shadow.current?.position.set(next.x, turfHeight + 0.003, next.z);
  };
  useFrame((_, delta) => {
    if (!visible.current) return;
    if (goalTime.current > 0) {
      goalTime.current -= Math.min(delta, 0.05);
      if (goalTime.current <= 0) {
        place(kickoff(state.current.goal ?? 1));
        setGoalReward(0);
      }
    } else if (!drag.current) {
      const next = stepBall(state.current, tokens, delta);
      place(next);
      if (next.goal) {
        goalTime.current = 1.25;
        goals.current++;
        setGoalReward(goals.current);
      }
    }
    if (process.env.NODE_ENV === 'development')
      Object.assign(gl.domElement.dataset, {
        ball: JSON.stringify({
          ...state.current,
          goals: goals.current,
          dragging: !!drag.current,
          y: turfHeight + radius,
        }),
      });
  });
  const dragBall = (event: ThreeEvent<PointerEvent>) => {
    if (!active || drag.current?.id !== event.pointerId || !field.current)
      return;
    event.stopPropagation();
    if (!event.ray.intersectPlane(scratch.plane, scratch.point)) return;
    field.current.worldToLocal(scratch.point);
    place(
      resolveBall(
        { ...state.current, x: scratch.point.x, z: scratch.point.z },
        tokens,
      ),
    );
  };
  const releaseBall = (event: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return;
    event.stopPropagation();
    const held = drag.current;
    drag.current = null;
    try {
      held.target.releasePointerCapture(held.id);
    } catch {
      /* Browser may release before pointercancel. */
    }
  };

  const stripes = [-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8];
  return (
    <group
      ref={field}
      name="football-field"
      position={[2.43, 1.3195, 0.5]}
      scale={0.52}
    >
      <RoundedBox
        args={[4.98, 0.2, 2.58]}
        radius={0.1}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#193426" roughness={0.72} />
      </RoundedBox>
      {stripes.map((x, index) => (
        <mesh key={x} position={[x, 0.115, 0]} receiveShadow>
          <boxGeometry args={[0.58, 0.018, 2.34]} />
          <meshStandardMaterial
            color={index % 2 ? '#2f7545' : '#3e8650'}
            roughness={0.94}
          />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh
          key={`goal-apron-${side}`}
          position={[side * 2.29, 0.116, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.44, 0.02, 1.18]} />
          <meshStandardMaterial
            color={side > 0 ? '#347a48' : '#397f4b'}
            roughness={0.94}
          />
        </mesh>
      ))}
      {[
        [0, -1.17, 4.15, 0.018],
        [0, 1.17, 4.15, 0.018],
        [-2.07, 0, 0.018, 2.35],
        [2.07, 0, 0.018, 2.35],
      ].map((line, index) => (
        <mesh key={index} position={[line[0], 0.134, line[1]]}>
          <boxGeometry args={[line[2], 0.014, line[3]]} />
          <meshBasicMaterial color="#f7f1df" />
        </mesh>
      ))}
      <mesh position={[0, 0.132, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.32, 0.345, 48]} />
        <meshBasicMaterial color="#f7f1df" />
      </mesh>
      <mesh position={[0, 0.133, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.018, 2.34]} />
        <meshBasicMaterial color="#f7f1df" />
      </mesh>
      <mesh position={[0, 0.136, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.025, 18]} />
        <meshBasicMaterial color="#f7f1df" />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 1.35, 0.138, 0]}>
            <boxGeometry args={[0.018, 0.014, 1.38]} />
            <meshBasicMaterial color="#f7f1df" />
          </mesh>
          {[-0.68, 0.68].map((z) => (
            <mesh key={`penalty-side-${z}`} position={[side * 1.71, 0.138, z]}>
              <boxGeometry args={[0.72, 0.014, 0.018]} />
              <meshBasicMaterial color="#f7f1df" />
            </mesh>
          ))}
          <mesh position={[side * 1.73, 0.139, 0]}>
            <boxGeometry args={[0.018, 0.014, 0.74]} />
            <meshBasicMaterial color="#f7f1df" />
          </mesh>
          {[-0.36, 0.36].map((z) => (
            <mesh key={`goal-area-${z}`} position={[side * 1.9, 0.139, z]}>
              <boxGeometry args={[0.34, 0.014, 0.018]} />
              <meshBasicMaterial color="#f7f1df" />
            </mesh>
          ))}
          <mesh
            position={[side * 1.49, 0.141, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.022, 16]} />
            <meshBasicMaterial color="#f7f1df" />
          </mesh>
          <mesh
            position={[side * 1.49, 0.137, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry
              args={[
                0.29,
                0.305,
                40,
                1,
                side > 0 ? Math.PI / 2 : -Math.PI / 2,
                Math.PI,
              ]}
            />
            <meshBasicMaterial color="#f7f1df" />
          </mesh>
          <group position={[side * 2.08, 0.145, 0]}>
            {[-0.5, 0.5].map((z) => (
              <mesh key={`post-${z}`} position={[0, 0.31, z]} castShadow>
                <cylinderGeometry args={[0.026, 0.026, 0.62, 16]} />
                <meshStandardMaterial color="#f5f2e8" roughness={0.46} />
              </mesh>
            ))}
            <mesh
              position={[0, 0.62, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.026, 0.026, 1.05, 16]} />
              <meshStandardMaterial color="#f5f2e8" roughness={0.46} />
            </mesh>
            {[-0.5, 0.5].map((z) => (
              <mesh
                key={`depth-${z}`}
                position={[side * 0.15, 0.62, z]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.018, 0.018, 0.3, 12]} />
                <meshStandardMaterial color="#e8e4d8" roughness={0.6} />
              </mesh>
            ))}
            <mesh
              position={[side * 0.3, 0.34, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.018, 0.018, 1.02, 12]} />
              <meshStandardMaterial color="#e8e4d8" roughness={0.6} />
            </mesh>
            {[-0.44, -0.22, 0, 0.22, 0.44].map((z) => (
              <mesh key={`net-v-${z}`} position={[side * 0.29, 0.31, z]}>
                <boxGeometry args={[0.009, 0.55, 0.009]} />
                <meshBasicMaterial color="#eeeade" transparent opacity={0.72} />
              </mesh>
            ))}
            {[0.08, 0.2, 0.32, 0.44, 0.56].map((y) => (
              <mesh key={`net-h-${y}`} position={[side * 0.29, y, 0]}>
                <boxGeometry args={[0.009, 0.009, 1]} />
                <meshBasicMaterial color="#eeeade" transparent opacity={0.72} />
              </mesh>
            ))}
            {[-0.5, 0.5].flatMap((z) =>
              [0.1, 0.26, 0.42, 0.58].map((y) => (
                <mesh key={`side-${z}-${y}`} position={[side * 0.15, y, z]}>
                  <boxGeometry args={[0.29, 0.009, 0.009]} />
                  <meshBasicMaterial
                    color="#eeeade"
                    transparent
                    opacity={0.62}
                  />
                </mesh>
              )),
            )}
          </group>
        </group>
      ))}
      {!!goalReward && (
        <Html
          center
          position={[0, 1, 0]}
          zIndexRange={[9, 8]}
          style={{ pointerEvents: 'none' }}
        >
          <output className="room-goal">
            GOAL!<small>★ +1</small>
          </output>
        </Html>
      )}
      <Magnets active={active} tokens={tokens} setTokens={setTokens} />
      <mesh
        ref={shadow}
        position={[0.15, turfHeight + 0.003, 0.3]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[radius * 1.2, 20]} />
        <meshBasicMaterial
          color="#102d18"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
      <group
        name="football"
        onPointerDown={(event) => {
          if (!active) return;
          event.stopPropagation();
          if (drag.current || goalTime.current > 0) return;
          const target = event.target as Element;
          drag.current = { id: event.pointerId, target };
          target.setPointerCapture(event.pointerId);
        }}
        onPointerMove={dragBall}
        onPointerUp={releaseBall}
        onPointerCancel={releaseBall}
        ref={ball}
        position={[0.15, turfHeight + radius, 0.3]}
        scale={0.4}
      >
        {active && (
          <mesh>
            <sphereGeometry args={[0.35, 12, 8]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )}
        <mesh castShadow>
          <sphereGeometry args={[0.15, 20, 14]} />
          <meshPhysicalMaterial
            color="#f4f1e8"
            roughness={0.42}
            clearcoat={0.18}
            clearcoatRoughness={0.55}
          />
        </mesh>
        {[
          [0, 1, 1.618],
          [0, -1, 1.618],
          [0, 1, -1.618],
          [0, -1, -1.618],
          [1, 1.618, 0],
          [-1, 1.618, 0],
          [1, -1.618, 0],
          [-1, -1.618, 0],
          [1.618, 0, 1],
          [-1.618, 0, 1],
          [1.618, 0, -1],
          [-1.618, 0, -1],
        ].map((coordinates, index) => {
          const direction = new THREE.Vector3(
            ...(coordinates as [number, number, number]),
          ).normalize();
          const quaternion = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            direction,
          );
          return (
            <group
              key={index}
              position={direction.clone().multiplyScalar(0.151)}
              quaternion={quaternion}
            >
              <mesh>
                <circleGeometry args={[0.041, 5]} />
                <meshStandardMaterial
                  color="#c9c6bd"
                  roughness={0.7}
                  polygonOffset
                  polygonOffsetFactor={-2}
                />
              </mesh>
              <mesh position={[0, 0, 0.0015]}>
                <circleGeometry args={[0.032, 5]} />
                <meshStandardMaterial
                  color="#171817"
                  roughness={0.58}
                  polygonOffset
                  polygonOffsetFactor={-3}
                />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

function Magnets({
  active,
  tokens,
  setTokens,
}: {
  active: boolean;
  tokens: Magnet[];
  setTokens: Dispatch<SetStateAction<Magnet[]>>;
}) {
  const { gl } = useThree();
  const group = useRef<THREE.Group>(null),
    drag = useRef<{ index: number; id: number } | null>(null);
  useEffect(() => {
    if (process.env.NODE_ENV === 'development')
      Object.assign(gl.domElement.dataset, { tokens: JSON.stringify(tokens) });
  }, [tokens, gl]);
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), -(1.3195 + 0.52 * 0.24)),
    [],
  );
  const textures = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const c = document.createElement('canvas');
        c.width = 64;
        c.height = 64;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = '#fff5d5';
        ctx.font = 'bold 43px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), 32, 34);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.magFilter = THREE.NearestFilter;
        return t;
      }),
    [],
  );
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);
  useEffect(() => {
    if (!active) drag.current = null;
  }, [active]);
  const move = (e: ThreeEvent<PointerEvent>) => {
    if (!active || drag.current?.id !== e.pointerId) return;
    e.stopPropagation();
    const p = e.ray.intersectPlane(plane, new THREE.Vector3());
    if (!p || !group.current) return;
    group.current.worldToLocal(p);
    const index = drag.current.index;
    setTokens((previous) => moveMagnet(previous, index, p));
  };
  return (
    <group ref={group} name="tactics-magnets" userData={{ tokens }}>
      {tokens.map((token, i) => (
        <group
          key={i}
          position={[token.x, 0.159, token.z]}
          name={`magnet-${i}`}
          onPointerDown={(e) => {
            if (!active) return;
            e.stopPropagation();
            drag.current = { index: i, id: e.pointerId };
            (e.target as Element).setPointerCapture(e.pointerId);
          }}
          onPointerMove={move}
          onPointerUp={(e) => {
            e.stopPropagation();
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
        >
          <mesh castShadow>
            <cylinderGeometry args={[0.105, 0.11, 0.07, 16]} />
            <meshStandardMaterial
              color={token.team ? '#496b9b' : '#b6473c'}
              roughness={0.6}
            />
          </mesh>
          <mesh position={[0, 0.039, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.17, 0.17]} />
            <meshBasicMaterial
              map={textures[token.number - 1]}
              transparent
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
