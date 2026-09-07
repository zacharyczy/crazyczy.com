'use client';
import { useEffect, useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { usePixelMaterials } from './room-materials';

type Point = [number, number, number];
export function RoomShell() {
  const maps = usePixelMaterials();
  const floorTexture = useMemo(() => {
    const map = maps.oak.clone();
    map.center.set(0.5, 0.5);
    map.rotation = Math.PI / 2;
    return map;
  }, [maps.oak]);
  useEffect(() => () => floorTexture.dispose(), [floorTexture]);
  const panels = [
    { position: [0, 3.24, -6.5] as Point, size: [13, 6.48, 0.2] as Point },
    { position: [-6.5, 3.24, 0.1] as Point, size: [0.2, 6.48, 13.2] as Point },
    // The right wall has a genuine floor-to-ceiling window opening.
    { position: [6.5, 3.24, -5.38] as Point, size: [0.2, 6.48, 2.24] as Point },
    { position: [6.5, 3.24, 4.88] as Point, size: [0.2, 6.48, 3.64] as Point },
    { position: [6.5, 6.12, -0.6] as Point, size: [0.2, 0.72, 7.32] as Point },
    // A full-height wooden door sits behind and to the right of the sofa.
    {
      position: [-1.875, 3.24, 6.7] as Point,
      size: [9.25, 6.48, 0.2] as Point,
    },
    { position: [5.675, 3.24, 6.7] as Point, size: [1.65, 6.48, 0.2] as Point },
    { position: [3.8, 5.34, 6.7] as Point, size: [2.1, 2.28, 0.2] as Point },
  ];
  return (
    <group
      onPointerOver={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <mesh position={[0, -0.1, 0.1]} receiveShadow>
        <boxGeometry args={[13.2, 0.2, 13.4]} />
        <meshStandardMaterial color="#30251e" />
      </mesh>
      {Array.from({ length: 12 }, (_, row) =>
        Array.from({ length: 6 }, (_, column) => {
          const x = -5.4 + column * 2.16;
          const z = -5.96 + row * 1.1;
          return (
            <mesh
              key={`${row}-${column}`}
              position={[x, 0.01, z]}
              receiveShadow
            >
              <boxGeometry args={[2.145, 0.035, 1.085]} />
              <meshStandardMaterial
                map={floorTexture}
                color={
                  ['#dbbb8d', '#f1d4a6', '#d7b68b', '#e8c396'][
                    (column + row * 3) % 4
                  ]
                }
                roughness={0.82}
              />
            </mesh>
          );
        }),
      )}
      {panels.map((panel, i) => (
        <mesh key={i} position={panel.position} receiveShadow>
          <boxGeometry args={panel.size} />
          <meshStandardMaterial
            map={maps.plaster}
            color="#f0e9dc"
            roughness={0.96}
          />
        </mesh>
      ))}
      <mesh position={[0, 6.5, 0.1]} receiveShadow>
        <boxGeometry args={[13.2, 0.2, 13.4]} />
        <meshStandardMaterial
          map={maps.plaster}
          color="#f2e7d0"
          roughness={1}
        />
      </mesh>
      <group position={[0, 0.75, -6.35]}>
        <mesh receiveShadow>
          <boxGeometry args={[12.8, 1.5, 0.08]} />
          <meshStandardMaterial
            map={maps.walnut}
            color="#bfb4a2"
            roughness={0.8}
          />
        </mesh>
        {[-0.69, 0.71].map((y) => (
          <mesh key={y} position={[0, y, 0.065]}>
            <boxGeometry args={[12.9, 0.055, 0.075]} />
            <meshStandardMaterial map={maps.oak} color="#ccaa7c" />
          </mesh>
        ))}
        {Array.from({ length: 13 }, (_, i) => (
          <mesh key={i} position={[-6 + i, 0, 0.055]}>
            <boxGeometry args={[0.045, 1.4, 0.04]} />
            <meshStandardMaterial map={maps.walnut} color="#c2ac85" />
          </mesh>
        ))}
      </group>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 6.34, 0.16, 0.1]}>
          <mesh>
            <boxGeometry args={[0.1, 0.28, 13.15]} />
            <meshStandardMaterial map={maps.walnut} roughness={0.7} />
          </mesh>
          <mesh position={[0, 6.08, 0]}>
            <boxGeometry args={[0.15, 0.16, 13.15]} />
            <meshStandardMaterial map={maps.oak} color="#c5a77a" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 6.23, -6.32]}>
        <boxGeometry args={[12.8, 0.18, 0.18]} />
        <meshStandardMaterial map={maps.oak} color="#c5a77a" />
      </mesh>
      <mesh position={[0, 6.23, 6.5]}>
        <boxGeometry args={[12.8, 0.18, 0.18]} />
        <meshStandardMaterial map={maps.oak} color="#c5a77a" />
      </mesh>
      <group name="rug" position={[0, 0.065, 1.1]} scale={[1, 1, 6.3 / 5.35]}>
        <mesh receiveShadow>
          <boxGeometry args={[7.4, 0.04, 5.35]} />
          <meshStandardMaterial
            map={maps.cloth}
            color="#8b4538"
            roughness={1}
          />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh position={[side * 3.44, 0.026, 0]}>
              <boxGeometry args={[0.15, 0.016, 4.92]} />
              <meshStandardMaterial map={maps.cloth} color="#dfc18b" />
            </mesh>
            <mesh position={[0, 0.026, side * 2.42]}>
              <boxGeometry args={[7.02, 0.016, 0.14]} />
              <meshStandardMaterial map={maps.cloth} color="#dfc18b" />
            </mesh>
            {Array.from({ length: 36 }, (_, i) => (
              <mesh key={i} position={[-3.4 + i * 0.194, -0.005, side * 2.77]}>
                <boxGeometry args={[0.025, 0.02, 0.2]} />
                <meshStandardMaterial color="#b9a98b" />
              </mesh>
            ))}
          </group>
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh
            key={i}
            position={[-2.7 + (i % 4) * 1.8, 0.032, i < 4 ? -1.8 : 1.8]}
            rotation={[0, Math.PI / 4, 0]}
          >
            <boxGeometry args={[0.18, 0.02, 0.18]} />
            <meshStandardMaterial color="#b89d68" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function WoodenDoor() {
  const maps = usePixelMaterials();
  return (
    <group position={[3.8, 0, 6.56]} rotation={[0, Math.PI, 0]}>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1, 2.09, 0.08]} castShadow>
          <boxGeometry args={[0.16, 4.18, 0.22]} />
          <meshStandardMaterial map={maps.walnut} roughness={0.68} />
        </mesh>
      ))}
      <mesh position={[0, 4.14, 0.08]} castShadow>
        <boxGeometry args={[2.16, 0.18, 0.22]} />
        <meshStandardMaterial map={maps.walnut} />
      </mesh>
      <mesh position={[0, 2.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.84, 4.03, 0.14]} />
        <meshStandardMaterial
          map={maps.walnut}
          color="#e2bd88"
          roughness={0.7}
        />
      </mesh>
      {[0.91, 2.96].map((y) => (
        <group key={y} position={[0, y, 0.08]}>
          <mesh>
            <boxGeometry args={[1.45, 1.58, 0.025]} />
            <meshStandardMaterial
              map={maps.oak}
              color="#a88865"
              roughness={0.8}
            />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side}>
              <mesh position={[side * 0.73, 0, 0.025]}>
                <boxGeometry args={[0.055, 1.64, 0.05]} />
                <meshStandardMaterial map={maps.walnut} color="#e1be8f" />
              </mesh>
              <mesh position={[0, side * 0.79, 0.025]}>
                <boxGeometry args={[1.49, 0.055, 0.05]} />
                <meshStandardMaterial map={maps.walnut} color="#e1be8f" />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      <mesh position={[0.67, 1.99, 0.14]}>
        <boxGeometry args={[0.13, 0.35, 0.045]} />
        <meshStandardMaterial
          color="#b79751"
          metalness={0.75}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0.57, 2.07, 0.23]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.29, 12]} />
        <meshStandardMaterial
          color="#d7b568"
          metalness={0.72}
          roughness={0.27}
        />
      </mesh>
      {[0.55, 2, 3.45].map((y) => (
        <mesh key={y} position={[-0.88, y, 0.11]}>
          <cylinderGeometry args={[0.035, 0.035, 0.18, 10]} />
          <meshStandardMaterial
            color="#9d7c46"
            metalness={0.7}
            roughness={0.4}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.04, 0.09]}>
        <boxGeometry args={[1.88, 0.06, 0.32]} />
        <meshStandardMaterial map={maps.oak} />
      </mesh>
    </group>
  );
}

