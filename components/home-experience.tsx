'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Html, OrbitControls, RoundedBox, useTexture } from '@react-three/drei';
import { Globe2 } from 'lucide-react';
import type { StaticImageData } from 'next/image';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Language } from '@/lib/content';
import messiPhoto from '@/pic/梅西-pixel.png';
import jayPhoto from '@/pic/Jay-pixel.png';
import friendsPhoto from '@/pic/老友记五人-pixel.png';
import tagorePhoto from '@/pic/tagore-stray-birds-pixel.png';
import gardenBackdrop from '@/pic/jiangnan-garden-pixel.png';

const WORDS = {
  en: {
    intro: ['Hey, I am Zachary Cheng', 'Welcome to crazyczy.com'],
    click: 'Click anywhere to lift your eyes',
    explore: 'Drag to look · right-drag to move · scroll or pinch to zoom',
    enter: 'Press Enter to continue',
  },
  zh: {
    intro: ['嗨，我是 Zachary Cheng', '欢迎来到 crazyczy.com'],
    click: '点击任意位置，抬头看看',
    explore: '拖动视角 · 右键拖动移动 · 滚轮或双指缩放',
    enter: '按回车继续',
  },
};

function useTypewriter(lines: string[]) {
  const [out, setOut] = useState(['', '']);
  const [activeLine, setActiveLine] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let row = 0;
    let char = 0;
    let timer: ReturnType<typeof setTimeout>;
    const type = () => {
      if (cancelled) return;
      if (char < lines[row].length) {
        char += 1;
        setOut((previous) => previous.map((value, index) => index === row ? lines[row].slice(0, char) : value));
        timer = setTimeout(type, 68 + Math.random() * 58);
      } else if (row === 0) {
        timer = setTimeout(() => {
          row = 1;
          char = 0;
          setActiveLine(1);
          type();
        }, 900);
      } else {
        setDone(true);
      }
    };
    timer = setTimeout(type, 560);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [lines]);

  return { out, activeLine, done };
}

function FootballField() {
  const ball = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector2(.013, .009));

  useFrame((_, delta) => {
    if (!ball.current) return;
    ball.current.position.x += velocity.current.x * delta * 21;
    ball.current.position.z += velocity.current.y * delta * 21;
    if (Math.abs(ball.current.position.x) > 1.78) velocity.current.x *= -1;
    if (Math.abs(ball.current.position.z) > .91) velocity.current.y *= -1;
    ball.current.rotation.x += delta * 2.2;
    ball.current.rotation.z += delta * 1.8;
    if (Math.random() < .003) velocity.current.rotateAround(new THREE.Vector2(), (Math.random() - .5) * .55);
  });

  const stripes = [-1.8, -1.2, -.6, 0, .6, 1.2, 1.8];
  return (
    <group position={[.35, 1.31, .22]}>
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
          <group position={[side * 1.69, .138, 0]}>
            <mesh position={[-side * .19, 0, -.48]}><boxGeometry args={[.38, .014, .018]} /><meshBasicMaterial color="#f7f1df" /></mesh>
            <mesh position={[-side * .19, 0, .48]}><boxGeometry args={[.38, .014, .018]} /><meshBasicMaterial color="#f7f1df" /></mesh>
            <mesh position={[-side * .38, 0, 0]}><boxGeometry args={[.018, .014, .98]} /><meshBasicMaterial color="#f7f1df" /></mesh>
          </group>
          <mesh position={[side * 1.63, .133, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[.24, .255, 32, 1, side > 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI]} />
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
      <group ref={ball} position={[.15, .32, .1]}>
        <mesh castShadow><sphereGeometry args={[.15, 48, 32]} /><meshPhysicalMaterial color="#f4f1e8" roughness={.42} clearcoat={.18} clearcoatRoughness={.55} /></mesh>
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

function ScholarSet() {
  return (
    <group position={[-3.05, 1.3, .2]} rotation={[0, .12, 0]}>
      {[0, 1, 2].map((page) => (
        <mesh key={page} position={[.35 + page * .018, .018 + page * .009, page * -.02]} rotation={[0, -.08 + page * .015, 0]} castShadow>
          <boxGeometry args={[1.48, .018, .92]} />
          <meshStandardMaterial color={page === 2 ? '#eee3c7' : '#d7c7a4'} roughness={.96} />
        </mesh>
      ))}
      {[-.24, -.1, .04].map((x) => <mesh key={x} position={[x + .42, .055, .12]}><boxGeometry args={[.022, .012, .56]} /><meshStandardMaterial color="#b9a886" /></mesh>)}

      <group position={[-.58, .07, -.18]}>
        <mesh castShadow><boxGeometry args={[.62, .13, .46]} /><meshStandardMaterial color="#242321" roughness={.55} /></mesh>
        <mesh position={[0, .072, 0]}><boxGeometry args={[.43, .018, .28]} /><meshStandardMaterial color="#080909" roughness={.18} /></mesh>
        <mesh position={[-.23, .12, -.16]}><boxGeometry args={[.13, .08, .1]} /><meshStandardMaterial color="#393530" roughness={.72} /></mesh>
      </group>

      <group position={[-.12, .1, .3]}>
        {[-.18, 0, .18].map((x, index) => <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, index % 2 ? 0 : .12]}><boxGeometry args={[.12, .17, .16]} /><meshStandardMaterial color={index === 1 ? '#7f684c' : '#9b7b55'} roughness={.8} /></mesh>)}
      </group>
      {[
        { z: .22, color: '#9c512f', angle: -.18 },
        { z: -.04, color: '#aa7a39', angle: .1 },
      ].map((brush) => (
        <group key={brush.z} position={[.05, .14, brush.z]} rotation={[0, brush.angle, 0]}>
          <mesh position={[0, .035, -.12]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.019, .019, .88, 16]} /><meshStandardMaterial color={brush.color} roughness={.42} /></mesh>
          <mesh position={[0, .035, -.585]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.032, .027, .1, 16]} /><meshStandardMaterial color="#c7a45b" metalness={.62} roughness={.28} /></mesh>
          <mesh position={[0, .035, -.74]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[.046, .23, 12]} /><meshStandardMaterial color="#211a16" roughness={.92} /></mesh>
          <mesh position={[0, .035, .34]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.025, .019, .045, 12]} /><meshStandardMaterial color="#d3b66f" metalness={.48} roughness={.3} /></mesh>
        </group>
      ))}
      <group position={[-.98, .12, .32]}>
        <mesh><boxGeometry args={[.22, .22, .22]} /><meshStandardMaterial color="#76563b" roughness={.86} /></mesh>
        <mesh position={[0, .13, 0]}><boxGeometry args={[.15, .05, .15]} /><meshStandardMaterial color="#987354" roughness={.8} /></mesh>
      </group>
    </group>
  );
}

