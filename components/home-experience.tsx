'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, RoundedBox, useTexture } from '@react-three/drei';
import { Tv, Armchair, Globe2, RotateCcw, Sun, Moon, Lamp, Images, X, HelpCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MoveUp, MoveDown, Sparkles } from 'lucide-react';
import { Component, Suspense, createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';
import { RoomNavigation } from './room-navigation';
import type { MoveInput, ViewMode } from './room-navigation';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from './ui/dialog';
import type { Language } from '@/lib/content';
import { ROOM_ARTWORKS } from './room-artworks';
import type { RoomArtwork } from './room-artworks';
import { PixelMaterials, usePixelMaterials } from './room-materials';
import { RoomShell, WoodenDoor, ReadingSofa, BrushDesk, DetailedCube, DetailedPyramid } from './room-furnishings';
import { FootballField } from './room-football';
import { GardenWindow } from './room-window';
import { RoomTelevision, TV_VIEW, SOFA_VIEW } from './room-television';
import type { GameId } from '@/lib/games';

const WORDS = {
  en: {
    intro: ['Hey, I am Zachary Cheng', 'Welcome to crazyczy.com'],
    click: 'Step into my room',
    explore: 'Drag to orbit · right-drag to pan · scroll / pinch to zoom',
    flyHint: 'Drag to look · WASD to move · Q / E down / up · Shift to move faster',
    enter: 'Enter the website', orbit: 'Orbit', fly: 'Roam', reset: 'Reset view',
    day: 'Let the daylight in', night: 'Switch to evening', lamp: 'Lamp',
    artwork: 'On the wall', close: 'Back to the room', help: 'Room controls',
    inspect: 'Take a closer look', toy: 'A little surprise', loading: 'Opening the room…',
    fallback: 'The room could not load. You can still enter the website.',
    forward: 'Forward', back: 'Back', left: 'Left', right: 'Right', up: 'Rise', down: 'Lower',
  },
  zh: {
    intro: ['嗨，我是 Zachary Cheng', '欢迎来到 crazyczy.com'],
    click: '进来坐坐，抬头看看',
    explore: '拖动环绕 · 右键平移 · 滚轮 / 双指缩放',
    flyHint: '拖动环顾 · WASD 移动 · Q / E 下降 / 上升 · Shift 加速',
    enter: '进入网站', orbit: '环绕', fly: '漫游', reset: '回到初始视角',
    day: '迎接白天', night: '切换夜晚', lamp: '台灯',
    artwork: '墙上的收藏', close: '回到房间', help: '房间操作',
    inspect: '靠近看看', toy: '一个小彩蛋', loading: '正在打开房间…',
    fallback: '房间暂时没有加载成功，你仍然可以直接进入网站。',
    forward: '前进', back: '后退', left: '向左', right: '向右', up: '上升', down: '下降',
  },
};

const ARTWORKS = ROOM_ARTWORKS;
const InteractionContext = createContext({ enabled: false, reducedMotion: false, setTip: (_tip: string) => {} });

function Hotspot({ label, onActivate, children }: { label: string; onActivate: () => void; children: ReactNode }) {
  const { enabled, setTip } = useContext(InteractionContext);
  return <group
    onPointerOver={(event) => { if (!enabled) return; event.stopPropagation(); setTip(label); }}
    onPointerOut={() => { setTip(''); }}
    onClick={(event) => { if (!enabled) return; event.stopPropagation(); if (event.delta <= 5) { setTip(''); onActivate(); } }}
  >{children}</group>;
}

class RoomBoundary extends Component<{ children: ReactNode; message: string; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? <output className="room-loading">{this.props.message}</output> : this.props.children; }
}

function useTypewriter(lines: string[], reducedMotion: boolean) {
  const [out, setOut] = useState(['', '']);
  const [activeLine, setActiveLine] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
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
  }, [lines, reducedMotion]);

  return reducedMotion ? { out: lines, activeLine: 1, done: true } : { out, activeLine, done };
}


