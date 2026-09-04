'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Html, RoundedBox } from '@react-three/drei';
import { Globe2, Moon, Send, Sun, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import Image from 'next/image';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Language, Post } from '@/lib/content';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';

const WORDS = {
  en: {
    intro: ['Hey, I am Zachary Cheng', 'Welcome to crazyczy.com'],
    click: 'Click anywhere to lift your eyes', explore: 'Move your pointer to look around', enter: 'Press Enter to read',
    nav: ['Home', 'Writing', 'About'], suggestions: 'Suggestions', latest: 'Latest from the room',
    eyebrow: 'FIELD NOTES · 2026', title: 'Things I write when the rain stays.',
    deck: 'Essays on technology and culture, small poems, and the occasional note about football, music, or finding a place in the world.',
    tabs: ['Articles', 'Essays', 'Poems'], empty: ['Long-form technical writing lives here.','Personal essays are gathering here.','The poems are still drying by the window.'],
    read: 'Read piece', suggestionTitle: 'Kind words & honest notes', suggestionDeck: 'The three newest notes and the most valued ones rise to the top.',
    placeholder: 'Write a suggestion…', send: 'Leave note', limit: 'Up to two notes per day.', close: 'Close',
  },
  zh: {
    intro: ['嗨，我是程致远', '欢迎来到 crazyczy.com'],
    click: '点击任意位置，抬头看看', explore: '移动鼠标，环顾房间', enter: '按回车开始阅读',
    nav: ['首页', '写作', '关于'], suggestions: '留言', latest: '房间里的新文字',
    eyebrow: '随身札记 · 2026', title: '雨一直下的时候，我写这些。',
    deck: '关于技术与文化的随笔、一些小诗，偶尔也写足球、音乐，以及一个人如何在世界上找到自己的位置。',
    tabs: ['文章', '随笔', '诗歌'], empty: ['长篇技术文章放在这里。','新的随笔正在路上。','诗还在窗边晾干。'],
    read: '阅读全文', suggestionTitle: '善意与真话', suggestionDeck: '最新三条和最受认可的留言会浮到上面。',
    placeholder: '写下一条留言…', send: '留下', limit: '每天最多两条。', close: '关闭',
  },
};

type HomePost = Pick<Post, 'slug' | 'title' | 'description' | 'publishDate' | 'tags'>;
type Note = { id: string; name: string; text: string; score: number; createdAt: number };

function useTypewriter(lines: string[], enabled: boolean) {
  const [out, setOut] = useState(['', '']);
  const [line, setLine] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let row = 0;
    let char = 0;
    let timer: ReturnType<typeof setTimeout>;
    queueMicrotask(() => { setOut(['', '']); setLine(0); setDone(false); });
    const type = () => {
      if (cancelled) return;
      if (char < lines[row].length) {
        char += 1;
        setOut((old) => old.map((value, index) => index === row ? lines[row].slice(0, char) : value));
        timer = setTimeout(type, 58 + Math.random() * 54);
      } else if (row === 0) {
        timer = setTimeout(() => { row = 1; char = 0; setLine(1); type(); }, 720);
      } else setDone(true);
    };
    timer = setTimeout(type, 420);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [enabled, lines]);
  return { out, line, done };
}

function FootballField() {
  const ball = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector2(.016, .012));
  useFrame((_, delta) => {
    if (!ball.current) return;
    ball.current.position.x += velocity.current.x * delta * 19;
    ball.current.position.z += velocity.current.y * delta * 19;
    if (Math.abs(ball.current.position.x) > 1.65) velocity.current.x *= -1;
    if (Math.abs(ball.current.position.z) > .97) velocity.current.y *= -1;
    ball.current.rotation.x += delta * 2.8;
    ball.current.rotation.z += delta * 2.2;
    if (Math.random() < .004) velocity.current.rotateAround(new THREE.Vector2(), (Math.random() - .5) * .7);
  });
  return <group position={[.38, 1.27, .15]}>
    <RoundedBox args={[4.35, .18, 2.65]} radius={.12} castShadow receiveShadow><meshStandardMaterial color="#173b29" roughness={.92} /></RoundedBox>
    {[-1.62, -.54, .54, 1.62].map((x, i) => <mesh key={x} position={[x, .1, 0]} receiveShadow><boxGeometry args={[1.08, .015, 2.4]} /><meshStandardMaterial color={i % 2 ? '#367848' : '#2a673d'} /></mesh>)}
    <mesh position={[0, .12, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.34, .36, 48]} /><meshBasicMaterial color="#f0efe5" /></mesh>
    <mesh position={[0, .12, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.022, 2.4]} /><meshBasicMaterial color="#f0efe5" /></mesh>
    {[-1, 1].map((side) => <group key={side} position={[side * 1.97, .31, 0]}><mesh><boxGeometry args={[.35, .52, 1]} /><meshStandardMaterial color="#e8e4d9" wireframe /></mesh></group>)}
    <mesh ref={ball} position={[.2, .3, .1]} castShadow><sphereGeometry args={[.14, 20, 20]} /><meshStandardMaterial color="#f4f1e8" roughness={.65} /></mesh>
  </group>;
}