function VoxelPuzzle({ position, rotation = 0, size = .54 }: { position: [number, number, number]; rotation?: number; size?: number }) {
  const cells = [-1, 0, 1];
  const sticker = size / 3.7;
  return (
    <group position={position} rotation={[.06, rotation, -.04]}>
      <mesh castShadow><boxGeometry args={[size, size, size]} /><meshStandardMaterial color="#171a18" roughness={.5} /></mesh>
      {cells.flatMap((a) => cells.map((b) => (
        <group key={`${a}-${b}`}>
          <mesh position={[a * size / 3.25, size / 2 + .006, b * size / 3.25]}><boxGeometry args={[sticker, .012, sticker]} /><meshStandardMaterial color={['#f0cc43', '#e46737', '#f4efe0'][(a + b + 6) % 3]} roughness={.48} /></mesh>
          <mesh position={[a * size / 3.25, b * size / 3.25, size / 2 + .006]}><boxGeometry args={[sticker, sticker, .012]} /><meshStandardMaterial color={['#2d7b55', '#d64a3f', '#396fa0'][(a - b + 6) % 3]} roughness={.48} /></mesh>
          <mesh position={[size / 2 + .006, a * size / 3.25, b * size / 3.25]}><boxGeometry args={[.012, sticker, sticker]} /><meshStandardMaterial color={['#ede9dc', '#d94b3d', '#2d6ea0'][(a + b + 6) % 3]} roughness={.48} /></mesh>
        </group>
      )))}
    </group>
  );
}

function PyramidPuzzle({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[.08, -.28, -.05]}>
      <mesh castShadow><tetrahedronGeometry args={[.4, 0]} /><meshStandardMaterial color="#171a18" roughness={.56} /></mesh>
      {[
        [0, .2, .22, '#e6c63e'],
        [-.18, -.08, .1, '#d94d39'],
        [.18, -.08, .1, '#327b58'],
        [0, -.08, -.18, '#376ca0'],
      ].map((piece, index) => <mesh key={index} position={[piece[0] as number, piece[1] as number, piece[2] as number]} scale={.46}><tetrahedronGeometry args={[.38, 0]} /><meshStandardMaterial color={piece[3] as string} roughness={.48} /></mesh>)}
    </group>
  );
}

function MirrorPuzzle({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[.06, .24, -.04]}>
      <mesh castShadow><boxGeometry args={[.54, .54, .54]} /><meshStandardMaterial color="#b9bdba" metalness={.88} roughness={.2} /></mesh>
      {[-.13, .07].map((x) => <mesh key={`front-v-${x}`} position={[x, 0, .276]}><boxGeometry args={[.018, .52, .012]} /><meshStandardMaterial color="#282c2a" metalness={.45} /></mesh>)}
      {[-.1, .12].map((y) => <mesh key={`front-h-${y}`} position={[0, y, .276]}><boxGeometry args={[.52, .018, .012]} /><meshStandardMaterial color="#282c2a" metalness={.45} /></mesh>)}
      {[-.13, .07].map((x) => <mesh key={`top-v-${x}`} position={[x, .276, 0]}><boxGeometry args={[.018, .012, .52]} /><meshStandardMaterial color="#303432" metalness={.45} /></mesh>)}
      {[-.11, .1].map((z) => <mesh key={`top-h-${z}`} position={[0, .276, z]}><boxGeometry args={[.52, .012, .018]} /><meshStandardMaterial color="#303432" metalness={.45} /></mesh>)}
      {[-.1, .12].map((y) => <mesh key={`side-h-${y}`} position={[.276, y, 0]}><boxGeometry args={[.012, .018, .52]} /><meshStandardMaterial color="#252927" metalness={.45} /></mesh>)}
      {[-.12, .08].map((z) => <mesh key={`side-v-${z}`} position={[.276, 0, z]}><boxGeometry args={[.012, .52, .018]} /><meshStandardMaterial color="#252927" metalness={.45} /></mesh>)}
    </group>
  );
}

