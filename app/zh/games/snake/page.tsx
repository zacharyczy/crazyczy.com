import type { Metadata } from 'next';
import { GamePage } from '@/components/game-page';
import { SnakeGame } from '@/components/snake-game';
export const metadata: Metadata = { title: '贪吃蛇', description: '可以使用键盘和触屏游玩的像素贪吃蛇。', alternates: { canonical: '/zh/games/snake/', languages: { 'zh-CN': '/zh/games/snake/', en: '/en/games/snake/' } } };
export default function Page() { return <GamePage lang="zh" slug="snake" title="贪吃蛇" description="吃掉像素，避开墙壁和自己。方向键、WASD、滑动或屏幕按钮均可控制。"><SnakeGame lang="zh" /></GamePage>; }