function BrushSet() {
  return <group position={[-3.2, 1.32, .1]} rotation={[0, .1, 0]}>
    <mesh castShadow><cylinderGeometry args={[.32, .38, .1, 24]} /><meshStandardMaterial color="#171514" /></mesh>
    <mesh position={[0, .07, 0]}><cylinderGeometry args={[.22, .25, .04, 24]} /><meshStandardMaterial color="#050505" /></mesh>
    {[-.25, .08].map((x, i) => <group key={x} position={[x, .35, .05]} rotation={[0, 0, -.45 + i * .24]}><mesh><cylinderGeometry args={[.025, .025, .86, 10]} /><meshStandardMaterial color={i ? '#7c3124' : '#ad7b3f'} /></mesh><mesh position={[0, -.53, 0]}><coneGeometry args={[.07, .22, 10]} /><meshStandardMaterial color="#161311" /></mesh></group>)}
    <mesh position={[.72, -.01, .02]} rotation={[-Math.PI / 2, 0, -.08]}><planeGeometry args={[1.1, .8]} /><meshStandardMaterial color="#eee3ca" /></mesh>
  </group>;
}

function Cabinet() {
  return <group position={[-4.15, 1.05, -3.2]}>
    <RoundedBox args={[2.7, 1.45, .75]} radius={.07} castShadow><meshStandardMaterial color="#76472b" /></RoundedBox>
    {[-.62, .62].map((x) => <mesh key={x} position={[x, 0, .39]}><sphereGeometry args={[.055, 12, 12]} /><meshStandardMaterial color="#d8a74d" metalness={.7} /></mesh>)}
    {[-.7, 0, .7].map((x, i) => <group key={x} position={[x, 1.05, 0]} rotation={[.1, i * .35, .08]}>
      {[0, .17, .34].map((y, j) => <mesh key={y} position={[0, y, 0]}><boxGeometry args={[.48, .15, .48]} /><meshStandardMaterial color={[['#e8cf45', '#3570a8', '#bd4739'], ['#ece9df', '#c96030', '#287b55'], ['#684792', '#e1b93f', '#2c8099']][i][j]} /></mesh>)}
    </group>)}
    {[-1.05, 1.03].map((x) => <group key={x} position={[x, 1.13, 0]}><mesh position={[0, .2, 0]}><cylinderGeometry args={[.16, .27, .4, 16]} /><meshStandardMaterial color="#c99d45" metalness={.65} /></mesh><mesh position={[0, .52, 0]}><sphereGeometry args={[.2, 16, 16]} /><meshStandardMaterial color="#d9b35d" metalness={.75} /></mesh></group>)}
  </group>;
}

function WallPhoto({ position, rotation = 0, src, alt, large = false }: { position: [number, number, number]; rotation?: number; src: string; alt: string; large?: boolean }) {
  return <group position={position} rotation={[0, 0, rotation]}>
    <RoundedBox args={[large ? 2.25 : 1.58, large ? 2.7 : 1.95, .1]} radius={.03} castShadow><meshStandardMaterial color="#33271f" /></RoundedBox>
    <Html transform position={[0, 0, .061]} distanceFactor={5.85} style={{ pointerEvents: 'none' }}>
      <div className={`room-photo ${large ? 'large' : ''}`}><Image src={src} alt={alt} fill sizes={large ? '162px' : '114px'} /><span>{alt}</span></div>
    </Html>
  </group>;
}