function CabinetAndLamp() {
  return (
    <group>
      <group position={[-4.25, .88, -5.86]}>
        <mesh castShadow><boxGeometry args={[2.72, 1.62, .78]} /><meshStandardMaterial color="#5f3c29" roughness={.7} /></mesh>
        <mesh position={[0, .06, .405]}><boxGeometry args={[2.5, 1.38, .035]} /><meshStandardMaterial color="#734a32" roughness={.62} /></mesh>
        <mesh position={[0, .06, .43]}><boxGeometry args={[.045, 1.34, .025]} /><meshStandardMaterial color="#35251d" /></mesh>
        <mesh position={[0, .56, .445]}><boxGeometry args={[2.44, .035, .025]} /><meshStandardMaterial color="#35251d" /></mesh>
        {[-.62, .62].map((x) => <mesh key={x} position={[x, .08, .458]}><boxGeometry args={[.1, .1, .045]} /><meshStandardMaterial color="#c69a4d" metalness={.66} roughness={.3} /></mesh>)}

        <VoxelPuzzle position={[-.68, 1.14, .02]} rotation={-.32} size={.5} />
        <PyramidPuzzle position={[0, 1.18, .02]} />
        <MirrorPuzzle position={[.68, 1.14, .03]} />

        {[-1.08, 1.08].map((x, index) => (
          <group key={x} position={[x, 1.05, .02]}>
            <mesh position={[0, .08, 0]}><boxGeometry args={[.38, .16, .34]} /><meshStandardMaterial color="#79542c" metalness={.45} roughness={.35} /></mesh>
            <mesh position={[0, .28, 0]}><boxGeometry args={[.14, .25, .14]} /><meshStandardMaterial color="#d1a64d" metalness={.72} roughness={.24} /></mesh>
            {[-.14, .14].map((side) => <mesh key={side} position={[side, .48, 0]}><boxGeometry args={[.16, .3, .16]} /><meshStandardMaterial color={index ? '#d4ad58' : '#ba8533'} metalness={.76} roughness={.22} /></mesh>)}
            <mesh position={[0, .61, 0]}><boxGeometry args={[.42, .12, .2]} /><meshStandardMaterial color={index ? '#d4ad58' : '#ba8533'} metalness={.76} roughness={.22} /></mesh>
          </group>
        ))}
      </group>
      <group position={[-2.24, 0, -5.78]}>
        <mesh position={[0, .05, 0]}><boxGeometry args={[.78, .1, .58]} /><meshStandardMaterial color="#292723" metalness={.25} roughness={.55} /></mesh>
        <mesh position={[0, 1.48, 0]}><boxGeometry args={[.075, 2.86, .075]} /><meshStandardMaterial color="#302c27" metalness={.42} roughness={.42} /></mesh>
        {[0, 1, 2].map((step) => <mesh key={step} position={[0, 2.48 + step * .17, 0]}><boxGeometry args={[1.02 - step * .2, .2, .72 - step * .12]} /><meshStandardMaterial color="#e8bd6e" emissive="#bd682c" emissiveIntensity={.38} roughness={.76} /></mesh>)}
        <pointLight position={[0, 2.45, .22]} intensity={28} distance={7} color="#ffb65f" />
      </group>
    </group>
  );
}

type PhotoFormat = 'square' | 'hero' | 'landscape';

