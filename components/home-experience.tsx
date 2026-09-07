'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Lightformer,
  RoundedBox,
  useTexture,
} from '@react-three/drei';
import {
  Tv,
  Armchair,
  Globe2,
  RotateCcw,
  Sun,
  Moon,
  Lamp,
  Images,
  X,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Monitor,
  Map as MapIcon,
  BookOpen,
  NotebookPen,
  PersonStanding,
} from 'lucide-react';
import {
  Component,
  Suspense,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  lazy,
} from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';
import { RoomOnboarding } from './room-onboarding';
import { RoomNavigation } from './room-navigation';
import type { MoveInput, ViewMode } from './room-navigation';
import { InteractionContext, Hotspot } from './room-interaction';
import {
  Bookcase,
  CollectionShelves,
  DetailedFloorLamp,
  DetailedPendant,
  DetailedGuitar,
  StudyDesk,
  StickyNotes,
  STUDY_VIEWS,
} from './room-study-models';
import { roomGuide, studyLabel } from '@/lib/room-guide';
import type { StudyPanel } from '@/lib/room-guide';
const StudyContent = lazy(() => import('./room-study-content'));
import type { Language } from '@/lib/content';
import { ROOM_ARTWORKS } from './room-artworks';
import type { RoomArtwork } from './room-artworks';
import { PixelMaterials, usePixelMaterials } from './room-materials';
import {
  RoomShell,
  WoodenDoor,
  ReadingSofa,
  BrushDesk,
  DetailedCube,
  DetailedPyramid,
} from './room-furnishings';
import { FootballField } from './room-football';
import { GardenWindow } from './room-window';
import { RoomTelevision, TV_VIEW, SOFA_VIEW } from './room-television';
import type { GameId } from '@/lib/games';

const WORDS = {
  en: {
    intro: ['Hey, I am Zachary Cheng', 'Welcome to crazyczy.com'],
    click: 'Step into my room',
    explore: 'Drag right to look left · Drag down to look up',
    flyHint: 'WASD to walk · C to crouch · E to interact',
    enter: 'Enter Writing',
    orbit: 'Orbit',
    fly: 'Roam',
    reset: 'Reset view',
    day: 'Let the daylight in',
    night: 'Switch to evening',
    lamp: 'Lamp',
    artwork: 'On the wall',
    close: 'Back to the room',
    help: 'Room controls',
    inspect: 'Take a closer look',
    toy: 'A little surprise',
    loading: 'Opening the room…',
    fallback: 'The room could not load. You can still enter the website.',
    forward: 'Forward',
    back: 'Back',
    left: 'Left',
    right: 'Right',
    up: 'Rise',
    down: 'Lower',
  },
  zh: {
    intro: ['嗨，我是 Zachary Cheng', '欢迎来到 crazyczy.com'],
    click: '进来坐坐，抬头看看',
    explore: '向右拖向左看 · 向下拖抬头',
    flyHint: 'WASD 行走 · C 蹲下 · E 交互',
    enter: '进入 Writing',
    orbit: '环绕',
    fly: '漫游',
    reset: '回到初始视角',
    day: '迎接白天',
    night: '切换夜晚',
    lamp: '台灯',
    artwork: '墙上的收藏',
    close: '回到房间',
    help: '房间操作',
    inspect: '靠近看看',
    toy: '一个小彩蛋',
    loading: '正在打开房间…',
    fallback: '房间暂时没有加载成功，你仍然可以直接进入网站。',
    forward: '前进',
    back: '后退',
    left: '向左',
    right: '向右',
    up: '上升',
    down: '下降',
  },
};

const ARTWORKS = ROOM_ARTWORKS;
class RoomBoundary extends Component<
  { children: ReactNode; message: string; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? (
      <output className="room-loading">{this.props.message}</output>
    ) : (
      this.props.children
    );
  }
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
        setOut((previous) =>
          previous.map((value, index) =>
            index === row ? lines[row].slice(0, char) : value,
          ),
        );
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
        timer = setTimeout(() => {
          row = 0;
          char = 0;
          setOut(['', '']);
          setActiveLine(0);
          setDone(false);
          timer = setTimeout(type, 560);
        }, 10000);
      }
    };
    timer = setTimeout(type, 560);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [lines, reducedMotion]);

  return reducedMotion
    ? { out: lines, activeLine: 1, done: true }
    : { out, activeLine, done };
}