function RainWindow() {
  const drops = useMemo(() => Array.from({ length: 66 }, (_, index) => ({
    x: ((index * 37) % 97) / 96 * 4.8 - 2.4,
    y: ((index * 53) % 89) / 88 * 3.5 - 1.75,
    speed: .65 + ((index * 29) % 41) / 41,
  })), []);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((_, delta) => refs.current.forEach((drop, index) => { if (!drop) return; drop.position.y -= delta * drops[index].speed; if (drop.position.y < -1.75) drop.position.y = 1.75; }));
  return <group position={[4.42, 3.05, .15]} rotation={[0, -Math.PI / 2, 0]}>
    <mesh><planeGeometry args={[5.2, 4.15]} /><meshStandardMaterial color="#89aba4" transparent opacity={.52} /></mesh>
    <mesh position={[0, -1.42, -.04]}><planeGeometry args={[5.2, 1.2]} /><meshStandardMaterial color="#637c65" /></mesh>
    {[[-1.55, -.6, .75], [0, -.72, 1], [1.55, -.55, .66]].map((v, i) => <group key={i} position={[v[0], v[1], -.02]}><mesh position={[0, .45, 0]}><cylinderGeometry args={[.06, .18, 1.2, 8]} /><meshStandardMaterial color="#4b4a36" /></mesh><mesh position={[0, .95, 0]} scale={[v[2], .45, 1]}><sphereGeometry args={[.75, 12, 9]} /><meshStandardMaterial color={i === 1 ? '#416847' : '#53764d'} /></mesh></group>)}
    {[-1.28, 0, 1.28].map((x) => <mesh key={x} position={[x, 0, .04]}><boxGeometry args={[.06, 4.25, .06]} /><meshStandardMaterial color="#392e26" /></mesh>)}
    {drops.map((drop, i) => <mesh ref={(node) => { refs.current[i] = node; }} key={i} position={[drop.x, drop.y, .08]}><planeGeometry args={[.018, .13]} /><meshBasicMaterial color="#edf7f6" transparent opacity={.6} /></mesh>)}
  </group>;
}

function WorldMap() {
  const lands = [[-1.25, .28, .75, .42], [-.76, .38, .45, .56], [-.15, .45, .55, .38], [.5, .38, 1.18, .48], [1.34, .13, .38, .34], [-.2, -.22, .38, .55], [.46, -.25, .48, .66], [1.42, -.35, .3, .2]];
  return <group position={[-4.48, 3.8, -.3]} rotation={[0, Math.PI / 2, 0]}>
    <RoundedBox args={[3.85, 2.28, .08]} radius={.04}><meshStandardMaterial color="#a58154" /></RoundedBox>
    <mesh position={[0, 0, .05]}><planeGeometry args={[3.62, 2.05]} /><meshStandardMaterial color="#9fbdb4" /></mesh>
    {lands.map((p, i) => <RoundedBox key={i} args={[p[2], p[3], .02]} radius={.06} position={[p[0], p[1], .075]} rotation={[0, 0, (i % 3 - 1) * .16]}><meshStandardMaterial color={i % 2 ? '#a18146' : '#71834a'} /></RoundedBox>)}
    <Html transform position={[.78, .38, .1]} distanceFactor={5}><span className="map-pin">📍</span></Html>
  </group>;
}