function WallPhoto({ position, rotation = 0, src, format = 'square' }: { position: [number, number, number]; rotation?: number; src: StaticImageData; format?: PhotoFormat }) {
  const dimensions: Record<PhotoFormat, [number, number]> = {
    square: [1.46, 1.46],
    hero: [2.48, 1.5],
    landscape: [2.12, 1.28],
  };
  const [width, height] = dimensions[format];
  const sourceTexture = useTexture(src.src);
  const texture = useMemo(() => {
    const nextTexture = sourceTexture.clone();
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.magFilter = THREE.NearestFilter;
    nextTexture.minFilter = THREE.LinearMipmapLinearFilter;
    nextTexture.anisotropy = 8;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [sourceTexture]);
  return (
    <group position={position} rotation={[0, 0, rotation]}>
      <mesh castShadow><boxGeometry args={[width + .24, height + .24, .14]} /><meshStandardMaterial color="#2b2018" roughness={.56} /></mesh>
      <mesh position={[0, 0, .084]}><boxGeometry args={[width + .1, height + .1, .045]} /><meshStandardMaterial color="#d4c29e" roughness={.88} /></mesh>
      {[
        [-width / 2 - .07, height / 2 + .07],
        [width / 2 + .07, height / 2 + .07],
        [-width / 2 - .07, -height / 2 - .07],
        [width / 2 + .07, -height / 2 - .07],
      ].map((corner, index) => <mesh key={index} position={[corner[0], corner[1], .13]}><boxGeometry args={[.07, .07, .035]} /><meshStandardMaterial color="#a37b38" metalness={.64} roughness={.34} /></mesh>)}
      <mesh position={[0, 0, .118]}><planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
    </group>
  );
}

function RainWindow() {
  const gardenTextureSource = useTexture(gardenBackdrop.src);
  const gardenTexture = useMemo(() => {
    const texture = gardenTextureSource.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }, [gardenTextureSource]);

  const drops = useMemo(() => Array.from({ length: 160 }, (_, index) => ({
    x: ((index * 41) % 157) / 156 * 4.96 - 2.48,
    y: ((index * 59) % 149) / 148 * 3.9 - 1.95,
    speed: .72 + ((index * 31) % 53) / 34,
    length: .045 + (index % 7) * .018,
    opacity: .35 + (index % 5) * .1,
  })), []);
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => refs.current.forEach((drop, index) => {
    if (!drop) return;
    const safeDelta = Math.min(delta, .04);
    drop.position.y -= safeDelta * drops[index].speed;
    drop.position.x -= safeDelta * .075;
    if (drop.position.y < -1.96) {
      drop.position.y = 1.96;
      drop.position.x = drops[index].x;
    }
  }));

  return (
    <group position={[6.39, 3.16, .12]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[0, 0, -.018]}>
        <planeGeometry args={[5.22, 4.22]} />
        <meshBasicMaterial map={gardenTexture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, .008]}>
        <planeGeometry args={[5.22, 4.22]} />
        <meshPhysicalMaterial color="#d9efed" transparent opacity={.12} roughness={.12} transmission={.32} thickness={.018} />
      </mesh>

      {[-1.3, 0, 1.3].map((x) => <mesh key={x} position={[x, 0, .028]}><boxGeometry args={[.036, 4.24, .028]} /><meshStandardMaterial color="#302923" roughness={.62} /></mesh>)}
      {[-2.6, 2.6].map((x) => <mesh key={x} position={[x, 0, .03]}><boxGeometry args={[.055, 4.3, .032]} /><meshStandardMaterial color="#302923" roughness={.62} /></mesh>)}
      {[-2.1, 2.1].map((y) => <mesh key={y} position={[0, y, .03]}><boxGeometry args={[5.24, .055, .032]} /><meshStandardMaterial color="#302923" roughness={.62} /></mesh>)}

      {drops.map((drop, index) => (
        <mesh ref={(node) => { refs.current[index] = node; }} key={index} position={[drop.x, drop.y, .052]} rotation={[0, 0, -.075]}>
          <planeGeometry args={[.011, drop.length]} />
          <meshBasicMaterial color="#f2fbfb" transparent opacity={drop.opacity} />
        </mesh>
      ))}
    </group>
  );
}

type GeoPoint = [number, number];

const CONTINENT_OUTLINES: GeoPoint[][] = [
  [[-168, 71], [-151, 76], [-132, 73], [-118, 69], [-102, 73], [-82, 68], [-61, 61], [-54, 52], [-62, 46], [-71, 44], [-75, 39], [-81, 31], [-88, 19], [-96, 15], [-105, 20], [-113, 29], [-120, 35], [-125, 43], [-127, 51], [-139, 59], [-154, 61]],
  [[-82, 12], [-74, 11], [-66, 9], [-58, 5], [-51, 1], [-45, -8], [-39, -15], [-35, -23], [-42, -33], [-49, -42], [-54, -51], [-63, -55], [-68, -48], [-72, -38], [-74, -25], [-77, -13], [-81, -2]],
  [[-11, 36], [-8, 43], [-1, 44], [3, 49], [8, 50], [9, 54], [5, 58], [10, 61], [16, 58], [22, 60], [29, 66], [25, 71], [16, 72], [7, 66], [-1, 63], [-7, 57], [-10, 50]],
  [[-18, 35], [-8, 37], [2, 37], [11, 36], [20, 33], [28, 31], [34, 27], [39, 20], [44, 12], [51, 10], [48, 2], [43, -10], [40, -18], [34, -27], [27, -34], [18, -35], [10, -30], [4, -22], [-2, -10], [-7, 2], [-13, 10], [-17, 22]],
  [[24, 39], [29, 43], [36, 48], [34, 53], [29, 57], [24, 61], [31, 66], [43, 69], [55, 73], [72, 76], [91, 78], [111, 75], [131, 70], [149, 65], [165, 59], [179, 52], [176, 46], [164, 43], [153, 40], [145, 36], [139, 38], [132, 43], [126, 39], [122, 31], [116, 25], [109, 20], [106, 13], [101, 9], [96, 18], [91, 23], [86, 22], [81, 8], [76, 9], [72, 20], [67, 24], [59, 25], [53, 29], [47, 31], [42, 36], [36, 37], [31, 34]],
  [[112, -11], [128, -9], [139, -12], [154, -20], [151, -39], [132, -44], [119, -36], [113, -28]],
  [[-54, 60], [-42, 60], [-20, 72], [-28, 82], [-48, 84], [-62, 74]],
  [[130, 31], [136, 35], [141, 45], [146, 42], [142, 34], [137, 30]],
  [[-10, 50], [-3, 51], [-2, 59], [-7, 58]],
  [[96, 5], [108, 6], [119, 1], [130, -5], [121, -9], [106, -7]],
  [[34, 30], [42, 30], [49, 24], [56, 17], [51, 12], [44, 13], [39, 20]],
  [[77, 30], [88, 27], [92, 21], [86, 8], [79, 7], [74, 19]],
  [[119, 23], [122, 25], [122, 18], [120, 15]],
  [[120, 14], [124, 12], [126, 8], [123, 5], [120, 8]],
  [[47, -13], [50, -16], [49, -25], [45, -24], [44, -17]],
];

