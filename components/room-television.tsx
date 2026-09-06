'use client';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Html, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Language } from '@/lib/content';
import { gameCatalogue } from '@/lib/games';
import type { GameId } from '@/lib/games';
import { usePixelMaterials } from './room-materials';

const Snake = lazy(() => import('./snake-game').then(m => ({ default: m.SnakeGame })));
const Starflight = lazy(() => import('./starflight-game').then(m => ({ default: m.StarflightGame })));
export const TV_VIEW = { id: 'television', position: [.55, 1.99, -5.115] as [number,number,number], width: 2.08, height: 1.56, padding: 1.18 };
export const SOFA_VIEW = { id: 'seat', position: [.55, 1.99, -5.115] as [number,number,number], eye: [.35, 1.92, 4.78] as [number,number,number], width: 2.08, height: 1.56 };

function Speaker({ x }: { x: number }) {
  const maps = usePixelMaterials();
  return <group position={[x,1.365,0]}>
    <RoundedBox args={[.5,1.0,.57]} radius={.022} smoothness={1} castShadow><meshStandardMaterial map={maps.walnut} roughness={.7} /></RoundedBox>
    <mesh position={[0,0,.293]}><boxGeometry args={[.43,.92,.025]} /><meshStandardMaterial color="#282b26" /></mesh>
    {[[-.17,.155],[.24,.072]].map(([y,r])=><group key={y} position={[0,y,.315]}>
      <mesh><torusGeometry args={[r,.016,6,24]} /><meshStandardMaterial color="#747567" metalness={.35} roughness={.6} /></mesh>
      <mesh><circleGeometry args={[r,24]} /><meshStandardMaterial color="#151c19" roughness={.9} /></mesh>
      <mesh position={[0,0,.008]}><sphereGeometry args={[r*.4,12,8,0,Math.PI*2,0,Math.PI/2]} /><meshStandardMaterial color="#393e35" roughness={.6} /></mesh>
    </group>)}
    <mesh position={[0,0,.337]}><planeGeometry args={[.405,.88]} /><meshStandardMaterial map={maps.cloth} color="#41483d" transparent opacity={.3} roughness={1} depthWrite={false} /></mesh>
    {Array.from({length:21},(_,i)=><mesh key={i} position={[-.195+i*.0195,0,.34]}><boxGeometry args={[.003,.88,.004]} /><meshStandardMaterial color="#8b8d74" transparent opacity={.28} /></mesh>)}
    <mesh position={[0,-.39,.347]}><boxGeometry args={[.065,.021,.007]} /><meshStandardMaterial color="#b9aa77" metalness={.3} /></mesh>
  </group>;
}