export function ReadingSofa() {
  const maps = usePixelMaterials();
  return (
    <group name="sofa" position={[0.35, 0, 4.72]} rotation={[0, Math.PI, 0]}>
      {[-1.4, 1.4].flatMap((x) =>
        [-0.7, 0.7].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.2, z]} castShadow>
            <boxGeometry args={[0.15, 0.38, 0.15]} />
            <meshStandardMaterial map={maps.walnut} />
          </mesh>
        )),
      )}
      <RoundedBox
        args={[3.55, 0.38, 1.94]}
        radius={0.09}
        smoothness={1}
        position={[0, 0.45, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={maps.cloth}
          color="#804833"
          roughness={0.98}
        />
      </RoundedBox>
      {[-0.82, 0.82].map((x) => (
        <group key={x}>
          <RoundedBox
            args={[1.55, 0.35, 1.52]}
            radius={0.12}
            smoothness={1}
            position={[x, 0.78, 0.12]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              map={maps.cloth}
              color="#c27b50"
              roughness={1}
            />
          </RoundedBox>
          <RoundedBox
            args={[1.56, 1.23, 0.39]}
            radius={0.13}
            smoothness={1}
            position={[x, 1.27, -0.69]}
            rotation={[-0.12, 0, 0]}
            castShadow
          >
            <meshStandardMaterial
              map={maps.cloth}
              color="#b26b47"
              roughness={1}
            />
          </RoundedBox>
          <mesh position={[x, 0.75, 0.89]}>
            <boxGeometry args={[1.38, 0.024, 0.019]} />
            <meshStandardMaterial color="#d5ab77" />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[0.26, 0.74, 1.85]}
          radius={0.075}
          smoothness={1}
          position={[side * 1.73, 0.92, -0.01]}
          castShadow
        >
          <meshStandardMaterial
            map={maps.cloth}
            color="#a36142"
            roughness={1}
          />
        </RoundedBox>
      ))}
      <RoundedBox
        args={[0.72, 0.7, 0.22]}
        radius={0.09}
        smoothness={1}
        position={[-1.1, 1.2, -0.21]}
        rotation={[-0.22, 0.12, -0.24]}
        castShadow
      >
        <meshStandardMaterial map={maps.cloth} color="#466c64" roughness={1} />
      </RoundedBox>
      <group position={[1.05, 1.0, 0.25]}>
        <mesh rotation={[-0.12, 0, 0.08]}>
          <boxGeometry args={[0.66, 0.055, 1.14]} />
          <meshStandardMaterial map={maps.cloth} color="#cfb781" />
        </mesh>
        {[-0.24, -0.12, 0, 0.12, 0.24].map((x) => (
          <mesh key={x} position={[x, -0.03, 0.67]} rotation={[-0.8, 0, 0]}>
            <boxGeometry args={[0.025, 0.022, 0.26]} />
            <meshStandardMaterial color="#cfb781" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function BrushDesk() {
  const maps = usePixelMaterials();
  const profile = useMemo(
    () => [
      new THREE.Vector2(0.002, 0),
      new THREE.Vector2(0.016, 0.035),
      new THREE.Vector2(0.032, 0.105),
      new THREE.Vector2(0.03, 0.17),
      new THREE.Vector2(0.025, 0.19),
    ],
    [],
  );
  return (
    <group position={[-2.85, 1.32, 0.35]} rotation={[0, 0.1, 0]}>
      <group position={[-0.96, 0.06, 0.3]}>
        <RoundedBox
          args={[0.43, 0.12, 0.58]}
          radius={0.045}
          smoothness={2}
          castShadow
        >
          <meshStandardMaterial color="#383832" roughness={0.55} />
        </RoundedBox>
        <mesh position={[0, 0.065, 0.045]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.158, 24]} />
          <meshStandardMaterial
            color="#111916"
            roughness={0.12}
            metalness={0.15}
          />
        </mesh>
        <mesh position={[0, 0.1, -0.19]} rotation={[0, 0.08, 0]}>
          <boxGeometry args={[0.11, 0.09, 0.28]} />
          <meshStandardMaterial color="#262a24" roughness={0.4} />
        </mesh>
      </group>
      <group position={[-0.16, 0, -0.65]}>
        {[-0.63, 0.63].map((x) => (
          <group key={x}>
            <RoundedBox
              args={[0.24, 0.06, 0.42]}
              radius={0.02}
              smoothness={1}
              position={[x, 0.02, 0]}
              castShadow
            >
              <meshStandardMaterial map={maps.walnut} />
            </RoundedBox>
            <mesh position={[x, 0.52, 0]} castShadow>
              <boxGeometry args={[0.08, 1.0, 0.09]} />
              <meshStandardMaterial map={maps.walnut} />
            </mesh>
            <mesh position={[x, 1.08, 0]}>
              <boxGeometry args={[0.15, 0.06, 0.15]} />
              <meshStandardMaterial map={maps.oak} />
            </mesh>
          </group>
        ))}
        <RoundedBox
          args={[1.54, 0.1, 0.12]}
          radius={0.025}
          smoothness={1}
          position={[0, 1.01, 0]}
          castShadow
        >
          <meshStandardMaterial map={maps.walnut} />
        </RoundedBox>
        {[-0.38, 0, 0.38].map((x, index) => (
          <group key={x} position={[x, 0.11 + index * 0.035, 0.015]}>
            <mesh position={[0, 0.805 - index * 0.035, 0]}>
              <torusGeometry args={[0.04, 0.009, 6, 12]} />
              <meshStandardMaterial
                color="#967846"
                metalness={0.55}
                roughness={0.4}
              />
            </mesh>
            <mesh position={[0, 0.52, 0]} castShadow>
              <cylinderGeometry args={[0.025, 0.028, 0.53, 12]} />
              <meshStandardMaterial
                map={maps.oak}
                color={index === 1 ? '#e2bd74' : '#b99767'}
                roughness={0.55}
              />
            </mesh>
            {[0.29, 0.73].map((y) => (
              <mesh key={y} position={[0, y, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.038, 12]} />
                <meshStandardMaterial color="#514230" roughness={0.5} />
              </mesh>
            ))}
            <mesh position={[0, 0.08, 0]} castShadow>
              <latheGeometry args={[profile, 12]} />
              <meshStandardMaterial
                color={index === 1 ? '#a49470' : '#302b25'}
                roughness={0.98}
              />
            </mesh>
            {[-0.015, 0, 0.015].map((dx) => (
              <mesh
                key={dx}
                position={[dx, 0.16, 0.026]}
                rotation={[0, 0, dx * 6]}
              >
                <boxGeometry args={[0.003, 0.1, 0.003]} />
                <meshStandardMaterial color="#181d16" />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      <group position={[1.14, 0.12, -0.22]}>
        <mesh castShadow>
          <boxGeometry args={[0.2, 0.22, 0.2]} />
          <meshStandardMaterial map={maps.walnut} color="#6e3629" />
        </mesh>
        <mesh position={[0, 0.13, 0]}>
          <boxGeometry args={[0.14, 0.05, 0.14]} />
          <meshStandardMaterial color="#987458" />
        </mesh>
      </group>
    </group>
  );
}

export function DetailedCube({
  position,
  rotation = 0,
  size = 0.54,
  order = 3,
}: {
  position: Point;
  rotation?: number;
  size?: number;
  order?: 3 | 4;
}) {
  const faces: { rotation: Point; color: string }[] = [
    { rotation: [0, 0, 0], color: '#cf493d' },
    { rotation: [0, Math.PI, 0], color: '#e6a33c' },
    { rotation: [0, Math.PI / 2, 0], color: '#407259' },
    { rotation: [0, -Math.PI / 2, 0], color: '#3a6caa' },
    { rotation: [-Math.PI / 2, 0, 0], color: '#eac956' },
    { rotation: [Math.PI / 2, 0, 0], color: '#ece6d3' },
  ];
  const step = size / order;
  const indices = Array.from({ length: order }, (_, i) => i - (order - 1) / 2);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {indices.flatMap((x) =>
        indices.flatMap((y) =>
          indices.map((z) => (
            <RoundedBox
              key={`${x}-${y}-${z}`}
              position={[x * step, y * step, z * step]}
              args={[step * 0.965, step * 0.965, step * 0.965]}
              radius={size * 0.02}
              smoothness={1}
              castShadow
            >
              <meshStandardMaterial color="#171d1a" roughness={0.4} />
            </RoundedBox>
          )),
        ),
      )}
      {faces.map((face, faceIndex) => (
        <group key={faceIndex} rotation={face.rotation}>
          {indices.flatMap((x) =>
            indices.map((y) => (
              <RoundedBox
                key={`${x}-${y}`}
                position={[x * step, y * step, size / 2 + 0.004]}
                args={[step * 0.8, step * 0.8, 0.009]}
                radius={0.006}
                smoothness={1}
              >
                <meshStandardMaterial
                  color={face.color}
                  metalness={0.02}
                  roughness={0.46}
                />
              </RoundedBox>
            )),
          )}
        </group>
      ))}
    </group>
  );
}

export function DetailedPyramid({
  position,
  scale = 1,
}: {
  position: Point;
  scale?: number;
}) {
  const tiles = useMemo(() => {
    const v = [
      new THREE.Vector3(0, 0.36, 0),
      new THREE.Vector3(-0.3, -0.18, 0.2),
      new THREE.Vector3(0.3, -0.18, 0.2),
      new THREE.Vector3(0, -0.18, -0.32),
    ];
    return [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 1],
      [1, 3, 2],
    ].flatMap((face, side) => {
      const [a, b, c] = face.map((i) => v[i]);
      const normal = new THREE.Vector3()
        .crossVectors(b.clone().sub(a), c.clone().sub(a))
        .normalize();
      if (normal.dot(a.clone().add(b).add(c)) < 0) normal.negate();
      const at = (i: number, j: number) =>
        a
          .clone()
          .addScaledVector(b.clone().sub(a), i / 3)
          .addScaledVector(c.clone().sub(a), j / 3);
      const result: {
        vertices: Float32Array;
        normal: Float32Array;
        color: string;
      }[] = [];
      const add = (points: THREE.Vector3[]) => {
        const center = points
          .reduce((sum, point) => sum.add(point), new THREE.Vector3())
          .multiplyScalar(1 / 3);
        result.push({
          vertices: new Float32Array(
            points.flatMap((point) =>
              point
                .sub(center)
                .multiplyScalar(0.88)
                .add(center)
                .addScaledVector(normal, 0.006)
                .toArray(),
            ),
          ),
          normal: new Float32Array([
            ...normal.toArray(),
            ...normal.toArray(),
            ...normal.toArray(),
          ]),
          color: ['#d9b646', '#408062', '#cd4c3c', '#427aaa'][side],
        });
      };
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3 - i; j++) {
          add([at(i, j), at(i + 1, j), at(i, j + 1)]);
          if (i + j < 2) add([at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)]);
        }
      return result;
    });
  }, []);
  return (
    <group position={position} scale={scale} rotation={[0, -0.28, 0]}>
      {tiles.map((tile, index) => (
        <mesh key={index} castShadow>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[tile.vertices, 3]}
            />
            <bufferAttribute
              attach="attributes-normal"
              args={[tile.normal, 3]}
            />
          </bufferGeometry>
          <meshStandardMaterial
            color={tile.color}
            side={THREE.DoubleSide}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