function isInsideOutline(lon: number, lat: number, outline: GeoPoint[]) {
  let inside = false;
  for (let current = 0, previous = outline.length - 1; current < outline.length; previous = current++) {
    const [currentLon, currentLat] = outline[current];
    const [previousLon, previousLat] = outline[previous];
    if ((currentLat > lat) !== (previousLat > lat) && lon < (previousLon - currentLon) * (lat - currentLat) / (previousLat - currentLat) + currentLon) inside = !inside;
  }
  return inside;
}

function WorldMap() {
  const mapWidth = 3.72;
  const mapHeight = 2.15;
  const segments = useMemo(() => {
    const columns = 88;
    const rows = 44;
    const cellWidth = mapWidth / columns;
    const cellHeight = mapHeight / rows;
    const result: { x: number; y: number; width: number; color: string }[] = [];
    for (let row = 0; row < rows; row += 1) {
      const lat = 85 - (row + .5) / rows * 170;
      let start = -1;
      for (let column = 0; column <= columns; column += 1) {
        const lon = -180 + (column + .5) / columns * 360;
        const land = column < columns && CONTINENT_OUTLINES.some((outline) => isInsideOutline(lon, lat, outline));
        if (land && start < 0) start = column;
        if ((!land || column === columns) && start >= 0) {
          const count = column - start;
          const centerColumn = start + count / 2;
          const seed = Math.abs(Math.round(lat * .13 + start * .71));
          result.push({
            x: -mapWidth / 2 + centerColumn * cellWidth,
            y: mapHeight / 2 - (row + .5) * cellHeight,
            width: count * cellWidth * .96,
            color: ['#9b864c', '#72834a', '#b39b5d', '#766443'][seed % 4],
          });
          start = -1;
        }
      }
    }
    return result;
  }, []);

  return (
    <group position={[-6.38, 3.78, -.15]} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow><boxGeometry args={[4.08, 2.51, .14]} /><meshStandardMaterial color="#4c3121" roughness={.66} /></mesh>
      <mesh position={[0, 0, .085]}><planeGeometry args={[3.82, 2.25]} /><meshStandardMaterial color="#809b96" roughness={.94} /></mesh>
      {[-1.43, -.72, 0, .72, 1.43].map((x) => <mesh key={x} position={[x, 0, .096]}><boxGeometry args={[.012, 2.14, .01]} /><meshBasicMaterial color="#d7e4dc" transparent opacity={.2} /></mesh>)}
      {[-.78, -.39, 0, .39, .78].map((y) => <mesh key={y} position={[0, y, .096]}><boxGeometry args={[3.7, .012, .01]} /><meshBasicMaterial color="#d7e4dc" transparent opacity={.2} /></mesh>)}
      {segments.map((segment, index) => (
        <group key={index}>
          <mesh position={[segment.x, segment.y, .109]}><boxGeometry args={[segment.width + .018, mapHeight / 44 * 1.05, .028]} /><meshStandardMaterial color="#394338" roughness={.9} /></mesh>
          <mesh position={[segment.x, segment.y, .13]}><boxGeometry args={[segment.width, mapHeight / 44 * .8, .03]} /><meshStandardMaterial color={segment.color} roughness={.86} /></mesh>
        </group>
      ))}
      {[
        [-1.96, 1.18], [1.96, 1.18], [-1.96, -1.18], [1.96, -1.18],
      ].map((corner, index) => <mesh key={index} position={[corner[0], corner[1], .12]}><boxGeometry args={[.09, .09, .035]} /><meshStandardMaterial color="#b68940" metalness={.5} roughness={.35} /></mesh>)}
      <Html transform position={[1.23, .4, .15]} distanceFactor={5}><span className="map-pin" aria-label="My location">📍</span></Html>
    </group>
  );
}