function Room({ lifted, look }: { lifted: boolean; look: { current: { x: number; y: number } } }) {
  const { camera } = useThree();
  useFrame((_, delta) => {
    const target = lifted ? new THREE.Vector3(look.current.x * .45, 3.2 + look.current.y * .2, 7.7) : new THREE.Vector3(.1, 6.05, 5.15);
    camera.position.lerp(target, 1 - Math.pow(.004, delta));
    camera.lookAt(look.current.x * .5, lifted ? 2.25 : 1.15, lifted ? -1.4 : 0);
  });
  return <>
    <color attach="background" args={['#b8ad9c']} /><fog attach="fog" args={['#b8ad9c', 11, 23]} />
    <ambientLight intensity={1.4} /><directionalLight position={[-3, 8, 5]} intensity={2.2} color="#fff0d2" castShadow />
    <mesh position={[0, -.07, 0]} receiveShadow><boxGeometry args={[10, .15, 12]} /><meshStandardMaterial color="#7c624c" roughness={.95} /></mesh>
    <mesh position={[0, 3.2, -4]} receiveShadow><boxGeometry args={[10, 6.5, .12]} /><meshStandardMaterial color="#d6c9b7" /></mesh>
    <mesh position={[-5, 3.2, 0]}><boxGeometry args={[.12, 6.5, 8]} /><meshStandardMaterial color="#c8b9a4" /></mesh>
    <mesh position={[5, 3.2, 0]}><boxGeometry args={[.12, 6.5, 8]} /><meshStandardMaterial color="#b7a78f" /></mesh>
    <RoundedBox args={[8.1, .42, 3.65]} radius={.12} position={[0, 1, .55]} castShadow receiveShadow><meshStandardMaterial color="#704d38" roughness={.62} /></RoundedBox>
    {[[-3.42, -.85], [3.42, -.85], [-3.42, 1.18], [3.42, 1.18]].map((p, i) => <mesh key={i} position={[p[0], .48, p[1] + .55]}><boxGeometry args={[.24, 1, .24]} /><meshStandardMaterial color="#493226" /></mesh>)}
    <FootballField /><BrushSet /><Cabinet /><RainWindow /><WorldMap />
    <group position={[0, 1.05, 2.8]} rotation={[0, Math.PI, 0]}><RoundedBox args={[3.3, 1.05, 1.55]} radius={.42} castShadow><meshStandardMaterial color="#c75f31" /></RoundedBox><RoundedBox args={[2.65, .82, 1.3]} radius={.36} position={[0, .55, 0]} rotation={[-.12, 0, 0]}><meshStandardMaterial color="#d36939" /></RoundedBox></group>
    <group position={[-2.35, 0, -3.28]}><mesh position={[0, 1.55, 0]}><cylinderGeometry args={[.035, .045, 3.1, 10]} /><meshStandardMaterial color="#302a25" /></mesh><mesh position={[0, .05, 0]}><cylinderGeometry args={[.42, .48, .1, 22]} /><meshStandardMaterial color="#302a25" /></mesh><mesh position={[0, 2.9, 0]}><coneGeometry args={[.58, .78, 24, 1, true]} /><meshStandardMaterial color="#efc879" emissive="#ee9f38" emissiveIntensity={1.1} side={THREE.DoubleSide} /></mesh><pointLight position={[0, 2.7, .3]} intensity={26} distance={7} color="#ffb35d" /></group>
    <group position={[3.75, 1.25, -3.3]} rotation={[0, 0, -.08]}><mesh position={[0, .6, 0]}><cylinderGeometry args={[.16, .16, 2.05, 14]} /><meshStandardMaterial color="#3e2418" /></mesh><mesh position={[0, -.48, 0]} scale={[.78, 1, .24]}><sphereGeometry args={[.7, 28, 28]} /><meshStandardMaterial color="#b96b3d" /></mesh><mesh position={[0, -.3, .18]}><circleGeometry args={[.17, 24]} /><meshStandardMaterial color="#251c17" /></mesh></group>
    <WallPhoto position={[-2.3, 3.75, -3.88]} rotation={-.045} large src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Lionel%20Messi%20playing%20in%20Argentina%202022%20FIFA%20World%20Cup.jpg" alt="Lionel Messi · World Champion" />
    <WallPhoto position={[-.35, 4.05, -3.87]} rotation={.055} src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Jay%20Chou%20in%20Seoul.jpg" alt="Jay · 2000" />
    <WallPhoto position={[1.28, 3.55, -3.87]} rotation={-.035} src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Friends%20actors%20montage.jpg" alt="F · R · I · E · N · D · S" />
    <WallPhoto position={[2.75, 4.05, -3.87]} rotation={.065} src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Hai%20Zi%20%E6%B5%B7%E5%AD%90.jpg" alt="海子 · Facing the sea" />
    <ContactShadows position={[0, .02, 0]} opacity={.34} scale={14} blur={2.3} far={8} />
  </>;
}

function getVisitorId() {
  const key = 'crazyczy-visitor';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(key, created);
  return created;
}