function TelevisionUI({ lang, game, onGame, onClose, ready }: { lang: Language; game: GameId | null; onGame: (game: GameId | null) => void; onClose: () => void; ready: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ready) return;
    const surface = root.current;
    const buttons = () => Array.from(surface?.querySelectorAll<HTMLButtonElement>('button:not([disabled]), canvas') ?? []);
    buttons()[0]?.focus({preventScroll:true});
    const tab = (event: KeyboardEvent) => {
      if(event.key !== 'Tab') return;
      event.preventDefault();
      const controls = buttons(), index = controls.indexOf(document.activeElement as HTMLButtonElement);
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus({preventScroll:true});
    };
    document.addEventListener('keydown',tab,true);
    return () => document.removeEventListener('keydown',tab,true);
  }, [ready, game]);
  return <section ref={root} className="tv-screen-ui" aria-label={lang === 'zh' ? '电视游戏机' : 'Television arcade'} inert={!ready}
    onPointerDown={e=>e.stopPropagation()} onPointerMove={e=>e.stopPropagation()} onPointerUp={e=>e.stopPropagation()} onWheel={e=>e.stopPropagation()}>
    <header><span>CRAZY / PLAY</span><button onClick={game ? ()=>onGame(null) : onClose}>{game ? (lang==='zh' ? '← 菜单' : '← Menu') : (lang==='zh' ? '关机' : 'Power off')}</button></header>
    {game ? <Suspense fallback={<div className="tv-loading">{lang==='zh'?'载入游戏…':'Loading…'}</div>}>
      {game==='snake' ? <Snake lang={lang} presentation="tv" inputEnabled={ready} /> : <Starflight lang={lang} presentation="tv" inputEnabled={ready} />}
    </Suspense> : <div className="tv-menu">
      <p>{lang==='zh'?'挑一个，玩一会儿':'Take a little play break'}</p>
      <div>{gameCatalogue(lang).map(item=><button key={item.slug} onClick={()=>onGame(item.slug)}><span className="tv-menu-art" aria-hidden="true">{item.art}</span><strong>{item.title}</strong><small>{item.controls}</small></button>)}</div>
      <footer>{lang==='zh'?'方向键或触屏操作 · Esc 返回房间':'Keyboard or touch · Esc returns to room'}</footer>
    </div>}
  </section>;
}
export function RoomTelevision({ active, ready, game, lang, reducedMotion, onGame, onClose }: { active: boolean; ready: boolean; game: GameId | null; lang: Language; reducedMotion: boolean; onGame: (game: GameId | null)=>void; onClose: ()=>void }) {
  const maps=usePixelMaterials();
  const [showScreen, setShowScreen] = useState(active);
  useEffect(() => {
    if (active) { const frame = requestAnimationFrame(() => setShowScreen(true)); return () => cancelAnimationFrame(frame); }
    const timer = setTimeout(() => setShowScreen(false), reducedMotion ? 0 : 450);
    return () => clearTimeout(timer);
  }, [active, reducedMotion]);
  const screen=useRef<THREE.MeshStandardMaterial>(null), light=useRef<THREE.PointLight>(null);
  const glow=useRef(0);
  useFrame((_,delta)=>{
    glow.current=reducedMotion ? Number(active) : THREE.MathUtils.damp(glow.current,Number(active),5,Math.min(delta,.05));
    if(screen.current) screen.current.emissiveIntensity=.04+glow.current*.6;
    if(light.current) light.current.intensity=glow.current*1.7;
  });
  return <group name="television-area" position={[.55,0,-5.65]}>
    {/* Thin shelves, recessed back, visible joinery and short inset legs. */}
    {[.27,.81].map(y=><mesh key={y} position={[0,y,0]} castShadow receiveShadow><boxGeometry args={[4.25,.11,1.02]} /><meshStandardMaterial map={maps.oak} color="#e5c091" roughness={.72} /></mesh>)}
    {[-2.04,0,2.04].map(x=><mesh key={x} position={[x,.54,0]} castShadow><boxGeometry args={[.09,.45,.91]} /><meshStandardMaterial map={maps.walnut} color="#d5b990" /></mesh>)}
    <mesh position={[0,.53,-.43]}><boxGeometry args={[4.1,.45,.055]} /><meshStandardMaterial map={maps.walnut} roughness={.85} /></mesh>
    {[-1.88,1.88].flatMap(x=>[-.33,.33].map(z=><mesh key={`${x}${z}`} position={[x,.13,z]} castShadow><boxGeometry args={[.12,.24,.12]} /><meshStandardMaterial map={maps.walnut} /></mesh>))}
    {[-1.98,1.98].flatMap(x=>[.28,.79].map(y=><mesh key={`${x}${y}`} position={[x,y,.52]}><circleGeometry args={[.015,8]} /><meshStandardMaterial color="#624c34" /></mesh>))}
    <group position={[-.99,.455,.1]}>
      <RoundedBox args={[1.65,.26,.65]} radius={.016} smoothness={1} castShadow><meshStandardMaterial color="#393d36" metalness={.4} roughness={.5} /></RoundedBox>
      <mesh position={[-.25,.008,.337]}><planeGeometry args={[.69,.085]} /><meshStandardMaterial color="#142c25" emissive="#77ac7a" emissiveIntensity={.22} /></mesh>
      {[-.49,-.36,-.23,-.1].map(x=><mesh key={x} position={[x,.01,.34]}><planeGeometry args={[.042,.026]} /><meshBasicMaterial color="#83ad7c" /></mesh>)}
      <mesh position={[.56,0,.35]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.081,.081,.05,20]} /><meshStandardMaterial color="#b4b8a3" metalness={.65} roughness={.35} /></mesh>
      {[.19,.28].map(x=><mesh key={x} position={[x,-.028,.34]}><boxGeometry args={[.04,.045,.024]} /><meshStandardMaterial color="#a6a98f" /></mesh>)}
    </group>
    {['#8a4736','#b69c63','#627975'].map((color,i)=><mesh key={color} position={[.72+i*.21,.45,.13]} rotation={[0,0,-.1+i*.08]}><boxGeometry args={[.16,.27,.56]} /><meshStandardMaterial map={maps.paper} color={color} /></mesh>)}
    <Speaker x={-1.73} /><Speaker x={1.73} />
    {[-.8,.8].map(x=><mesh key={x} position={[x,.925,0]} castShadow><boxGeometry args={[.25,.12,.55]} /><meshStandardMaterial color="#282b25" /></mesh>)}
    <RoundedBox name="television-body" args={[2.65,2.04,1.02]} position={[0,2.005,-.025]} radius={.12} smoothness={2} castShadow><meshStandardMaterial map={maps.plaster} color="#595e4b" roughness={.68} /></RoundedBox>
    <RoundedBox args={[2.43,1.83,.095]} position={[0,2.04,.505]} radius={.09} smoothness={2}><meshStandardMaterial color="#272d26" roughness={.7} /></RoundedBox>
    <mesh position={[0,1.99,.535]}><planeGeometry args={[2.08,1.56]} /><meshStandardMaterial ref={screen} color="#1c302c" emissive="#8bc5ab" emissiveIntensity={.04} roughness={.2} metalness={.2} /></mesh>
    {[-.94,-.81,-.68].map(x=><mesh key={x} position={[x,1.105,.55]}><boxGeometry args={[.075,.038,.04]} /><meshStandardMaterial color="#aaa78c" metalness={.35} /></mesh>)}
    <mesh position={[.98,1.105,.56]}><circleGeometry args={[.025,12]} /><meshBasicMaterial color={active ? '#9addab' : '#bc6b48'} /></mesh>
    {Array.from({length:14},(_,i)=><mesh key={i} position={[.25+i*.034,1.105,.56]}><boxGeometry args={[.012,.055,.008]} /><meshStandardMaterial color="#161e19" /></mesh>)}
    <pointLight ref={light} position={[0,1.52,1.02]} color="#a7d3b6" intensity={0} distance={3.1} decay={2} />
    {showScreen && <Html transform position={[0,1.99,.54]} distanceFactor={1.04} zIndexRange={[6,5]} style={{pointerEvents:ready ? 'auto' : 'none'}}>
      <div className="tv-power-surface" data-powered={active} style={{opacity:active ? 1 : 0}}>
        <TelevisionUI lang={lang} game={active ? game : null} onGame={onGame} onClose={onClose} ready={ready && active} />
      </div>
    </Html>}
  </group>;
}