function CabinetAndLamp({ on, toggle, label }: { on: boolean; toggle: () => void; label: string }) {
  const maps = usePixelMaterials();
  return (
    <group>
      <group position={[-4.25, .88, -5.86]}>
        <mesh castShadow><boxGeometry args={[2.72, 1.62, .78]} /><meshStandardMaterial map={maps.walnut} color="#c9ac90" roughness={.7} /></mesh>
        <mesh position={[0, .06, .405]}><boxGeometry args={[2.5, 1.38, .035]} /><meshStandardMaterial map={maps.oak} color="#c9a581" roughness={.75} /></mesh>
        <mesh position={[0, .06, .43]}><boxGeometry args={[.045, 1.34, .025]} /><meshStandardMaterial color="#35251d" /></mesh>
        <mesh position={[0, .56, .445]}><boxGeometry args={[2.44, .035, .025]} /><meshStandardMaterial color="#35251d" /></mesh>
        {[-.62, .62].map((x) => <mesh key={x} position={[x, .08, .458]}><boxGeometry args={[.1, .1, .045]} /><meshStandardMaterial color="#c69a4d" metalness={.66} roughness={.3} /></mesh>)}

        <DetailedCube position={[-.68, .9935, .02]} rotation={-.32} size={.35} />
        <DetailedPyramid position={[0, .9402, .02]} scale={.7} />
        <DetailedCube position={[.68, 1.0075, .03]} order={4} size={.378} rotation={.22} />
      </group>
      <group position={[-2.24, 0, -5.78]}><Hotspot label={label} onActivate={toggle}>
        <mesh position={[0, .05, 0]}><boxGeometry args={[.78, .1, .58]} /><meshStandardMaterial color="#292723" metalness={.25} roughness={.55} /></mesh>
        <mesh position={[0, 1.48, 0]}><boxGeometry args={[.075, 2.86, .075]} /><meshStandardMaterial color="#302c27" metalness={.42} roughness={.42} /></mesh>
        {[0, 1, 2].map((step) => <mesh key={step} position={[0, 2.48 + step * .17, 0]}><boxGeometry args={[1.02 - step * .2, .2, .72 - step * .12]} /><meshStandardMaterial color="#e8bd6e" emissive="#bd682c" emissiveIntensity={on ? .5 : 0} roughness={.76} /></mesh>)}
        <pointLight position={[0, 2.45, .22]} intensity={on ? 28 : 0} distance={7} color="#ffb65f" />
      </Hotspot></group>
    </group>
  );
}

function WallPhoto({ artwork, onInspect }: { artwork: RoomArtwork; onInspect: () => void }) {
  const { width, height, image: src, position, rotation, title } = artwork;
  const maps = usePixelMaterials();
  const source = useTexture(src.src);
  const texture = useMemo(() => {
    const map = source.clone();
    map.colorSpace = THREE.SRGBColorSpace;
    map.magFilter = THREE.NearestFilter;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.anisotropy = 8;
    map.needsUpdate = true;
    return map;
  }, [source]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group position={position} rotation={[0, 0, rotation]}><Hotspot label={title} onActivate={onInspect}>
    <mesh castShadow><boxGeometry args={[width + .24, height + .24, .14]} /><meshStandardMaterial map={maps.walnut} color="#79614b" roughness={.72} /></mesh>
    <mesh position={[0, 0, .077]}><boxGeometry args={[width + .12, height + .12, .025]} /><meshStandardMaterial map={maps.paper} color="#efe1c0" roughness={1} /></mesh>
    <mesh position={[0, 0, .096]}><planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
    {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, y]) => <mesh key={`${x}-${y}`} position={[x * (width / 2 + .085), y * (height / 2 + .085), .083]}><boxGeometry args={[.044, .044, .018]} /><meshStandardMaterial color="#b3995d" metalness={.6} roughness={.4} /></mesh>)}
  </Hotspot></group>;
}