export function HomeExperience({ lang: initialLang, posts }: { lang: Language; posts: HomePost[] }) {
  const [lang] = useState<Language>(initialLang);
  const [lifted, setLifted] = useState(false);
  const [entered, setEntered] = useState(false);
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState(0);
  const [panel, setPanel] = useState(false);
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteStatus, setNoteStatus] = useState('');
  const look = useRef({ x: 0, y: 0 });
  const t = WORDS[lang];
  const typing = useTypewriter(t.intro, !entered);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if (event.key === 'Enter' && !entered) setEntered(true); if (event.key === 'Escape') setPanel(false); };
    addEventListener('keydown', handler); return () => removeEventListener('keydown', handler);
  }, [entered]);
  useEffect(() => {
    fetch('/api/suggestions', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setNotes(data as Note[]))
      .catch(() => setNoteStatus(lang === 'en' ? 'Notes are taking a short break.' : '留言暂时休息了一会儿。'));
  }, [lang]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('crazyczy-theme', dark ? 'dark' : 'light');
  }, [dark]);
  const visible = posts.filter((post) => tab === 0 ? !post.tags.some((tag) => /poem|essay/i.test(tag)) : tab === 1 ? post.tags.some((tag) => /notes|essay/i.test(tag)) : post.tags.some((tag) => /poem/i.test(tag)));
  const goLanguage = () => { window.location.href = `/${lang === 'en' ? 'zh' : 'en'}/`; };
  const vote = async (id: string, amount: number) => {
    const voteKey = `crazyczy-vote-${id}`;
    if (localStorage.getItem(voteKey)) { setNoteStatus(lang === 'en' ? 'You already voted on this note.' : '你已经评价过这条留言。'); return; }
    const response = await fetch('/api/suggestions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-czy-visitor': getVisitorId() }, body: JSON.stringify({ kind: 'vote', id, value: amount }) });
    if (!response.ok) { setNoteStatus(lang === 'en' ? 'You already voted on this note.' : '你已经评价过这条留言。'); return; }
    localStorage.setItem(voteKey, String(amount));
    setNotes((all) => all.map((note) => note.id === id ? { ...note, score: note.score + amount } : note));
    setNoteStatus('');
  };
  const submit = async () => {
    if (!draft.trim()) return;
    const response = await fetch('/api/suggestions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-czy-visitor': getVisitorId() }, body: JSON.stringify({ kind: 'comment', text: draft }) });
    const data = await response.json() as Note & { error?: string };
    if (!response.ok) { setNoteStatus(response.status === 429 ? (lang === 'en' ? 'Two notes today — come back tomorrow.' : '今天已经留下两条，明天再来吧。') : (data.error ?? 'Unable to leave note.')); return; }
    setNotes((all) => [data, ...all]);
    setDraft(''); setFocused(false); setNoteStatus('');
  };
  return <main className={`home-experience ${entered ? 'entered' : ''}`}>
    <section className="room-page" aria-label="Interactive personal room">
      <div className="room-canvas"><Canvas shadows camera={{ position: [.1, 6.05, 5.15], fov: 43 }} dpr={[1, 1.6]}><Suspense fallback={null}><Room lifted={lifted} look={look} /></Suspense></Canvas></div>
      <button className="room-look-control" aria-label={t.click} onClick={() => setLifted(true)} onPointerMove={(event) => { look.current.x = event.clientX / window.innerWidth * 2 - 1; look.current.y = -(event.clientY / window.innerHeight * 2 - 1); }} />
      <div className="room-grain" />
      <div className="intro-type"><p>CRAZYCZY · PERSONAL FIELD NOTES</p><h1><span>{typing.out[0]}{typing.line === 0 && <i />}</span><span>{typing.out[1]}{typing.line === 1 && <i />}</span></h1></div>
      <button className="room-language" onClick={(e) => { e.stopPropagation(); goLanguage(); }}><Globe2 />{lang === 'en' ? '中文' : 'EN'}</button>
      <p className="room-hint">{lifted ? t.explore : t.click}<i /></p>
      <button className={`enter-reading ${typing.done ? 'show' : ''}`} onClick={(e) => { e.stopPropagation(); setEntered(true); }}><kbd>↵</kbd>{t.enter}</button>
    </section>
    <section className="reading-page" id="top">
      <header className="reading-nav"><a className="reading-brand" href="#top"><b>Z</b><span>ZACHARY<br />CHENG</span></a><nav>{t.nav.map((item, index) => <a key={item} href={index === 0 ? '#top' : index === 1 ? '#writing' : '#about'}>{item}</a>)}<button onClick={() => setPanel(true)}>{t.suggestions}<sup>{String(notes.length).padStart(2, '0')}</sup></button></nav><div><button onClick={goLanguage}><Globe2 />{lang === 'en' ? '中文' : 'EN'}</button><button aria-label={dark ? 'Use light mode' : 'Use dark mode'} onClick={() => setDark(!dark)}>{dark ? <Sun /> : <Moon />}</button></div></header>
      <section className="writing-hero"><div><p>{t.eyebrow}</p><h1>{t.title}</h1></div><p>{t.deck}</p><aside><span>32°03&apos;N</span><span>118°47&apos;E</span><b>☂</b></aside></section>
      <section className="writing-index" id="writing"><div className="index-rule"><span>{t.latest}</span><span>ISSUE № 04</span></div><div className="writing-tabs">{t.tabs.map((label, index) => <button key={label} className={tab === index ? 'active' : ''} onClick={() => setTab(index)}><small>0{index + 1}</small>{label}</button>)}</div>
        {visible.length ? <div className="post-grid">{visible.map((post, index) => <a className="writing-card" aria-label={`${t.read}: ${post.title}`} href={`/${lang}/blog/${post.slug}/`} key={post.slug}><div className="card-graphic"><b>0{index + 1}</b><i /><span>{t.tabs[tab]}</span></div><div className="card-body"><time>{post.publishDate.replaceAll('-', '.')}</time><h2>{post.title}</h2><p>{post.description}</p><footer><span>{post.tags.join(' · ')}</span><b>{t.read} ↗</b></footer></div></a>)}</div> : <div className="empty-writing"><span>0{tab + 1}</span><p>{t.empty[tab]}</p></div>}
      </section>
      <section className="quote-room"><p>“The world is before you, and you need not take it or leave it as it was when you came in.”</p><span>— JAMES BALDWIN</span></section>
      <section className="home-about" id="about"><span>01</span><div><p>{lang === 'en' ? 'ABOUT THIS ROOM' : '关于这个房间'}</p><h2>A curious generalist,<br />somewhere between<br /><em>code and language.</em></h2></div><p>{lang === 'en' ? 'I keep this site as a room with the door open: a place for unfinished thoughts, careful sentences, and the things I return to.' : '我把这个网站当作一间门开着的房间：放未完成的念头、仔细写下的句子，以及我总会回来的事物。'}<b>📍 Jiangsu, China</b></p></section>
      <footer className="home-footer"><span>© 2026 ZACHARY CHENG</span><p>Made between rainstorms in Jiangsu.</p><a href="mailto:hello@crazyczy.com">HELLO@CRAZYCZY.COM</a></footer>
    </section>
    <Sheet open={panel} onOpenChange={setPanel}><SheetContent className="suggestions-drawer sm:max-w-[36rem]" showCloseButton={false}><button className="drawer-close" onClick={() => setPanel(false)} aria-label={t.close}><X /></button><p className="drawer-kicker">VISITOR BOOK · 访客簿</p><SheetTitle className="drawer-title">{t.suggestionTitle}</SheetTitle><SheetDescription className="drawer-description">{t.suggestionDeck}</SheetDescription><div className={`note-composer ${focused ? 'focused' : ''}`}><textarea maxLength={280} value={draft} onChange={(e) => setDraft(e.target.value)} onFocus={() => setFocused(true)} placeholder={t.placeholder} /><div><small>{noteStatus || t.limit}</small><button onClick={submit} disabled={!draft.trim()}><Send />{t.send}</button></div></div><div className="visitor-notes">{notes.map((note, index) => <article key={note.id}><header><span>{note.name}</span>{index < 3 && <b>NEW</b>}</header><p>{note.text}</p><footer><button onClick={() => vote(note.id, 1)} aria-label="Like"><ThumbsUp /></button><strong>{note.score}</strong><button onClick={() => vote(note.id, -1)} aria-label="Dislike"><ThumbsDown /></button><time>{new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric' }).format(note.createdAt)}</time></footer></article>)}</div></SheetContent></Sheet>
  </main>;
}