function GuitarAndRecords() {
  return (
    <group position={[4.45, .08, -5.82]} scale={1.16}>
      <group rotation={[0, -.08, -.1]}>
        {[
          [0, .25, .86, .34],
          [0, .54, 1.02, .28],
          [0, .8, .7, .24],
          [0, 1.02, .52, .24],
          [0, 1.24, .68, .24],
        ].map((part, index) => (
          <mesh key={index} position={[part[0], part[1], 0]} castShadow>
            <boxGeometry args={[part[2], part[3], .22]} />
            <meshStandardMaterial color={index % 2 ? '#a95d31' : '#bc7040'} roughness={.62} />
          </mesh>
        ))}
        <mesh position={[0, .73, .125]}><boxGeometry args={[.23, .23, .025]} /><meshStandardMaterial color="#241914" roughness={.82} /></mesh>
        <mesh position={[0, 1.92, 0]}><boxGeometry args={[.16, 1.55, .16]} /><meshStandardMaterial color="#4a2d20" roughness={.62} /></mesh>
        <mesh position={[0, 2.74, 0]}><boxGeometry args={[.34, .34, .18]} /><meshStandardMaterial color="#5a3522" roughness={.62} /></mesh>
        {[1.42, 1.65, 1.88, 2.11, 2.34].map((y) => <mesh key={y} position={[0, y, .09]}><boxGeometry args={[.18, .018, .012]} /><meshStandardMaterial color="#c3a777" metalness={.35} /></mesh>)}
        {[-.04, 0, .04].map((x) => <mesh key={x} position={[x, 1.55, .105]}><boxGeometry args={[.009, 2.2, .009]} /><meshStandardMaterial color="#e2d1aa" metalness={.3} /></mesh>)}
      </group>
      <group position={[1.02, .48, .04]} rotation={[0, -.14, .04]}>
        {[
          ['#a84932', '#e4c267'], ['#2d586c', '#c5d6d3'], ['#c59b46', '#293f33'], ['#e6dcc5', '#844737'],
        ].map((colors, index) => (
          <group key={colors[0]} position={[index * .075, index * .045, index * .05]} rotation={[0, 0, .045 * index]}>
            <mesh><boxGeometry args={[.78, .8, .045]} /><meshStandardMaterial color={colors[0]} roughness={.74} /></mesh>
            <mesh position={[0, .12, .028]}><boxGeometry args={[.52, .15, .012]} /><meshStandardMaterial color={colors[1]} /></mesh>
            <mesh position={[-.18, -.16, .028]}><boxGeometry args={[.16, .16, .012]} /><meshStandardMaterial color="#20231f" /></mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

function RoomSurfaces() {
  const tiles = useMemo(() => Array.from({ length: 121 }, (_, index) => ({
    x: -5.8 + (index % 11) * 1.16,
    z: -5.3 + Math.floor(index / 11) * 1.16,
    color: ['#7d6a59', '#887361', '#756354', '#927966'][(index + Math.floor(index / 11)) % 4],
  })), []);
  return (
    <>
      <mesh position={[0, -.09, .55]} receiveShadow><boxGeometry args={[13.2, .16, 13.4]} /><meshStandardMaterial color="#4d443c" roughness={.94} /></mesh>
      {tiles.map((tile, index) => (
        <mesh key={index} position={[tile.x, .01, tile.z]} receiveShadow>
          <boxGeometry args={[1.1, .035, 1.1]} />
          <meshStandardMaterial color={tile.color} roughness={.91} />
        </mesh>
      ))}

      <group position={[0, .055, 2.05]}>
        <mesh receiveShadow><boxGeometry args={[7.35, .045, 5.25]} /><meshStandardMaterial color="#704033" roughness={.9} /></mesh>
        {[[-3.33, 0, .22, 4.82], [3.33, 0, .22, 4.82], [0, -2.28, 6.88, .2], [0, 2.28, 6.88, .2]].map((part, index) => <mesh key={index} position={[part[0], .035, part[1]]}><boxGeometry args={[part[2], .035, part[3]]} /><meshStandardMaterial color="#d09b56" roughness={.82} /></mesh>)}
        {[
          [-2.85, -1.82], [2.85, -1.82], [-2.85, 1.82], [2.85, 1.82],
        ].map((position, index) => <group key={index} position={[position[0], .065, position[1]]}>{[0, 1, 2].map((step) => <mesh key={step} position={[(index % 2 ? -1 : 1) * step * .18, 0, (index > 1 ? -1 : 1) * step * .18]}><boxGeometry args={[.23, .035, .23]} /><meshStandardMaterial color={step % 2 ? '#264f49' : '#d6b367'} /></mesh>)}</group>)}
        <mesh position={[0, .04, 0]}><boxGeometry args={[3.2, .035, .18]} /><meshStandardMaterial color="#31534d" /></mesh>
        <mesh position={[0, .04, 0]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[2.3, .035, .18]} /><meshStandardMaterial color="#31534d" /></mesh>
      </group>

      <mesh position={[0, 3.2, -6.5]} receiveShadow><boxGeometry args={[13, 6.5, .14]} /><meshStandardMaterial color="#c6b797" roughness={.96} /></mesh>
      {Array.from({ length: 16 }, (_, index) => <mesh key={index} position={[-6.15 + index * .82, 3.2, -6.418]}><boxGeometry args={[.075, 6.08, .018]} /><meshStandardMaterial color={index % 2 ? '#ae9d7d' : '#d7c9aa'} roughness={1} /></mesh>)}
      {Array.from({ length: 14 }, (_, index) => <group key={index} position={[-5.9 + index * .9, 2.26 + (index % 2) * .7, -6.4]}><mesh><boxGeometry args={[.12, .12, .025]} /><meshStandardMaterial color="#879072" /></mesh><mesh position={[.12, .12, 0]}><boxGeometry args={[.12, .12, .025]} /><meshStandardMaterial color="#b08a59" /></mesh></group>)}

      <mesh position={[-6.5, 3.2, .1]}><boxGeometry args={[.14, 6.5, 13.2]} /><meshStandardMaterial color="#beaf93" roughness={.96} /></mesh>
      <mesh position={[6.5, 3.2, .1]}><boxGeometry args={[.14, 6.5, 13.2]} /><meshStandardMaterial color="#b9aa8f" roughness={.96} /></mesh>
      {Array.from({ length: 16 }, (_, index) => <mesh key={`left-${index}`} position={[-6.418, 3.2, -5.95 + index * .8]}><boxGeometry args={[.018, 6.08, .065]} /><meshStandardMaterial color="#a8987c" roughness={1} /></mesh>)}
      {Array.from({ length: 16 }, (_, index) => <mesh key={`right-${index}`} position={[6.418, 3.2, -5.95 + index * .8]}><boxGeometry args={[.018, 6.08, .065]} /><meshStandardMaterial color="#a29379" roughness={1} /></mesh>)}

      <mesh position={[0, 3.2, 6.7]} receiveShadow><boxGeometry args={[13, 6.5, .14]} /><meshStandardMaterial color="#c2b293" roughness={.96} /></mesh>
      {Array.from({ length: 16 }, (_, index) => <mesh key={`front-${index}`} position={[-6.15 + index * .82, 3.2, 6.618]}><boxGeometry args={[.075, 6.08, .018]} /><meshStandardMaterial color={index % 2 ? '#ab9a7b' : '#d2c3a3'} roughness={1} /></mesh>)}

      <mesh position={[0, 6.48, .1]} receiveShadow><boxGeometry args={[13.2, .18, 13.2]} /><meshStandardMaterial color="#d4c6a9" roughness={.95} /></mesh>
      <mesh position={[0, .22, -6.36]}><boxGeometry args={[13, .25, .16]} /><meshStandardMaterial color="#4d3828" roughness={.68} /></mesh>
      <mesh position={[0, .22, 6.56]}><boxGeometry args={[13, .25, .16]} /><meshStandardMaterial color="#4d3828" roughness={.68} /></mesh>
      <mesh position={[-6.36, .22, .1]}><boxGeometry args={[.16, .25, 13.2]} /><meshStandardMaterial color="#4d3828" roughness={.68} /></mesh>
      <mesh position={[6.36, .22, .1]}><boxGeometry args={[.16, .25, 13.2]} /><meshStandardMaterial color="#4d3828" roughness={.68} /></mesh>
    </>
  );
}

function CeilingPendant() {
  return (
    <group position={[.3, 6.36, .55]}>
      <mesh position={[0, -.45, 0]} castShadow><cylinderGeometry args={[.025, .025, .9, 10]} /><meshStandardMaterial color="#302820" metalness={.42} roughness={.48} /></mesh>
      <mesh position={[0, -.92, 0]} castShadow><cylinderGeometry args={[.13, .18, .18, 12]} /><meshStandardMaterial color="#4b3425" metalness={.28} roughness={.56} /></mesh>
      <mesh position={[0, -1.16, 0]} castShadow><coneGeometry args={[.58, .52, 12, 1, true]} /><meshStandardMaterial color="#d99a4b" emissive="#9e4f20" emissiveIntensity={.32} roughness={.62} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, -1.17, 0]}><sphereGeometry args={[.14, 16, 12]} /><meshStandardMaterial color="#ffd99a" emissive="#ffae54" emissiveIntensity={2.2} roughness={.3} /></mesh>
      <pointLight position={[0, -1.2, 0]} intensity={34} distance={9} color="#ffb768" />
    </group>
  );
}

function VoxelBeanbag() {
  const layers = [
    [3.15, .28, 1.5, .16, 0],
    [2.82, .3, 1.34, .43, -.08],
    [2.34, .3, 1.16, .7, -.2],
    [1.72, .28, .94, .96, -.35],
  ];
  return (
    <group position={[.35, .02, 5.7]} rotation={[0, Math.PI, 0]}>
      {layers.map((layer, index) => <mesh key={index} position={[0, layer[3], layer[4]]} castShadow><boxGeometry args={[layer[0], layer[1], layer[2]]} /><meshStandardMaterial color={['#b9562d', '#c56234', '#d06d39', '#bb552d'][index]} roughness={.86} /></mesh>)}
      {[-1.34, 1.34].map((x) => <mesh key={x} position={[x, .5, -.05]}><boxGeometry args={[.34, .62, 1.14]} /><meshStandardMaterial color="#ad4e2a" roughness={.9} /></mesh>)}
    </group>
  );
}

function CameraRig({ lifted }: { lifted: boolean }) {
  const { camera } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const elapsed = useRef(0);
  const wasLifted = useRef(false);
  const transitionStartPosition = useRef(new THREE.Vector3());
  const transitionStartTarget = useRef(new THREE.Vector3());
  const overheadPosition = useMemo(() => new THREE.Vector3(.35, 6.2, 4.45), []);
  const overheadTarget = useMemo(() => new THREE.Vector3(.35, 1.22, .18), []);
  const roomPosition = useMemo(() => new THREE.Vector3(0, 2.7, 4.35), []);
  const roomTarget = useMemo(() => new THREE.Vector3(.25, 1.68, .18), []);

  useFrame((_, delta) => {
    if (!controls.current) return;
    if (lifted && !wasLifted.current) {
      elapsed.current = 0;
      transitionStartPosition.current.copy(camera.position);
      transitionStartTarget.current.copy(controls.current.target);
    }
    wasLifted.current = lifted;

    if (!lifted) {
      controls.current.enabled = false;
      camera.position.lerp(overheadPosition, 1 - Math.pow(.004, Math.min(delta, .04)));
      controls.current.target.lerp(overheadTarget, .12);
    } else if (elapsed.current < 1.18) {
      elapsed.current += Math.min(delta, .04);
      controls.current.enabled = false;
      const ease = 1 - Math.pow(1 - Math.min(elapsed.current / 1.18, 1), 3);
      camera.position.lerpVectors(transitionStartPosition.current, roomPosition, ease);
      controls.current.target.lerpVectors(transitionStartTarget.current, roomTarget, ease);
      if (elapsed.current >= 1.18) {
        camera.position.copy(roomPosition);
        controls.current.target.copy(roomTarget);
      }
    } else {
      controls.current.enabled = true;
    }
    controls.current.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={false}
      enableRotate
      enableZoom
      enablePan
      enableDamping
      dampingFactor={.065}
      rotateSpeed={.68}
      zoomSpeed={1.3}
      panSpeed={.72}
      zoomToCursor
      minDistance={.68}
      maxDistance={5.15}
      minPolarAngle={.72}
      maxPolarAngle={1.84}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
    />
  );
}

function Room({ lifted }: { lifted: boolean }) {
  return (
    <>
      <CameraRig lifted={lifted} />
      <color attach="background" args={['#a99d8b']} />
      <fog attach="fog" args={['#aaa08f', 10, 22]} />
      <ambientLight intensity={1.15} color="#f7ead6" />
      <directionalLight position={[-3, 8, 5]} intensity={2.4} color="#fff0d2" castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[6.15, 4.2, .2]} intensity={13} distance={9} color="#c5e9e6" />
      <RoomSurfaces />
      <CeilingPendant />
      <RoundedBox args={[8.05, .42, 3.62]} radius={.1} position={[0, 1.03, .58]} castShadow receiveShadow><meshStandardMaterial color="#724d37" roughness={.56} /></RoundedBox>
      <mesh position={[0, 1.25, .58]}><boxGeometry args={[7.7,.035,3.28]} /><meshStandardMaterial color="#895f43" roughness={.42} /></mesh>
      {[[-3.4,-.85],[3.4,-.85],[-3.4,1.22],[3.4,1.22]].map((p,index) => <mesh key={index} position={[p[0],.5,p[1]+.58]} castShadow><boxGeometry args={[.24,1.02,.24]} /><meshStandardMaterial color="#493226" /></mesh>)}
      <FootballField />
      <ScholarSet />
      <CabinetAndLamp />
      <RainWindow />
      <WorldMap />
      <GuitarAndRecords />
      <VoxelBeanbag />
      <WallPhoto position={[-4.1, 4.15, -6.37]} rotation={-.045} format="hero" src={messiPhoto} />
      <WallPhoto position={[-1.65, 4.45, -6.365]} rotation={.055} src={jayPhoto} />
      <WallPhoto position={[.55, 3.68, -6.36]} rotation={-.035} format="landscape" src={friendsPhoto} />
      <WallPhoto position={[3.55, 4.32, -6.365]} rotation={.06} format="landscape" src={tagorePhoto} />
      <ContactShadows position={[0, .02, 0]} opacity={.42} scale={15} blur={2.1} far={9} />
    </>
  );
}

export function HomeExperience({ lang }: { lang: Language }) {
  const [lifted, setLifted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const t = WORDS[lang];
  const typing = useTypewriter(t.intro);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && typing.done) setDismissed(true);
    };
    addEventListener('keydown', handler);
    return () => removeEventListener('keydown', handler);
  }, [typing.done]);

  return (
    <section className={['home-experience', lifted ? 'lifted' : '', dismissed ? 'entered' : ''].filter(Boolean).join(' ')} aria-label="Interactive personal room">
      <div className="room-canvas">
        <Canvas shadows camera={{ position: [.35, 6.2, 4.45], fov: 49 }} dpr={[1, 1.45]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
          <Suspense fallback={null}><Room lifted={lifted} /></Suspense>
        </Canvas>
      </div>
      <button
        className="room-look-control"
        aria-label={t.click}
        onClick={() => setLifted(true)}
      />
      <div className="room-pixel-overlay" aria-hidden="true" />
      <div className="room-vignette" aria-hidden="true" />
      <div className="intro-type">
        <h1>
          <span>{typing.out[0]}{typing.activeLine === 0 && <i />}</span>
          <span>{typing.out[1]}{typing.activeLine === 1 && <i />}</span>
        </h1>
      </div>
      <a className="room-language" href={`/${lang === 'en' ? 'zh' : 'en'}/`} onClick={(event) => event.stopPropagation()}>
        <Globe2 />{lang === 'en' ? '中文' : 'EN'}
      </a>
      <p className="room-hint">{lifted ? t.explore : t.click}<i /></p>
      <button className={`enter-reading ${typing.done ? 'show' : ''}`} onClick={() => setDismissed(true)}>
        <kbd>↵</kbd>{t.enter}
      </button>
    </section>
  );
}