function WorldMap() {
  const source = useTexture('/maps/world-land.png');
  const texture = useMemo(() => {
    const map = source.clone();
    map.colorSpace = THREE.SRGBColorSpace;
    map.magFilter = THREE.NearestFilter;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.anisotropy = 8;
    map.needsUpdate = true;
    return map;
  }, [source]);
  useEffect(() => () => texture.dispose(), [texture]);
  // Same equirectangular projection as the map; an approximate eastern mainland point.
  const pin: [number, number, number] = [117 / 360 * 3.72, 32 / 170 * 2.15, .15];
  return <group position={[-6.38, 3.78, -.15]} rotation={[0, Math.PI / 2, 0]}>
    <mesh castShadow><boxGeometry args={[4.08, 2.51, .14]} /><meshStandardMaterial color="#4c3121" roughness={.66} /></mesh>
    <mesh position={[0, 0, .08]}><planeGeometry args={[3.9, 2.33]} /><meshStandardMaterial color="#d4c29e" /></mesh>
    <mesh position={[0, 0, .09]}><planeGeometry args={[3.72, 2.15]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
    {[[-1.96, 1.18], [1.96, 1.18], [-1.96, -1.18], [1.96, -1.18]].map((corner, index) => <mesh key={index} position={[corner[0], corner[1], .12]}><boxGeometry args={[.09, .09, .035]} /><meshStandardMaterial color="#b68940" metalness={.5} roughness={.35} /></mesh>)}
    <group position={pin}>
      <mesh><circleGeometry args={[.06, 20]} /><meshBasicMaterial color="#fff1c9" /></mesh>
      <mesh position={[0, 0, .004]}><circleGeometry args={[.035, 20]} /><meshBasicMaterial color="#b54431" /></mesh>
      <mesh position={[0, 0, .002]}><ringGeometry args={[.086, .095, 24]} /><meshBasicMaterial color="#fff1c9" transparent opacity={.6} /></mesh>
    </group>
  </group>;
}

function SurpriseBlock({ trigger, onActivate, label }: { trigger: number; onActivate: () => void; label: string }) {
  const box = useRef<THREE.Group>(null);
  const star = useRef<THREE.Group>(null);
  const time = useRef(2);
  const { reducedMotion } = useContext(InteractionContext);
  useEffect(() => { if (trigger > 0) time.current = 0; }, [trigger]);
  useFrame((_, delta) => {
    if (!box.current || !star.current) return;
    time.current = Math.min(2, time.current + Math.min(delta, .05));
    const phase = time.current;
    box.current.position.y = reducedMotion ? 0 : Math.sin(Math.min(phase / .6, 1) * Math.PI) * .3;
    box.current.rotation.y = reducedMotion ? .2 : .2 + Math.sin(Math.min(phase / .6, 1) * Math.PI) * .18;
    star.current.visible = trigger > 0 && phase < 1.6;
    star.current.position.y = reducedMotion ? .85 : .65 + Math.sin(Math.min(phase / 1.6, 1) * Math.PI) * .55;
    star.current.rotation.y = reducedMotion ? 0 : phase * 4;
  });
  return <group position={[3.27, 1.67, 1.36]}>
    <group ref={box} rotation={[0, .2, 0]}><Hotspot label={label} onActivate={onActivate}>
      <mesh castShadow><boxGeometry args={[.58, .58, .58]} /><meshStandardMaterial color="#d99536" roughness={.62} emissive="#d07d22" emissiveIntensity={.12} /></mesh>
      {[-1, 1].map((side) => <group key={side} position={[0, 0, side * .3]}>
        <mesh><planeGeometry args={[.46, .46]} /><meshStandardMaterial color="#f2cc68" side={THREE.DoubleSide} /></mesh>
        {[[0, .11], [.08, .11], [.08, .03], [0, -.04], [0, -.17]].map(([x, y], i) => <mesh key={i} position={[x, y, side * .003]}><boxGeometry args={[.063, .063, .014]} /><meshStandardMaterial color="#80532c" /></mesh>)}
      </group>)}
    </Hotspot></group>
    <group ref={star} visible={false}>
      <mesh><boxGeometry args={[.12, .43, .12]} /><meshBasicMaterial color="#ffe7a3" /></mesh>
      <mesh><boxGeometry args={[.38, .12, .12]} /><meshBasicMaterial color="#ffe7a3" /></mesh>
      <mesh><boxGeometry args={[.24, .27, .12]} /><meshBasicMaterial color="#ffe7a3" /></mesh>
    </group>
  </group>;
}

function GuitarAndRecords() {
  const maps = usePixelMaterials();
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
            <meshStandardMaterial map={maps.oak} color={index % 2 ? '#c6a37e' : '#d1ad82'} roughness={.7} />
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

type RoomProps = {
  night: boolean; lampOn: boolean; toy: number; lang: Language;
  tv: boolean; tvReady: boolean; game: GameId | null; onTV: () => void; onCloseTV: () => void; onGame: (game: GameId | null) => void; onSeat: () => void;
  onLamp: () => void; onNight: () => void; onToy: () => void; onArtwork: (id: string) => void;
};
function Room({ night, lampOn, toy, lang, onLamp, onNight, onToy, onArtwork, tv, tvReady, game, onTV, onCloseTV, onGame, onSeat }: RoomProps) {
  const t = WORDS[lang];
  const maps = usePixelMaterials();
  const { reducedMotion } = useContext(InteractionContext);
  return (
    <>
      <color attach="background" args={[night ? '#172932' : '#a99d8b']} />

      <ambientLight intensity={night ? .26 : .65} color={night ? "#9baecb" : "#f7ead6"} />
      <directionalLight position={[5, 7, 1]} intensity={night ? .3 : 2.2} color={night ? "#a8c2e8" : "#fff0d2"} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-.0003} shadow-normalBias={.025} />
      <pointLight position={[6.15, 4.2, .2]} intensity={night ? 5 : 13} distance={9} color={night ? "#819ee0" : "#c5e9e6"} />
      <RoomShell />
      <WoodenDoor />
      <Environment resolution={128}>
        <Lightformer intensity={1.4} color="#dce7e0" position={[6, 3, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[7, 6, 1]} />
        <Lightformer intensity={.6} color="#eecb91" position={[-3, 4, 3]} scale={[4, 4, 1]} />
      </Environment>
      <CeilingPendant />
      <RoundedBox args={[8.05, .42, 3.62]} radius={.1} position={[0, 1.03, .58]} castShadow receiveShadow><meshStandardMaterial map={maps.walnut} roughness={.7} /></RoundedBox>
      <mesh position={[0, 1.25, .58]}><boxGeometry args={[7.7,.035,3.28]} /><meshStandardMaterial map={maps.oak} color="#d3b084" roughness={.7} /></mesh>
      {[[-3.4,-.85],[3.4,-.85],[-3.4,1.22],[3.4,1.22]].map((p,index) => <mesh key={index} position={[p[0],.5,p[1]+.58]} castShadow><boxGeometry args={[.24,1.02,.24]} /><meshStandardMaterial color="#493226" /></mesh>)}
      <FootballField reducedMotion={reducedMotion} />
      <BrushDesk />
      <CabinetAndLamp on={lampOn} toggle={onLamp} label={t.lamp} />
      <Hotspot onActivate={onNight} label={night ? t.day : t.night}><GardenWindow night={night} reducedMotion={reducedMotion} /></Hotspot>
      <WorldMap />
      <GuitarAndRecords />
      <Hotspot label={lang === 'zh' ? '坐在沙发上' : 'Sit on the sofa'} onActivate={onSeat}><ReadingSofa /></Hotspot>
      <Hotspot label={lang === 'zh' ? '打开电视，玩一会儿' : 'Turn on the TV'} onActivate={onTV}><RoomTelevision active={tv} ready={tvReady} game={game} lang={lang} reducedMotion={reducedMotion} onGame={onGame} onClose={onCloseTV} /></Hotspot>
      <SurpriseBlock trigger={toy} onActivate={onToy} label={t.toy} />
      {ARTWORKS.map((artwork) => <WallPhoto key={artwork.id} artwork={artwork} onInspect={() => onArtwork(artwork.id)} />)}
      <ContactShadows position={[0, .02, 0]} opacity={.42} scale={15} blur={2.1} far={9} />
    </>
  );
}

function SceneUnavailable({ message, onFailure }: { message: string; onFailure: () => void }) {
  useEffect(() => { onFailure(); }, [onFailure]);
  return <output className="room-loading">{message}</output>;
}

function SceneReady({ onReady }: { onReady: () => void }) {
  useEffect(() => { onReady(); }, [onReady]);
  return null;
}

export function HomeExperience({ lang }: { lang: Language }) {
  const [lifted, setLifted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mode, setMode] = useState<ViewMode>('orbit');
  const [resetId, setResetId] = useState(0);
  const [night, setNight] = useState(false);
  const [lampOn, setLampOn] = useState(true);
  const [toy, setToy] = useState(0);
  const [tip, setTip] = useState('');
  const [artId, setArtId] = useState<string | null>(null);
  const [tv, setTV] = useState(false);
  const [tvReady, setTVReady] = useState(false);
  const [game, setGame] = useState<GameId | null>(null);
  const [seated, setSeated] = useState(false);
  const modeBeforeTV = useRef<ViewMode>('orbit');
  const modeBeforeSeat = useRef<ViewMode>('orbit');
  const [help, setHelp] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const movement = useRef<MoveInput>({ x: 0, y: 0, z: 0 });
  const clearMovement = useCallback(() => { movement.current = { x: 0, y: 0, z: 0 }; }, []);
  const markReady = useCallback(() => setReady(true), []);
  const markFailed = useCallback(() => setFailed(true), []);
  const modeBeforeFocus = useRef<ViewMode>('orbit');
  const openArtwork = useCallback((id: string) => {
    if (!artId) modeBeforeFocus.current = mode;
    setMode('orbit');
    setArtId(id);
    setTip('');
  }, [artId, mode]);
  const closeArtwork = useCallback(() => { setArtId(null); setMode(modeBeforeFocus.current); setTip(''); }, []);
  const openTV = useCallback(() => { if(tv) return; modeBeforeTV.current = mode; setMode('orbit'); setTVReady(false); setTV(true); setTip(''); clearMovement(); }, [tv, mode, clearMovement]);
  const closeTV = useCallback(() => { setGame(null); setTV(false); setTVReady(false); setMode(modeBeforeTV.current); setTip(''); clearMovement(); }, [clearMovement]);
  const toggleSeat = useCallback(() => { if(artId) setArtId(null); if(seated) { setSeated(false); setMode(modeBeforeSeat.current); } else { modeBeforeSeat.current=artId ? modeBeforeFocus.current : mode; setMode('orbit'); setSeated(true); } setTip(''); clearMovement(); }, [seated, mode, artId, clearMovement]);
  const onSettled = useCallback((id: string | null) => { setTVReady(id === 'television'); }, []);
  const returnFocus = useRef<HTMLButtonElement>(null);
  const t = WORDS[lang];
  const typing = useTypewriter(t.intro, reducedMotion);
  const artwork = ARTWORKS.find((art) => art.id === artId);
  const views = useMemo(() => [...(seated ? [SOFA_VIEW] : []), ...(artwork ? [artwork] : []), ...(tv ? [TV_VIEW] : [])], [seated, artwork, tv]);
  const modalOpen = help;
  const interactive = lifted && ready && !modalOpen && !dismissed && !tv;

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (dismissed) return;
    const site = document.querySelector('main');
    const wasInert = site?.inert ?? false;
    if (site) site.inert = true;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; if(site) site.inert = wasInert; };
  }, [dismissed]);
  useEffect(() => {
    if (!dismissed) return;
    const timer = setTimeout(() => setMounted(false), reducedMotion ? 0 : 1200);
    return () => clearTimeout(timer);
  }, [dismissed, reducedMotion]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (dismissed || modalOpen || event.repeat) return;
      if (tv) { if (event.key === 'Escape') { event.preventDefault(); if(game) setGame(null); else closeTV(); } return; }
      if (event.key === 'Escape' && seated && !artwork) { event.preventDefault(); toggleSeat(); return; }
      const target = event.target as HTMLElement | null;
      if (event.key === 'Escape' && artwork) { event.preventDefault(); closeArtwork(); return; }
      if (event.key === 'Escape' && mode === 'fly') { setMode('orbit'); return; }
      if (target?.closest('button, a, input, textarea, select, [role="dialog"]')) return;
      if (event.key === 'Enter') { event.preventDefault(); setDismissed(true); }
    };
    addEventListener('keydown', handler);
    return () => removeEventListener('keydown', handler);
  }, [dismissed, modalOpen, mode, artwork, closeArtwork, tv, game, closeTV, seated, toggleSeat]);


  const moveButtons = [
    { key: 'forward', title: t.forward, icon: ArrowUp, axis: 'z', value: 1 },
    { key: 'left', title: t.left, icon: ArrowLeft, axis: 'x', value: -1 },
    { key: 'back', title: t.back, icon: ArrowDown, axis: 'z', value: -1 },
    { key: 'right', title: t.right, icon: ArrowRight, axis: 'x', value: 1 },
    { key: 'up', title: t.up, icon: MoveUp, axis: 'y', value: 1 },
    { key: 'down', title: t.down, icon: MoveDown, axis: 'y', value: -1 },
  ] as const;

  return <section className={['home-experience', lifted ? 'lifted' : '', dismissed ? 'entered' : '', night ? 'is-night' : '', artwork ? 'is-inspecting' : '', tv ? 'is-watching-tv' : '', seated ? 'is-seated' : '', tip ? 'has-hotspot' : ''].filter(Boolean).join(' ')} aria-label={lang === 'zh' ? '我的互动房间' : 'My interactive room'}>
    <div className="room-canvas">
      {mounted && <RoomBoundary message={t.fallback} onFailure={markFailed}>
        <Canvas shadows camera={{ position: [.35, 5.95, 4.45], fov: 49, near: .05, far: 150 }} dpr={[1, 1.75]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }} fallback={<SceneUnavailable message={t.fallback} onFailure={markFailed} />}>
          <InteractionContext.Provider value={{ enabled: interactive, reducedMotion, setTip }}>
            <RoomNavigation lifted={lifted && ready} mode={mode} resetId={resetId} paused={modalOpen || dismissed} reducedMotion={reducedMotion} movement={movement} clearMovement={clearMovement} views={views} inputLocked={tv || seated} onSettled={onSettled} />
            <Suspense fallback={null}>
              <PixelMaterials><Room tv={tv} tvReady={tvReady} game={game} onTV={openTV} onCloseTV={closeTV} onGame={setGame} onSeat={toggleSeat} night={night} lampOn={lampOn} toy={toy} lang={lang} onLamp={() => setLampOn((on) => !on)} onNight={() => setNight((value) => !value)} onToy={() => setToy((value) => value + 1)} onArtwork={openArtwork} /></PixelMaterials>
              <SceneReady onReady={markReady} />
            </Suspense>
          </InteractionContext.Provider>
        </Canvas>
      </RoomBoundary>}
    </div>
    {!ready && !failed && <output className="room-loading">{t.loading}</output>}
    {!lifted && <button className="room-look-control" aria-label={t.click} onClick={() => setLifted(true)} />}
    <div className="room-pixel-overlay" aria-hidden="true" />
    <div className="room-vignette" aria-hidden="true" />
    <div className={`intro-type ${typing.done ? 'is-done' : ''}`}>
      <h1><span>{typing.out[0]}{!typing.done && typing.activeLine === 0 && <i />}</span><span>{typing.out[1]}{!typing.done && typing.activeLine === 1 && <i />}</span></h1>
    </div>
    <a className="room-language" href={`/${lang === 'en' ? 'zh' : 'en'}/`}><Globe2 />{lang === 'en' ? '中文' : 'EN'}</a>
    {lifted && ready && !tv && <>
      <div className="room-toolbar" role="toolbar" aria-label={t.help}>
        <div className="room-view-toggle">
          <button disabled={seated} aria-pressed={mode === 'orbit'} onClick={() => { setMode('orbit'); setTip(''); }}>{t.orbit}</button>
          <button disabled={seated} aria-pressed={mode === 'fly'} onClick={() => { setMode('fly'); setTip(''); }}>{t.fly}</button>
        </div>
        <button ref={returnFocus} title={t.reset} aria-label={t.reset} onClick={() => { setArtId(null); setSeated(false); setMode('orbit'); setResetId((value) => value + 1); setTip(''); }}><RotateCcw /></button>
        <span className="room-toolbar-divider" />
        <button title={night ? t.day : t.night} aria-label={night ? t.day : t.night} aria-pressed={night} onClick={() => setNight((value) => !value)}>{night ? <Moon /> : <Sun />}</button>
        <button title={t.lamp} aria-label={t.lamp} aria-pressed={lampOn} onClick={() => setLampOn((value) => !value)}><Lamp /></button>
        <button title={t.artwork} aria-label={t.artwork} onClick={() => { openArtwork('tagore'); setTip(''); }}><Images /></button>
        <button title={lang === 'zh' ? '打开电视' : 'Watch TV'} aria-label={lang === 'zh' ? '打开电视' : 'Watch TV'} onClick={openTV}><Tv /></button>
        <button title={lang === 'zh' ? '沙发坐姿' : 'Sofa view'} aria-label={lang === 'zh' ? '沙发坐姿' : 'Sofa view'} aria-pressed={seated} onClick={toggleSeat}><Armchair /></button>
        <button title={t.help} aria-label={t.help} onClick={() => { setHelp(true); setTip(''); }}><HelpCircle /></button>
      </div>
      {mode === 'fly' && !seated && <fieldset className="room-movement" aria-label={t.fly}>
        {moveButtons.map(({ key, title, icon: Icon, axis, value }) => <button key={key} className={`move-${key}`} title={title} aria-label={title}
          onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); movement.current[axis] = value; }}
          onPointerUp={() => { movement.current[axis] = 0; }}
          onPointerCancel={() => { movement.current[axis] = 0; }}
          onLostPointerCapture={() => { movement.current[axis] = 0; }}
          onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); movement.current[axis] = value; } }}
          onKeyUp={() => { movement.current[axis] = 0; }} onBlur={() => { movement.current[axis] = 0; }}
        ><Icon /></button>)}
      </fieldset>}
    </>}
    {artwork && !tv && <aside className="room-focus-panel" aria-label={t.artwork}>
      <div><p>{artwork.title}</p><button aria-label={t.close} onClick={closeArtwork}><X /></button></div>
      <nav aria-label={t.artwork}>{ARTWORKS.map((art) => <button key={art.id} aria-pressed={art.id === artId} onClick={() => openArtwork(art.id)}>{art.id === 'tagore' ? 'Stray Birds' : art.title}</button>)}</nav>
    </aside>}
    {seated && !tv && !artwork && <button className="room-seat-return" onClick={toggleSeat}>{lang==='zh'?'起身 · 返回原视角':'Stand up · Return'}</button>}
    <p className={`room-hint ${mode === 'fly' ? 'fly-hint' : ''}`}>{tip || (lifted ? (mode === 'fly' ? t.flyHint : t.explore) : t.click)}</p>
    <button disabled={tv} className="enter-reading show" onClick={() => setDismissed(true)}><kbd>↵</kbd>{t.enter}</button>
    <Dialog open={modalOpen} onOpenChange={setHelp}>
      <DialogContent className="room-dialog room-help" showCloseButton={false} finalFocus={returnFocus}>
        <div className="room-dialog-heading">
          <div><DialogTitle>{t.help}</DialogTitle><DialogDescription>{lang === 'zh' ? '慢慢逛，像在自己的房间一样。' : 'Take your time. Make yourself at home.'}</DialogDescription></div>
          <DialogClose className="room-dialog-close" aria-label={t.close}><X /></DialogClose>
        </div>
        <dl className="room-help-list">
          <div><dt>{t.orbit}</dt><dd>{t.explore}</dd></div>
          <div><dt>{t.fly}</dt><dd>{t.flyHint}{lang === 'zh' ? '。触屏：拖动环顾，按住方向按钮移动。相机到墙面会停下。' : '. Touch: drag to look, hold the arrows to move. Movement stops at the walls.'}</dd></div>
          <div><dt>{t.inspect}</dt><dd>{lang === 'zh' ? '点击照片，在房间里靠近观看；按 Esc 或关闭按钮回到原来的位置。点击台灯或窗户切换光线。' : 'Click a picture to move closer in the room. Esc or the close button returns to your previous position. Click the lamp or window to change the light.'}</dd></div>
        </dl>
        <button className="room-toy-button" onClick={() => { setHelp(false); setArtId(null); setMode('orbit'); setResetId((value) => value + 1); setToy((value) => value + 1); }}><Sparkles />{t.toy}</button>
      </DialogContent>
    </Dialog>
  </section>;
}
