'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Language } from '@/lib/content';

type Obstacle = { x: number; y: number; width: number; height: number };

const WIDTH = 360;
const HEIGHT = 520;

export function StarflightGame({ lang }: { lang: Language }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef({ x: WIDTH / 2 - 14, y: HEIGHT - 58, width: 28, height: 32 });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const keysRef = useRef({ left: false, right: false });
  const animationRef = useRef(0);
  const lastRef = useRef(0);
  const spawnRef = useRef(0);
  const distanceRef = useRef(0);
  const draggingRef = useRef(false);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setBest(Number(localStorage.getItem('crazyczy-starflight-best') || 0)));
    return () => cancelAnimationFrame(frame);
  }, []);

  function draw() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const style = getComputedStyle(document.documentElement);
    context.fillStyle = style.getPropertyValue('--game-bg').trim() || '#050505';
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = style.getPropertyValue('--game-star').trim() || '#aaa';
    for (let i = 0; i < 55; i += 1) {
      const x = (i * 83 + 17) % WIDTH;
      const y = (i * 137 + Math.floor(distanceRef.current * (i % 3 + 1) * .08)) % HEIGHT;
      context.fillRect(x, y, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
    }
    context.fillStyle = style.getPropertyValue('--primary').trim() || '#e05d38';
    obstaclesRef.current.forEach((obstacle) => context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height));
    const player = playerRef.current;
    context.fillStyle = style.getPropertyValue('--cyan').trim() || '#70e9df';
    context.fillRect(player.x + 10, player.y, 8, 8);
    context.fillRect(player.x + 5, player.y + 8, 18, 10);
    context.fillRect(player.x, player.y + 18, 28, 10);
    context.fillStyle = '#f2d45c';
    context.fillRect(player.x + 9, player.y + 28, 4, 4);
    context.fillRect(player.x + 15, player.y + 28, 4, 4);
  }

  useEffect(() => { draw(); }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'A'].includes(event.key)) { event.preventDefault(); keysRef.current.left = true; }
      if (['ArrowRight', 'd', 'D'].includes(event.key)) { event.preventDefault(); keysRef.current.right = true; }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'A'].includes(event.key)) keysRef.current.left = false;
      if (['ArrowRight', 'd', 'D'].includes(event.key)) keysRef.current.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, []);

  useEffect(() => {
    if (!running) return;
    lastRef.current = performance.now();
    const frame = (now: number) => {
      const delta = Math.min(32, now - lastRef.current);
      lastRef.current = now;
      const speed = 145 + Math.min(230, distanceRef.current * .05);
      const player = playerRef.current;
      if (keysRef.current.left) player.x -= .28 * delta;
      if (keysRef.current.right) player.x += .28 * delta;
      player.x = Math.max(0, Math.min(WIDTH - player.width, player.x));
      spawnRef.current += delta;
      const spawnEvery = Math.max(360, 900 - distanceRef.current * .08);
      if (spawnRef.current >= spawnEvery) {
        spawnRef.current = 0;
        const width = 24 + Math.random() * 54;
        obstaclesRef.current.push({ x: Math.random() * (WIDTH - width), y: -28, width, height: 18 + Math.random() * 18 });
      }
      obstaclesRef.current.forEach((obstacle) => { obstacle.y += speed * delta / 1000; });
      obstaclesRef.current = obstaclesRef.current.filter((obstacle) => obstacle.y < HEIGHT + 40);
      const collision = obstaclesRef.current.some((obstacle) =>
        player.x < obstacle.x + obstacle.width && player.x + player.width > obstacle.x &&
        player.y < obstacle.y + obstacle.height && player.y + player.height > obstacle.y
      );
      distanceRef.current += speed * delta / 1000;
      const nextScore = Math.floor(distanceRef.current / 10);
      setScore(nextScore);
      draw();
      if (collision) {
        setRunning(false);
        setGameOver(true);
        setBest((currentBest) => {
          const nextBest = Math.max(currentBest, nextScore);
          localStorage.setItem('crazyczy-starflight-best', String(nextBest));
          return nextBest;
        });
        return;
      }
      animationRef.current = requestAnimationFrame(frame);
    };
    animationRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animationRef.current);
  }, [running]);

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) setRunning(false); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  function reset() {
    playerRef.current.x = WIDTH / 2 - 14;
    obstaclesRef.current = [];
    distanceRef.current = 0;
    spawnRef.current = 0;
    setScore(0);
    setGameOver(false);
    requestAnimationFrame(draw);
  }

  function start() {
    if (gameOver) reset();
    setRunning(true);
  }

  function drag(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!draggingRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    playerRef.current.x = Math.max(0, Math.min(WIDTH - 28, (event.clientX - rect.left) * WIDTH / rect.width - 14));
    draw();
  }

  const text = lang === 'zh'
    ? { title: '星际飞行', score: '航程', best: '最高', start: '起飞', pause: '暂停', resume: '继续', restart: '重新开始', over: '飞船失联' }
    : { title: 'Starflight', score: 'Distance', best: 'Best', start: 'Launch', pause: 'Pause', resume: 'Resume', restart: 'Restart', over: 'Ship lost' };

  return (
    <section className="game-stage starflight-stage" aria-label={text.title}>
      <div className="game-status"><span>{text.score}: <b>{score}</b></span><span>{text.best}: <b>{best}</b></span></div>
      <div className="canvas-wrap">
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-label={text.title}
          onPointerDown={(event) => { draggingRef.current = true; event.currentTarget.setPointerCapture(event.pointerId); drag(event); }}
          onPointerMove={drag}
          onPointerUp={() => { draggingRef.current = false; }} />
        {gameOver && <div className="game-overlay"><strong>{text.over}</strong><span>{text.score}: {score}</span></div>}
      </div>
      <div className="game-actions">
        <Button onClick={running ? () => setRunning(false) : start}>{running ? text.pause : gameOver ? text.restart : score ? text.resume : text.start}</Button>
        <Button variant="outline" onClick={() => { setRunning(false); reset(); }}>{text.restart}</Button>
      </div>
      <div className="flight-controls">
        <button onPointerDown={() => { keysRef.current.left = true; }} onPointerUp={() => { keysRef.current.left = false; }} onPointerLeave={() => { keysRef.current.left = false; }} aria-label="Left">←</button>
        <button onPointerDown={() => { keysRef.current.right = true; }} onPointerUp={() => { keysRef.current.right = false; }} onPointerLeave={() => { keysRef.current.right = false; }} aria-label="Right">→</button>
      </div>
    </section>
  );
}
