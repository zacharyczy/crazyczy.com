'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Language } from '@/lib/content';

type Point = { x: number; y: number };
type Direction = Point;

const SIZE = 20;
const CELL = 20;
const INITIAL: Point[] = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
const DIRECTIONS: Record<string, Direction> = {
  ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
};

function makeFood(occupied: Point[]): Point {
  const open: Point[] = [];
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (!occupied.some((point) => point.x === x && point.y === y)) open.push({ x, y });
    }
  }
  return open[Math.floor(Math.random() * open.length)] || { x: 4, y: 4 };
}

export function SnakeGame({ lang }: { lang: Language }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const directionRef = useRef<Direction>({ x: 1, y: 0 });
  const queuedRef = useRef<Direction>({ x: 1, y: 0 });
  const pointerRef = useRef<Point | null>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL);
  const [food, setFood] = useState<Point>(() => makeFood(INITIAL));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setBest(Number(localStorage.getItem('crazyczy-snake-best') || 0)));
    return () => cancelAnimationFrame(frame);
  }, []);

  function queue(next: Direction) {
    const current = directionRef.current;
    if (next.x + current.x !== 0 || next.y + current.y !== 0) queuedRef.current = next;
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const next = DIRECTIONS[event.key];
      if (!next) return;
      event.preventDefault();
      queue(next);
      if (!running && !gameOver) setRunning(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, gameOver]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const nextDirection = queuedRef.current;
      directionRef.current = nextDirection;
      setSnake((currentSnake) => {
        const head = currentSnake[0];
        const nextHead = { x: head.x + nextDirection.x, y: head.y + nextDirection.y };
        const hitWall = nextHead.x < 0 || nextHead.x >= SIZE || nextHead.y < 0 || nextHead.y >= SIZE;
        const hitSelf = currentSnake.some((point) => point.x === nextHead.x && point.y === nextHead.y);
        if (hitWall || hitSelf) {
          setRunning(false);
          setGameOver(true);
          setBest((currentBest) => {
            const nextBest = Math.max(currentBest, score);
            localStorage.setItem('crazyczy-snake-best', String(nextBest));
            return nextBest;
          });
          return currentSnake;
        }
        const nextSnake = [nextHead, ...currentSnake];
        if (nextHead.x === food.x && nextHead.y === food.y) {
          const nextScore = score + 1;
          setScore(nextScore);
          setFood(makeFood(nextSnake));
          return nextSnake;
        }
        nextSnake.pop();
        return nextSnake;
      });
    }, Math.max(70, 150 - score * 4));
    return () => window.clearInterval(timer);
  }, [running, food, score]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const style = getComputedStyle(document.documentElement);
    context.fillStyle = style.getPropertyValue('--game-bg').trim() || '#050505';
    context.fillRect(0, 0, SIZE * CELL, SIZE * CELL);
    context.strokeStyle = style.getPropertyValue('--game-grid').trim() || '#202020';
    context.lineWidth = 1;
    for (let i = 0; i <= SIZE; i += 1) {
      context.beginPath(); context.moveTo(i * CELL, 0); context.lineTo(i * CELL, SIZE * CELL); context.stroke();
      context.beginPath(); context.moveTo(0, i * CELL); context.lineTo(SIZE * CELL, i * CELL); context.stroke();
    }
    snake.forEach((point, index) => {
      context.fillStyle = index === 0 ? '#f2d45c' : (style.getPropertyValue('--cyan').trim() || '#70e9df');
      context.fillRect(point.x * CELL + 2, point.y * CELL + 2, CELL - 4, CELL - 4);
    });
    context.fillStyle = style.getPropertyValue('--primary').trim() || '#e05d38';
    context.fillRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6);
  }, [snake, food]);

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) setRunning(false); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  function reset() {
    directionRef.current = { x: 1, y: 0 };
    queuedRef.current = { x: 1, y: 0 };
    setSnake(INITIAL);
    setFood(makeFood(INITIAL));
    setScore(0);
    setGameOver(false);
  }

  function start() {
    if (gameOver) reset();
    setRunning(true);
  }

  function swipeEnd(point: Point) {
    const startPoint = pointerRef.current;
    pointerRef.current = null;
    if (!startPoint) return;
    const dx = point.x - startPoint.x;
    const dy = point.y - startPoint.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    queue(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) });
    if (!running && !gameOver) setRunning(true);
  }

  const text = lang === 'zh'
    ? { title: '贪吃蛇', score: '分数', best: '最高', start: '开始', pause: '暂停', resume: '继续', restart: '重新开始', over: '游戏结束' }
    : { title: 'Snake', score: 'Score', best: 'Best', start: 'Start', pause: 'Pause', resume: 'Resume', restart: 'Restart', over: 'Game over' };

  return (
    <section className="game-stage" aria-label={text.title}>
      <div className="game-status"><span>{text.score}: <b>{score}</b></span><span>{text.best}: <b>{best}</b></span></div>
      <div className="canvas-wrap">
        <canvas ref={canvasRef} width={400} height={400} aria-label={text.title}
          onPointerDown={(event) => { pointerRef.current = { x: event.clientX, y: event.clientY }; }}
          onPointerUp={(event) => swipeEnd({ x: event.clientX, y: event.clientY })} />
        {gameOver && <div className="game-overlay"><strong>{text.over}</strong><span>{text.score}: {score}</span></div>}
      </div>
      <div className="game-actions">
        <Button onClick={running ? () => setRunning(false) : start}>{running ? text.pause : gameOver ? text.restart : score ? text.resume : text.start}</Button>
        <Button variant="outline" onClick={() => { reset(); setRunning(false); }}>{text.restart}</Button>
      </div>
      <div className="dpad" aria-label={lang === 'zh' ? '方向控制' : 'Direction controls'}>
        <button onClick={() => queue({ x: 0, y: -1 })} aria-label="Up">↑</button>
        <button onClick={() => queue({ x: -1, y: 0 })} aria-label="Left">←</button>
        <button onClick={() => queue({ x: 0, y: 1 })} aria-label="Down">↓</button>
        <button onClick={() => queue({ x: 1, y: 0 })} aria-label="Right">→</button>
      </div>
    </section>
  );
}