function CabinetAndLamp({
  on,
  toggle,
  label,
}: {
  on: boolean;
  toggle: () => void;
  label: string;
}) {
  const maps = usePixelMaterials();
  return (
    <group>
      <group position={[-4.25, 0.88, -5.86]}>
        <mesh castShadow>
          <boxGeometry args={[2.72, 1.62, 0.78]} />
          <meshStandardMaterial
            map={maps.walnut}
            color="#c9ac90"
            roughness={0.7}
          />
        </mesh>
        <mesh position={[0, 0.06, 0.405]}>
          <boxGeometry args={[2.5, 1.38, 0.035]} />
          <meshStandardMaterial
            map={maps.oak}
            color="#c9a581"
            roughness={0.75}
          />
        </mesh>
        <mesh position={[0, 0.06, 0.43]}>
          <boxGeometry args={[0.045, 1.34, 0.025]} />
          <meshStandardMaterial color="#35251d" />
        </mesh>
        <mesh position={[0, 0.56, 0.445]}>
          <boxGeometry args={[2.44, 0.035, 0.025]} />
          <meshStandardMaterial color="#35251d" />
        </mesh>
        {[-0.62, 0.62].map((x) => (
          <mesh key={x} position={[x, 0.08, 0.458]}>
            <boxGeometry args={[0.1, 0.1, 0.045]} />
            <meshStandardMaterial
              color="#c69a4d"
              metalness={0.66}
              roughness={0.3}
            />
          </mesh>
        ))}

        <DetailedCube
          position={[-0.68, 0.9935, 0.02]}
          rotation={-0.32}
          size={0.35}
        />
        <DetailedPyramid position={[0, 0.9402, 0.02]} scale={0.7} />
        <DetailedCube
          position={[0.68, 1.0075, 0.03]}
          order={4}
          size={0.378}
          rotation={0.22}
        />
      </group>
      <Hotspot label={label} onActivate={toggle}>
        <DetailedFloorLamp on={on} />
      </Hotspot>
    </group>
  );
}

function WallPhoto({
  artwork,
  onInspect,
}: {
  artwork: RoomArtwork;
  onInspect: () => void;
}) {
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
  return (
    <group position={position} rotation={[0, 0, rotation]}>
      <Hotspot label={title} onActivate={onInspect}>
        <mesh castShadow>
          <boxGeometry args={[width + 0.24, height + 0.24, 0.14]} />
          <meshStandardMaterial
            map={maps.walnut}
            color="#79614b"
            roughness={0.72}
          />
        </mesh>
        <mesh position={[0, 0, 0.077]}>
          <boxGeometry args={[width + 0.12, height + 0.12, 0.025]} />
          <meshStandardMaterial
            map={maps.paper}
            color="#efe1c0"
            roughness={1}
          />
        </mesh>
        <mesh position={[0, 0, 0.096]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        {[
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ].map(([x, y]) => (
          <mesh
            key={`${x}-${y}`}
            position={[
              x * (width / 2 + 0.085),
              y * (height / 2 + 0.085),
              0.083,
            ]}
          >
            <boxGeometry args={[0.044, 0.044, 0.018]} />
            <meshStandardMaterial
              color="#b3995d"
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
        ))}
      </Hotspot>
    </group>
  );
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
  const pin: [number, number, number] = [
    (117 / 360) * 3.72,
    (32 / 170) * 2.15,
    0.15,
  ];
  return (
    <group position={[-6.38, 3.78, -3.1]} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow>
        <boxGeometry args={[4.08, 2.51, 0.14]} />
        <meshStandardMaterial color="#4c3121" roughness={0.66} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[3.9, 2.33]} />
        <meshStandardMaterial color="#d4c29e" />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[3.72, 2.15]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {[
        [-1.96, 1.18],
        [1.96, 1.18],
        [-1.96, -1.18],
        [1.96, -1.18],
      ].map((corner, index) => (
        <mesh key={index} position={[corner[0], corner[1], 0.12]}>
          <boxGeometry args={[0.09, 0.09, 0.035]} />
          <meshStandardMaterial
            color="#b68940"
            metalness={0.5}
            roughness={0.35}
          />
        </mesh>
      ))}
      <group position={pin}>
        <mesh>
          <circleGeometry args={[0.06, 20]} />
          <meshBasicMaterial color="#fff1c9" />
        </mesh>
        <mesh position={[0, 0, 0.004]}>
          <circleGeometry args={[0.035, 20]} />
          <meshBasicMaterial color="#b54431" />
        </mesh>
        <mesh position={[0, 0, 0.002]}>
          <ringGeometry args={[0.086, 0.095, 24]} />
          <meshBasicMaterial color="#fff1c9" transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function SurpriseBlock({
  trigger,
  onActivate,
  label,
}: {
  trigger: number;
  onActivate: () => void;
  label: string;
}) {
  const box = useRef<THREE.Group>(null);
  const star = useRef<THREE.Group>(null);
  const time = useRef(2);
  const { reducedMotion } = useContext(InteractionContext);
  useEffect(() => {
    if (trigger > 0) time.current = 0;
  }, [trigger]);
  useFrame((_, delta) => {
    if (!box.current || !star.current) return;
    time.current = Math.min(2, time.current + Math.min(delta, 0.05));
    const phase = time.current;
    box.current.position.y = reducedMotion
      ? 0
      : Math.sin(Math.min(phase / 0.6, 1) * Math.PI) * 0.3;
    box.current.rotation.y = reducedMotion
      ? 0.2
      : 0.2 + Math.sin(Math.min(phase / 0.6, 1) * Math.PI) * 0.18;
    star.current.visible = trigger > 0 && phase < 1.6;
    star.current.position.y = reducedMotion
      ? 0.85
      : 0.65 + Math.sin(Math.min(phase / 1.6, 1) * Math.PI) * 0.55;
    star.current.rotation.y = reducedMotion ? 0 : phase * 4;
  });
  return (
    <group position={[-3.4, 2.66, -5.85]} scale={0.78}>
      <group ref={box} rotation={[0, 0.2, 0]}>
        <Hotspot label={label} onActivate={onActivate}>
          <mesh castShadow>
            <boxGeometry args={[0.58, 0.58, 0.58]} />
            <meshStandardMaterial
              color="#d99536"
              roughness={0.62}
              emissive="#d07d22"
              emissiveIntensity={0.12}
            />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side} position={[0, 0, side * 0.3]}>
              <mesh>
                <planeGeometry args={[0.46, 0.46]} />
                <meshStandardMaterial color="#f2cc68" side={THREE.DoubleSide} />
              </mesh>
              {[
                [0, 0.11],
                [0.08, 0.11],
                [0.08, 0.03],
                [0, -0.04],
                [0, -0.17],
              ].map(([x, y], i) => (
                <mesh key={i} position={[x, y, side * 0.003]}>
                  <boxGeometry args={[0.063, 0.063, 0.014]} />
                  <meshStandardMaterial color="#80532c" />
                </mesh>
              ))}
            </group>
          ))}
        </Hotspot>
      </group>
      <group ref={star} visible={false}>
        <mesh>
          <boxGeometry args={[0.12, 0.43, 0.12]} />
          <meshBasicMaterial color="#ffe7a3" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.38, 0.12, 0.12]} />
          <meshBasicMaterial color="#ffe7a3" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.24, 0.27, 0.12]} />
          <meshBasicMaterial color="#ffe7a3" />
        </mesh>
      </group>
    </group>
  );
}

