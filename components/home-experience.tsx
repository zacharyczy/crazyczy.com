'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Html, OrbitControls, RoundedBox, useTexture } from '@react-three/drei';
import { Globe2 } from 'lucide-react';
import Image, { type StaticImageData } from 'next/image';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Language } from '@/lib/content';
import messiPhoto from '@/pic/梅西.png';
import jayPhoto from '@/pic/Jay.png';
import friendsPhoto from '@/pic/老友记五人.png';
import haiziPhoto from '@/pic/海子.png';
import gardenBackdrop from '@/pic/jiangnan-garden.png';

const WORDS = {
  en: {
    intro: ['Hey, I am Zachary Cheng', 'Welcome to crazyczy.com'],
    click: 'Click anywhere to lift your eyes',
    explore: 'Drag to look · scroll or pinch to zoom',
    enter: 'Press Enter to continue',
  },
  zh: {
    intro: ['嗨，我是 Zachary Cheng', '欢迎来到 crazyczy.com'],
    click: '点击任意位置，抬头看看',
    explore: '按住拖动视角 · 滚轮或双指缩放',
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
      <RoundedBox args={[4.45, .2, 2.58]} radius={.1} castShadow receiveShadow>
        <meshStandardMaterial color="#193426" roughness={.72} />
      </RoundedBox>
      {stripes.map((x, index) => (
        <mesh key={x} position={[x, .115, 0]} receiveShadow>
          <boxGeometry args={[.58, .018, 2.34]} />
          <meshStandardMaterial color={index % 2 ? '#2f7545' : '#3e8650'} roughness={.94} />
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
          <group position={[side * 2.08, .33, 0]}>
            <mesh><boxGeometry args={[.035, .48, 1.02]} /><meshStandardMaterial color="#ece8db" /></mesh>
            <mesh position={[-side * .18, 0, 0]}><boxGeometry args={[.34, .035, 1.02]} /><meshStandardMaterial color="#ece8db" /></mesh>
            {[-.38, 0, .38].map((z) => <mesh key={z} position={[-side * .18, 0, z]}><boxGeometry args={[.34, .012, .012]} /><meshStandardMaterial color="#ded8c7" /></mesh>)}
          </group>
        </group>
      ))}
      <group ref={ball} position={[.15, .31, .1]}>
        <mesh castShadow><icosahedronGeometry args={[.14, 3]} /><meshStandardMaterial color="#f7f3e8" roughness={.6} /></mesh>
        {[[0,.142,0],[.11,.06,.07],[-.09,.07,-.08],[.04,-.08,.11],[-.1,-.07,.06]].map((p, index) => (
          <mesh key={index} position={p as [number, number, number]} rotation={[-Math.PI / 2, 0, index]}>
            <circleGeometry args={[.03, 5]} /><meshStandardMaterial color="#22201d" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function ScholarSet() {
  return (
    <group position={[-3.2, 1.36, .2]} rotation={[0, .12, 0]}>
      <RoundedBox args={[1.35, .035, .88]} radius={.02} position={[.45, -.05, 0]} rotation={[0, -.08, 0]}>
        <meshStandardMaterial color="#eee2c7" roughness={1} />
      </RoundedBox>
      {[0, .12, .24].map((offset) => <mesh key={offset} position={[-.05 + offset, -.025, .29]}><boxGeometry args={[.018, .015, .34]} /><meshStandardMaterial color="#c8b995" /></mesh>)}
      <mesh castShadow position={[-.48, 0, -.12]}><cylinderGeometry args={[.28, .33, .11, 28]} /><meshStandardMaterial color="#171615" roughness={.42} /></mesh>
      <mesh position={[-.48, .07, -.12]}><cylinderGeometry args={[.19, .22, .035, 28]} /><meshStandardMaterial color="#050505" roughness={.2} /></mesh>
      {[-.2, .12].map((x, index) => (
        <group key={x} position={[x, .36, -.05]} rotation={[0, 0, -.55 + index * .24]}>
          <mesh><cylinderGeometry args={[.024, .024, .88, 12]} /><meshStandardMaterial color={index ? '#8b3a28' : '#ad7b3f'} /></mesh>
          <mesh position={[0, -.55, 0]}><coneGeometry args={[.065, .25, 12]} /><meshStandardMaterial color="#19130f" /></mesh>
        </group>
      ))}
      <mesh position={[-.92, .11, .32]}><cylinderGeometry args={[.12, .1, .22, 20]} /><meshStandardMaterial color="#82684d" /></mesh>
    </group>
  );
}

function CabinetAndLamp() {
  return (
    <group>
      <group position={[-3.75, .95, -3.28]}>
        <RoundedBox args={[2.65, 1.55, .72]} radius={.045} castShadow><meshStandardMaterial color="#70442d" roughness={.66} /></RoundedBox>
        <mesh position={[0, .08, .38]}><boxGeometry args={[.035, 1.24, .025]} /><meshStandardMaterial color="#3f281d" /></mesh>
        {[-.63, .63].map((x) => <mesh key={x} position={[x, .08, .405]}><sphereGeometry args={[.055, 14, 14]} /><meshStandardMaterial color="#d7a94f" metalness={.72} roughness={.25} /></mesh>)}
        {[-.72, 0, .72].map((x, index) => (
          <group key={x} position={[x, 1.08, 0]} rotation={[.08, index * .3, .06]}>
            {[0, .16, .32].map((y, row) => <mesh key={y} position={[0, y, 0]}><boxGeometry args={[.46, .145, .46]} /><meshStandardMaterial color={[['#e8cb43','#376aa0','#bf463a'],['#f0eadc','#d06d33','#327e58'],['#704f91','#dcb53d','#2e839a']][index][row]} roughness={.45} /></mesh>)}
            <mesh position={[0, .16, .235]}><boxGeometry args={[.44, .44, .012]} /><meshStandardMaterial color={index === 1 ? '#f0eadc' : '#2d5c8e'} /></mesh>
          </group>
        ))}
        {[-1.06, 1.04].map((x, index) => <group key={x} position={[x, 1.11, 0]}><mesh position={[0, .18, 0]}><cylinderGeometry args={[.14, .25, .36, 18]} /><meshStandardMaterial color="#c69a42" metalness={.72} roughness={.25} /></mesh><mesh position={[0, .48, 0]}><sphereGeometry args={[.18, 18, 18]} /><meshStandardMaterial color={index ? '#d8b45c' : '#b98531'} metalness={.76} roughness={.22} /></mesh></group>)}
        <group position={[.2, 1.26, -.02]}>{['#594632','#8d3e2d','#d0a94f'].map((color, i) => <mesh key={color} position={[i * .13, 0, 0]} rotation={[0,0,(i-1)*.08]}><boxGeometry args={[.1,.62,.35]} /><meshStandardMaterial color={color} /></mesh>)}</group>
      </group>
      <group position={[-1.75, 0, -3.25]}>
        <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[.03, .045, 3, 12]} /><meshStandardMaterial color="#292621" metalness={.4} /></mesh>
        <mesh position={[0, .04, 0]}><cylinderGeometry args={[.4, .47, .08, 28]} /><meshStandardMaterial color="#292621" /></mesh>
        <mesh position={[0, 2.82, 0]}><coneGeometry args={[.55, .78, 32, 1, true]} /><meshStandardMaterial color="#f0c777" emissive="#f0a33b" emissiveIntensity={.65} side={THREE.DoubleSide} /></mesh>
        <pointLight position={[0, 2.65, .28]} intensity={32} distance={7} color="#ffb65f" />
      </group>
    </group>
  );
}

function WallPhoto({ position, rotation = 0, src, large = false }: { position: [number, number, number]; rotation?: number; src: StaticImageData; large?: boolean }) {
  const width = large ? 2.22 : 1.52;
  const height = large ? 2.66 : 1.88;
  return (
    <group position={position} rotation={[0, 0, rotation]}>
      <RoundedBox args={[width + .16, height + .16, .13]} radius={.025} castShadow><meshStandardMaterial color="#281f19" roughness={.46} /></RoundedBox>
      <RoundedBox args={[width, height, .04]} radius={.015} position={[0, 0, .085]}><meshStandardMaterial color="#e5dac1" roughness={.9} /></RoundedBox>
      <Html transform position={[0, 0, .112]} distanceFactor={5.65} style={{ pointerEvents: 'none' }}>
        <div className={`room-photo ${large ? 'large' : ''}`}><Image src={src} alt="" fill sizes={large ? '170px' : '116px'} priority /></div>
      </Html>
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

  const bamboo = [-2.28, -2.08, -1.87, 2.02, 2.22, 2.4];
  const stones = [-1.8, -1.46, 1.35, 1.72, 2.04];

  return (
    <group position={[4.42, 3.08, .05]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[0, 0, -.12]}>
        <planeGeometry args={[5.18, 4.18]} />
        <meshBasicMaterial map={gardenTexture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, .035]}>
        <planeGeometry args={[5.18, 4.18]} />
        <meshPhysicalMaterial color="#d9efed" transparent opacity={.13} roughness={.16} transmission={.28} thickness={.04} />
      </mesh>

      <group position={[-1.78, -.55, -.01]}>
        <mesh position={[0, .36, 0]} rotation={[0, 0, -.08]} castShadow>
          <cylinderGeometry args={[.13, .24, 1.62, 7]} />
          <meshStandardMaterial color="#3d3327" roughness={.95} flatShading />
        </mesh>
        <mesh position={[.22, 1.02, 0]} rotation={[0, 0, -.58]}>
          <cylinderGeometry args={[.07, .12, 1.12, 7]} />
          <meshStandardMaterial color="#42372b" roughness={.95} flatShading />
        </mesh>
        {[
          [-.38, 1.2, .48, '#244c35'],
          [.14, 1.47, .62, '#315f40'],
          [.68, 1.32, .47, '#3d7049'],
          [-.7, .84, .4, '#294e35'],
          [.48, .88, .38, '#48784f'],
        ].map((leaf, index) => (
          <mesh key={index} position={[leaf[0] as number, leaf[1] as number, -.01]} scale={[leaf[2] as number, (leaf[2] as number) * .72, .32]}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={leaf[3] as string} roughness={1} flatShading />
          </mesh>
        ))}
      </group>

      {bamboo.map((x, index) => (
        <group key={x} position={[x, -.2, .015]} rotation={[0, 0, (index % 3 - 1) * .025]}>
          <mesh><cylinderGeometry args={[.026, .036, 3.42, 7]} /><meshStandardMaterial color={index % 2 ? '#536f3f' : '#66804a'} roughness={.86} flatShading /></mesh>
          {[-.88, -.22, .46, 1.08].map((y, leafIndex) => (
            <group key={y} position={[0, y, 0]} rotation={[0, 0, leafIndex % 2 ? -.75 : .75]}>
              <mesh position={[.19, 0, 0]} scale={[.34, .07, .025]}><sphereGeometry args={[1, 6, 4]} /><meshStandardMaterial color={leafIndex % 2 ? '#355f3d' : '#456f45'} flatShading /></mesh>
            </group>
          ))}
        </group>
      ))}

      {stones.map((x, index) => (
        <mesh key={x} position={[x, -1.68 + (index % 2) * .1, .04]} rotation={[.15, index * .42, -.08]} scale={[.34 + index % 2 * .12, .24 + index % 3 * .05, .18]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={index % 2 ? '#59635b' : '#73766b'} roughness={1} flatShading />
        </mesh>
      ))}

      {[-1.3, 0, 1.3].map((x) => <mesh key={x} position={[x, 0, .08]}><boxGeometry args={[.055, 4.32, .07]} /><meshStandardMaterial color="#302923" roughness={.62} /></mesh>)}
      {[-2.56, 2.56].map((x) => <mesh key={x} position={[x, 0, .08]}><boxGeometry args={[.08, 4.32, .08]} /><meshStandardMaterial color="#302923" roughness={.62} /></mesh>)}
      {[-2.08, 2.08].map((y) => <mesh key={y} position={[0, y, .08]}><boxGeometry args={[5.2, .08, .08]} /><meshStandardMaterial color="#302923" roughness={.62} /></mesh>)}

      {drops.map((drop, index) => (
        <mesh ref={(node) => { refs.current[index] = node; }} key={index} position={[drop.x, drop.y, .115]} rotation={[0, 0, -.075]}>
          <planeGeometry args={[.011, drop.length]} />
          <meshBasicMaterial color="#f2fbfb" transparent opacity={drop.opacity} />
        </mesh>
      ))}
    </group>
  );
}

function WorldMap() {
  const pixels = [
    [-1.35,.35,.34,.28],[-1.03,.52,.5,.36],[-.8,.18,.38,.42],[-.58,-.2,.25,.5],[-.16,.5,.38,.24],[.16,.48,.34,.29],
    [.46,.36,.5,.4],[.78,.42,.48,.32],[1.1,.22,.42,.46],[1.38,-.02,.28,.28],[.34,-.15,.26,.44],[.56,-.42,.34,.34],[1.42,-.48,.32,.22],
  ];
  return (
    <group position={[-4.48, 3.78, -.15]} rotation={[0, Math.PI / 2, 0]}>
      <RoundedBox args={[3.86, 2.32, .11]} radius={.035}><meshStandardMaterial color="#6a4f35" /></RoundedBox>
      <mesh position={[0, 0, .065]}><planeGeometry args={[3.61, 2.07]} /><meshStandardMaterial color="#9bbab2" roughness={.95} /></mesh>
      {[-1.35, -.9, -.45, 0, .45, .9, 1.35].map((x) => <mesh key={x} position={[x, 0, .077]}><boxGeometry args={[.012, 2.02, .009]} /><meshBasicMaterial color="#d7e1d7" transparent opacity={.22} /></mesh>)}
      {[-.72, -.36, 0, .36, .72].map((y) => <mesh key={y} position={[0, y, .077]}><boxGeometry args={[3.55, .012, .009]} /><meshBasicMaterial color="#d7e1d7" transparent opacity={.22} /></mesh>)}
      {pixels.map((p, index) => <mesh key={index} position={[p[0], p[1], .083]}><boxGeometry args={[p[2], p[3], .025]} /><meshStandardMaterial color={['#af9257','#728750','#927344'][index % 3]} /></mesh>)}
      {[[.74,.54,.18,.12],[.94,.43,.16,.12],[.52,.31,.2,.15],[-1.08,.62,.16,.12],[-.88,.5,.18,.13]].map((p,index) => <mesh key={index} position={[p[0],p[1],.105]}><boxGeometry args={[p[2],p[3],.018]} /><meshStandardMaterial color={index%2?'#566d3e':'#c2a869'} /></mesh>)}
      <Html transform position={[.88, .38, .115]} distanceFactor={5}><span className="map-pin" aria-label="My location">📍</span></Html>
    </group>
  );
}

function GuitarAndRecords() {
  return (
    <group position={[3.45, .05, -3.3]}>
      <group rotation={[0, 0, -.1]}>
        <mesh position={[0, 1.05, 0]}><cylinderGeometry args={[.075, .09, 2.05, 14]} /><meshStandardMaterial color="#4b2b1d" /></mesh>
        <mesh position={[0, .23, 0]} scale={[.78, 1, .24]}><sphereGeometry args={[.7, 30, 30]} /><meshStandardMaterial color="#b76a3d" roughness={.5} /></mesh>
        <mesh position={[0, .38, .18]}><circleGeometry args={[.18, 28]} /><meshStandardMaterial color="#211914" /></mesh>
        {[-.035,0,.035].map(x => <mesh key={x} position={[x,1.12,.1]}><boxGeometry args={[.008,2.2,.008]} /><meshStandardMaterial color="#d8c6a3" /></mesh>)}
      </group>
      <group position={[1.02, .52, .05]} rotation={[0, -.15, .06]}>
        {['#b14935','#315d72','#d0aa56','#ede2ca'].map((color,index) => <mesh key={color} position={[index*.07,index*.04,index*.045]} rotation={[0,0,.05*index]}><boxGeometry args={[.75,.78,.035]} /><meshStandardMaterial color={color} /></mesh>)}
      </group>
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
  const roomPosition = useMemo(() => new THREE.Vector3(0, 3.05, 7.6), []);
  const roomTarget = useMemo(() => new THREE.Vector3(0, 2.88, 6.02), []);

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
      enablePan={false}
      enableDamping
      dampingFactor={.065}
      rotateSpeed={.52}
      zoomSpeed={.72}
      minDistance={.92}
      maxDistance={3.2}
      minPolarAngle={.78}
      maxPolarAngle={1.92}
      minAzimuthAngle={-1.08}
      maxAzimuthAngle={1.08}
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
      <pointLight position={[4.4, 4.2, .2]} intensity={13} distance={9} color="#c5e9e6" />
      <mesh position={[0, -.08, 0]} receiveShadow><boxGeometry args={[10, .16, 12]} /><meshStandardMaterial color="#6b5542" roughness={.88} /></mesh>
      {Array.from({ length: 16 }, (_, i) => <mesh key={i} position={[-4.7 + (i % 8) * 1.34, .015, -3.45 + Math.floor(i / 8) * 1.85]} rotation={[-Math.PI/2,0,(i%2?1:-1)*.015]} receiveShadow><planeGeometry args={[1.25,1.72]} /><meshStandardMaterial color={i%3===0?'#775d48':'#6d5542'} /></mesh>)}
      <mesh position={[0, 3.2, -4]} receiveShadow><boxGeometry args={[10, 6.5, .14]} /><meshStandardMaterial color="#d4c7b4" roughness={.94} /></mesh>
      <mesh position={[-5, 3.2, 0]}><boxGeometry args={[.14, 6.5, 8]} /><meshStandardMaterial color="#c6b7a2" /></mesh>
      <mesh position={[5, 3.2, 0]}><boxGeometry args={[.14, 6.5, 8]} /><meshStandardMaterial color="#b5a58d" /></mesh>
      <RoundedBox args={[8.05, .42, 3.62]} radius={.1} position={[0, 1.03, .58]} castShadow receiveShadow><meshStandardMaterial color="#724d37" roughness={.56} /></RoundedBox>
      <mesh position={[0, 1.25, .58]}><boxGeometry args={[7.7,.035,3.28]} /><meshStandardMaterial color="#895f43" roughness={.42} /></mesh>
      {[[-3.4,-.85],[3.4,-.85],[-3.4,1.22],[3.4,1.22]].map((p,index) => <mesh key={index} position={[p[0],.5,p[1]+.58]} castShadow><boxGeometry args={[.24,1.02,.24]} /><meshStandardMaterial color="#493226" /></mesh>)}
      <FootballField />
      <ScholarSet />
      <CabinetAndLamp />
      <RainWindow />
      <WorldMap />
      <GuitarAndRecords />
      <group position={[.35, .52, -2.7]} rotation={[0, Math.PI, 0]}>
        <RoundedBox args={[3.24, 1.02, 1.52]} radius={.42} castShadow><meshStandardMaterial color="#c85f31" roughness={.82} /></RoundedBox>
        <RoundedBox args={[2.7, .8, 1.28]} radius={.36} position={[0, .54, 0]} rotation={[-.12, 0, 0]}><meshStandardMaterial color="#d56d3b" roughness={.9} /></RoundedBox>
      </group>
      <group position={[2.05, .05, -2.95]}>{[-.22,0,.22].map((x,index)=><group key={x} position={[x,.52,index*.04]}><mesh><cylinderGeometry args={[.18,.24,.82,18]} /><meshStandardMaterial color={index===1?'#8a6244':'#6f8061'} /></mesh><mesh position={[0,.52,0]}><sphereGeometry args={[.28,12,9]} /><meshStandardMaterial color="#4e7352" /></mesh></group>)}</group>
      <WallPhoto position={[-2.42, 3.78, -3.87]} rotation={-.045} large src={messiPhoto} />
      <WallPhoto position={[-.42, 4.1, -3.87]} rotation={.06} src={jayPhoto} />
      <WallPhoto position={[1.25, 3.55, -3.87]} rotation={-.04} src={friendsPhoto} />
      <WallPhoto position={[2.8, 4.03, -3.87]} rotation={.065} src={haiziPhoto} />
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