type RoomProps = {
  panel: StudyPanel | null;
  panelReady: boolean;
  studyLoaded: boolean;
  onOpen: (panel: StudyPanel) => void;
  onClosePanel: () => void;
  tacticsReset: number;
  night: boolean;
  lampOn: boolean;
  toy: number;
  lang: Language;
  tv: boolean;
  tvReady: boolean;
  game: GameId | null;
  onTV: () => void;
  onCloseTV: () => void;
  onGame: (game: GameId | null) => void;
  onSeat: () => void;
  onLamp: () => void;
  onNight: () => void;
  onToy: () => void;
  onArtwork: (id: string) => void;
};
function Room({
  panel,
  panelReady,
  studyLoaded,
  onOpen,
  onClosePanel,
  tacticsReset,
  night,
  lampOn,
  toy,
  lang,
  onLamp,
  onNight,
  onToy,
  onArtwork,
  tv,
  tvReady,
  game,
  onTV,
  onCloseTV,
  onGame,
  onSeat,
}: RoomProps) {
  const t = WORDS[lang];
  const maps = usePixelMaterials();
  const { reducedMotion } = useContext(InteractionContext);
  return (
    <>
      <color attach="background" args={[night ? '#172932' : '#a99d8b']} />

      <ambientLight
        intensity={night ? 0.26 : 0.65}
        color={night ? '#9baecb' : '#f7ead6'}
      />
      <directionalLight
        position={[5, 7, 1]}
        intensity={night ? 0.3 : 2.2}
        color={night ? '#a8c2e8' : '#fff0d2'}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
      />
      <pointLight
        position={[6.15, 4.2, 0.2]}
        intensity={night ? 5 : 13}
        distance={9}
        color={night ? '#819ee0' : '#c5e9e6'}
      />
      <RoomShell />
      <WoodenDoor />
      <Environment resolution={128}>
        <Lightformer
          intensity={1.4}
          color="#dce7e0"
          position={[6, 3, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[7, 6, 1]}
        />
        <Lightformer
          intensity={0.6}
          color="#eecb91"
          position={[-3, 4, 3]}
          scale={[4, 4, 1]}
        />
      </Environment>
      <DetailedPendant />
      <RoundedBox
        args={[8.05, 0.42, 3.62]}
        radius={0.1}
        position={[0, 1.03, 0.58]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial map={maps.walnut} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, 1.25, 0.58]}>
        <boxGeometry args={[7.7, 0.035, 3.28]} />
        <meshStandardMaterial map={maps.oak} color="#d3b084" roughness={0.7} />
      </mesh>
      {[
        [-3.4, -0.85],
        [3.4, -0.85],
        [-3.4, 1.22],
        [3.4, 1.22],
      ].map((p, index) => (
        <mesh key={index} position={[p[0], 0.5, p[1] + 0.58]} castShadow>
          <boxGeometry args={[0.24, 1.02, 0.24]} />
          <meshStandardMaterial color="#493226" />
        </mesh>
      ))}
      <Hotspot
        label={studyLabel('tactics', lang)}
        onActivate={() => onOpen('tactics')}
      >
        <FootballField
          active={panel === 'tactics' && panelReady}
          resetId={tacticsReset}
        />
      </Hotspot>
      <BrushDesk />
      <StudyDesk lang={lang} onOpen={onOpen} />
      <CabinetAndLamp on={lampOn} toggle={onLamp} label={t.lamp} />
      <Hotspot onActivate={onNight} label={night ? t.day : t.night}>
        <GardenWindow night={night} reducedMotion={reducedMotion} />
      </Hotspot>
      <Hotspot label={studyLabel('map', lang)} onActivate={() => onOpen('map')}>
        <WorldMap />
      </Hotspot>
      <Bookcase />
      <CollectionShelves />
      <DetailedGuitar />
      <StickyNotes lang={lang} onOpen={onOpen} />
      <Hotspot
        label={lang === 'zh' ? '坐在沙发上' : 'Sit on the sofa'}
        onActivate={onSeat}
      >
        <ReadingSofa />
      </Hotspot>
      <Hotspot
        label={lang === 'zh' ? '打开电视，玩一会儿' : 'Turn on the TV'}
        onActivate={onTV}
      >
        <RoomTelevision
          active={tv}
          ready={tvReady}
          game={game}
          lang={lang}
          reducedMotion={reducedMotion}
          onGame={onGame}
          onClose={onCloseTV}
        />
      </Hotspot>
      <SurpriseBlock trigger={toy} onActivate={onToy} label={t.toy} />
      {ARTWORKS.map((artwork) => (
        <WallPhoto
          key={artwork.id}
          artwork={artwork}
          onInspect={() => onArtwork(artwork.id)}
        />
      ))}
      {studyLoaded && (
        <Suspense fallback={null}>
          <StudyContent
            panel={tv || panel === 'tactics' || panel === 'map' ? null : panel}
            ready={panelReady}
            lang={lang}
            onClose={onClosePanel}
            onTV={onTV}
            onOpen={onOpen}
          />
        </Suspense>
      )}
      <ContactShadows
        position={[0, 0.02, 0]}
        opacity={0.42}
        scale={15}
        blur={2.1}
        far={9}
      />
    </>
  );
}

function SceneUnavailable({
  message,
  onFailure,
}: {
  message: string;
  onFailure: () => void;
}) {
  useEffect(() => {
    onFailure();
  }, [onFailure]);
  return <output className="room-loading">{message}</output>;
}

function SceneReady({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

export function HomeExperience({ lang }: { lang: Language }) {
  const [lifted, setLifted] = useState(false),
    [dismissed, setDismissed] = useState(false),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false);
  const [mode, setMode] = useState<ViewMode>('pointer'),
    [locked, setLocked] = useState(false),
    [crouching, setCrouching] = useState(false),
    [resetId, setResetId] = useState(0);
  const [night, setNight] = useState(false),
    [lampOn, setLampOn] = useState(true),
    [toy, setToy] = useState(0),
    [tip, setTip] = useState(''),
    [artId, setArtId] = useState<string | null>(null);
  const [tv, setTV] = useState(false),
    [tvReady, setTVReady] = useState(false),
    [game, setGame] = useState<GameId | null>(null),
    [seated, setSeated] = useState(false);
  const [panel, setPanel] = useState<StudyPanel | null>(null),
    [panelReady, setPanelReady] = useState(false),
    [studyLoaded, setStudyLoaded] = useState(false),
    [tacticsReset, setTacticsReset] = useState(0),
    [reducedMotion, setReducedMotion] = useState(false);
  const movement = useRef<MoveInput>({ x: 0, y: 0, z: 0 });
  const clearMovement = useCallback(() => {
    movement.current = { x: 0, y: 0, z: 0 };
  }, []);
  const markReady = useCallback(() => setReady(true), []),
    markFailed = useCallback(() => setFailed(true), []);
  const unlock = useCallback(() => {
    if (document.pointerLockElement) document.exitPointerLock();
  }, []);
  const lockFailure = useCallback(() => {
    setMode('drag');
    setLocked(false);
  }, []);
  const openArtwork = useCallback(
    (id: string) => {
      unlock();
      setPanel(null);
      setArtId(id);
      setTip('');
    },
    [unlock],
  );
  const guideShown = useRef(false);
  const [onboarding, setOnboarding] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const openPanel = useCallback(
    (next: StudyPanel) => {
      if (next === 'guide') guideShown.current = true;
      unlock();
      setArtId(null);
      setPanelReady(false);
      setPanel(next);
      if (next !== 'map' && next !== 'tactics') setStudyLoaded(true);
      setTip('');
      clearMovement();
    },
    [clearMovement, unlock],
  );
  useEffect(() => {
    if (
      !lifted ||
      !ready ||
      dismissed ||
      guideShown.current ||
      panel ||
      tv ||
      artId ||
      seated
    )
      return;
    const timer = setTimeout(() => {
      guideShown.current = true;
      unlock();
      clearMovement();
      setOnboarding(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [
    lifted,
    ready,
    dismissed,
    panel,
    tv,
    artId,
    seated,
    openPanel,
    unlock,
    clearMovement,
  ]);
  const closePanel = useCallback(() => {
    setPanel(null);
    setPanelReady(false);
    clearMovement();
  }, [clearMovement]);
  const openTV = useCallback(() => {
    unlock();
    setTVReady(false);
    setTV(true);
    setTip('');
    clearMovement();
  }, [clearMovement, unlock]);
  const closeTV = useCallback(() => {
    setGame(null);
    setTV(false);
    setTVReady(false);
    clearMovement();
  }, [clearMovement]);
  const toggleSeat = useCallback(() => {
    unlock();
    setArtId(null);
    setPanel(null);
    setSeated((v) => !v);
    setTip('');
    clearMovement();
  }, [clearMovement, unlock]);
  const onSettled = useCallback((id: string | null) => {
    setTVReady(id === 'television');
    setPanelReady(!!id && id !== 'television' && id !== 'seat');
  }, []);
  const t = WORDS[lang],
    typing = useTypewriter(t.intro, reducedMotion),
    artwork = ARTWORKS.find((a) => a.id === artId);
  const views = useMemo(
    () => [
      ...(seated ? [SOFA_VIEW] : []),
      ...(artwork ? [artwork] : []),
      ...(panel ? [STUDY_VIEWS[panel]] : []),
      ...(tv ? [TV_VIEW] : []),
    ],
    [seated, artwork, panel, tv],
  );
  const interactive =
    lifted && ready && !dismissed && !tv && !panel && !onboarding;
  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;
    const update = () =>
      toolbar
        .closest<HTMLElement>('.home-experience')
        ?.style.setProperty(
          '--welcome-top',
          `${toolbar.offsetTop + toolbar.offsetHeight + 16}px`,
        );
    const observer = new ResizeObserver(update);
    observer.observe(toolbar);
    update();
    return () => observer.disconnect();
  }, [lifted, ready, tv, panel, onboarding]);
  useEffect(() => {
    const q = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(q.matches);
    const frame = requestAnimationFrame(() => {
      update();
      if (matchMedia('(pointer: coarse)').matches) setMode('drag');
    });
    q.addEventListener('change', update);
    return () => {
      cancelAnimationFrame(frame);
      q.removeEventListener('change', update);
    };
  }, []);
  useEffect(() => {
    if (dismissed) return;
    const site = document.querySelector('main'),
      previous = document.body.style.overflow,
      wasInert = site?.inert ?? false;
    if (site) site.inert = true;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
      if (site) site.inert = wasInert;
    };
  }, [dismissed]);
  useEffect(() => {
    if (!dismissed) return;
    unlock();
    const timer = setTimeout(
      () => window.location.assign(`/${lang}/blog/`),
      reducedMotion ? 0 : 250,
    );
    return () => clearTimeout(timer);
  }, [dismissed, reducedMotion, unlock, lang]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (dismissed || e.repeat) return;
      const el = e.target as HTMLElement;
      if (e.key === 'Escape') {
        if (document.pointerLockElement) {
          document.exitPointerLock();
          return;
        }
        if (onboarding) {
          e.preventDefault();
          setOnboarding(false);
          return;
        }
        if (tv) {
          e.preventDefault();
          if (game) setGame(null);
          else closeTV();
        } else if (panel) {
          e.preventDefault();
          closePanel();
        } else if (artId) {
          setArtId(null);
        } else if (seated && !document.pointerLockElement) {
          toggleSeat();
        }
        return;
      }
      if (el?.closest('button,a,input,textarea,select,[role="dialog"]')) return;
      if (onboarding || views.length) return;
      if (e.code === 'KeyC') {
        e.preventDefault();
        setCrouching((v) => !v);
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        setDismissed(true);
      }
    };
    addEventListener('keydown', handler);
    return () => removeEventListener('keydown', handler);
  }, [
    dismissed,
    tv,
    game,
    panel,
    artId,
    seated,
    views.length,
    onboarding,
    closePanel,
    closeTV,
    toggleSeat,
  ]);
  const enterRoom = () => {
    setLifted(true);
    if (mode === 'pointer') {
      const canvas = document.querySelector<HTMLCanvasElement>(
        '.room-canvas canvas',
      );
      try {
        canvas?.requestPointerLock()?.catch(lockFailure);
      } catch {
        lockFailure();
      }
    }
  };
  const reset = () => {
    unlock();
    setArtId(null);
    setPanel(null);
    setTV(false);
    setGame(null);
    setSeated(false);
    setCrouching(false);
    setResetId((v) => v + 1);
    setTip('');
  };
  const hint =
    mode === 'pointer' ? roomGuide(lang)[0].text : roomGuide(lang)[1].text;
  return (
    <section
      className={[
        'home-experience',
        lifted ? 'lifted' : '',
        dismissed ? 'entered' : '',
        night ? 'is-night' : '',
        artwork ? 'is-inspecting' : '',
        tv ? 'is-watching-tv' : '',
        panel && panel !== 'tactics' && !tv ? 'is-using-study' : '',
        panel || tv || artwork || onboarding ? 'is-viewing-object' : '',
        seated ? 'is-seated' : '',
        tip ? 'has-hotspot' : '',
      ].join(' ')}
      aria-label={lang === 'zh' ? '我的互动房间' : 'My interactive room'}
    >
      {onboarding && (
        <RoomOnboarding
          lang={lang}
          onClose={() => {
            setOnboarding(false);
            clearMovement();
          }}
        />
      )}
      <div className="room-canvas">
        {
          <RoomBoundary message={t.fallback} onFailure={markFailed}>
            <Canvas
              shadows
              camera={{
                position: [0.35, 5.95, 4.45],
                fov: 49,
                near: 0.05,
                far: 150,
              }}
              dpr={[1, 1.75]}
              gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
              fallback={
                <SceneUnavailable message={t.fallback} onFailure={markFailed} />
              }
            >
              <InteractionContext.Provider
                value={{ enabled: interactive, reducedMotion, setTip }}
              >
                <RoomNavigation
                  lifted={lifted && ready}
                  mode={mode}
                  crouching={crouching}
                  onLockChange={setLocked}
                  onLockFailure={lockFailure}
                  onTip={setTip}
                  resetId={resetId}
                  paused={dismissed}
                  reducedMotion={reducedMotion}
                  movement={movement}
                  clearMovement={clearMovement}
                  views={views}
                  inputLocked={onboarding || views.length > 0}
                  onSettled={onSettled}
                />
                <Suspense fallback={null}>
                  <PixelMaterials>
                    <Room
                      panel={panel}
                      panelReady={panelReady}
                      studyLoaded={studyLoaded}
                      onOpen={openPanel}
                      onClosePanel={closePanel}
                      tacticsReset={tacticsReset}
                      tv={tv}
                      tvReady={tvReady}
                      game={game}
                      onTV={openTV}
                      onCloseTV={closeTV}
                      onGame={setGame}
                      onSeat={toggleSeat}
                      night={night}
                      lampOn={lampOn}
                      toy={toy}
                      lang={lang}
                      onLamp={() => setLampOn((v) => !v)}
                      onNight={() => setNight((v) => !v)}
                      onToy={() => setToy((v) => v + 1)}
                      onArtwork={openArtwork}
                    />
                  </PixelMaterials>
                  <SceneReady onReady={markReady} />
                </Suspense>
              </InteractionContext.Provider>
            </Canvas>
          </RoomBoundary>
        }
      </div>
      {!ready && !failed && (
        <output className="room-loading">{t.loading}</output>
      )}
      {!lifted && (
        <button
          className="room-look-control"
          aria-label={t.click}
          onClick={enterRoom}
        />
      )}
      <div className="room-pixel-overlay" aria-hidden="true" />
      <div className="room-vignette" aria-hidden="true" />
      <div className={`intro-type ${typing.done ? 'is-done' : ''}`}>
        <h1 aria-label={t.intro.join('. ')}>
          <span aria-hidden="true">
            {typing.out[0]}
            {!typing.done && typing.activeLine === 0 && <i />}
          </span>
          <span aria-hidden="true">
            {typing.out[1]}
            {!typing.done && typing.activeLine === 1 && <i />}
          </span>
        </h1>
      </div>
      {!panel && !tv && (
        <a className="room-language" href={lang === 'en' ? '/zh/' : '/'}>
          <Globe2 />
          {lang === 'en' ? '中文' : 'EN'}
        </a>
      )}
      {ready && !tv && !panel && (
        <>
          <div
            ref={toolbarRef}
            inert={!lifted}
            aria-hidden={!lifted}
            style={{ visibility: lifted ? 'visible' : 'hidden' }}
            className="room-toolbar"
            role="toolbar"
            aria-label={t.help}
          >
            <div className="room-view-toggle">
              <button
                aria-pressed={mode === 'pointer'}
                onClick={() => {
                  setMode('pointer');
                  setTip('');
                }}
              >
                {lang === 'zh' ? '鼠标' : 'Mouse'}
              </button>
              <button
                aria-pressed={mode === 'drag'}
                onClick={() => {
                  setMode('drag');
                  unlock();
                  setTip('');
                }}
              >
                {lang === 'zh' ? '拖动' : 'Drag'}
              </button>
            </div>
            <button aria-label={t.reset} title={t.reset} onClick={reset}>
              <RotateCcw />
            </button>
            <button
              disabled={views.length > 0}
              aria-label={lang === 'zh' ? '站立 / 蹲下' : 'Stand / crouch'}
              aria-pressed={crouching}
              onClick={() => setCrouching((v) => !v)}
            >
              <PersonStanding />
            </button>
            <button
              aria-label={night ? t.day : t.night}
              onClick={() => setNight((v) => !v)}
            >
              {night ? <Moon /> : <Sun />}
            </button>
            <button aria-label={t.lamp} onClick={() => setLampOn((v) => !v)}>
              <Lamp />
            </button>
            <button
              aria-label={t.artwork}
              onClick={() => openArtwork('tagore')}
            >
              <Images />
            </button>
            <button
              aria-label={studyLabel('map', lang)}
              onClick={() => openPanel('map')}
            >
              <MapIcon />
            </button>
            <button
              aria-label={studyLabel('writing', lang)}
              onClick={() => openPanel('writing')}
            >
              <BookOpen />
            </button>
            <button
              aria-label={studyLabel('computer', lang)}
              onClick={() => openPanel('computer')}
            >
              <Monitor />
            </button>
            <button
              aria-label={studyLabel('tactics', lang)}
              onClick={() => openPanel('tactics')}
            >
              ⚽
            </button>
            <button
              aria-label={lang === 'zh' ? '打开电视' : 'Watch TV'}
              onClick={openTV}
            >
              <Tv />
            </button>
            <button
              aria-label={lang === 'zh' ? '沙发坐姿' : 'Sofa view'}
              aria-pressed={seated}
              onClick={toggleSeat}
            >
              <Armchair />
            </button>
            <button
              aria-label={studyLabel('suggestions', lang)}
              onClick={() => openPanel('suggestions')}
            >
              <NotebookPen />
            </button>
            <button aria-label={t.help} onClick={() => openPanel('guide')}>
              <HelpCircle />
            </button>
          </div>
          {lifted && !views.length && !onboarding && (
            <>
              <RoomJoystick movement={movement} lang={lang} />
              {locked && (
                <span className="room-crosshair" aria-hidden="true">
                  +
                </span>
              )}
              {mode === 'pointer' && !locked && (
                <p className="room-lock-hint">
                  {lang === 'zh'
                    ? '点击房间恢复鼠标视角 · Esc 释放'
                    : 'Click the room to capture mouse · Esc releases'}
                </p>
              )}
            </>
          )}
        </>
      )}
      {artwork && !tv && !panel && (
        <aside className="room-focus-panel" aria-label={t.artwork}>
          <div>
            <p>{artwork.title}</p>
            <button aria-label={t.close} onClick={() => setArtId(null)}>
              <X />
            </button>
          </div>
          <nav aria-label={t.artwork}>
            {ARTWORKS.map((a) => (
              <button
                key={a.id}
                aria-pressed={a.id === artId}
                onClick={() => openArtwork(a.id)}
              >
                {a.id === 'tagore' ? 'Stray Birds' : a.title}
              </button>
            ))}
          </nav>
        </aside>
      )}
      {panel === 'map' && !tv && (
        <aside
          className="room-focus-panel"
          aria-label={studyLabel('map', lang)}
        >
          <div>
            <p>
              {lang === 'zh'
                ? '世界地图 · 标记位于中国大陆'
                : 'World map · Mainland China marker'}
            </p>
            <button aria-label={t.close} onClick={closePanel}>
              <X />
            </button>
          </div>
        </aside>
      )}
      {panel === 'tactics' && !tv && (
        <fieldset
          className="tactics-controls"
          aria-label={studyLabel('tactics', lang)}
        >
          <span>
            {lang === 'zh'
              ? '拖动磁粒 / 足球 · 松手继续滚动'
              : 'Drag magnets / ball · Release to roll'}
          </span>
          <button onClick={() => setTacticsReset((v) => v + 1)}>
            {lang === 'zh' ? '复位阵型' : 'Reset formation'}
          </button>
          <button onClick={closePanel}>{t.close}</button>
        </fieldset>
      )}
      {panel && !panelReady && !tv && (
        <button className="study-pending" onClick={closePanel}>
          {lang === 'zh' ? '正在靠近… · 返回' : 'Moving closer… · Return'}
        </button>
      )}
      {seated && !tv && !artwork && !panel && (
        <button className="room-seat-return" onClick={toggleSeat}>
          {lang === 'zh' ? '起身 · 返回原视角' : 'Stand up · Return'}
        </button>
      )}
      {!panel && !tv && (
        <p className="room-hint">{tip || (lifted ? hint : t.click)}</p>
      )}
      <button
        disabled={onboarding || tv || !!panel}
        className="enter-reading show"
        onClick={() => setDismissed(true)}
      >
        <kbd>↵</kbd>
        {t.enter}
      </button>
    </section>
  );
}
function RoomJoystick({
  movement,
  lang,
}: {
  movement: React.RefObject<MoveInput>;
  lang: Language;
}) {
  const [dot, setDot] = useState({ x: 0, y: 0 });
  const pointer = useRef<number | null>(null);
  const clear = () => {
    pointer.current = null;
    Object.assign(movement.current, { x: 0, z: 0 });
    setDot({ x: 0, y: 0 });
  };
  useEffect(() => {
    const input = movement.current;
    const reset = () => {
      Object.assign(input, { x: 0, z: 0 });
      pointer.current = null;
      setDot({ x: 0, y: 0 });
    };
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('blur', reset);
      Object.assign(input, { x: 0, z: 0 });
    };
  }, [movement]);
  const move = (e: React.PointerEvent<HTMLFieldSetElement>) => {
    if (pointer.current !== e.pointerId) return;
    const r = e.currentTarget.getBoundingClientRect();
    let x = (e.clientX - r.x - r.width / 2) / 40,
      y = (e.clientY - r.y - r.height / 2) / 40;
    const len = Math.max(1, Math.hypot(x, y));
    x /= len;
    y /= len;
    Object.assign(movement.current, { x, z: -y });
    setDot({ x: x * 30, y: y * 30 });
  };
  return (
    <fieldset
      className="room-joystick"
      aria-label={lang === 'zh' ? '移动摇杆' : 'Movement joystick'}
      onPointerDown={(e) => {
        e.preventDefault();
        pointer.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={move}
      onPointerUp={clear}
      onPointerCancel={clear}
      onLostPointerCapture={clear}
    >
      <span style={{ transform: `translate(${dot.x}px,${dot.y}px)` }} />
      {[
        [ArrowUp, 'z', 1],
        [ArrowDown, 'z', -1],
        [ArrowLeft, 'x', -1],
        [ArrowRight, 'x', 1],
      ].map(([Icon, axis, value], i) => {
        const Symbol = Icon as typeof ArrowUp;
        return (
          <button
            key={i}
            className="sr-only"
            aria-label={['Forward', 'Back', 'Left', 'Right'][i]}
            onKeyDown={() => {
              Object.assign(movement.current, { [axis as string]: value });
            }}
            onKeyUp={clear}
            onBlur={clear}
          >
            <Symbol />
          </button>
        );
      })}
    </fieldset>
  );
}
