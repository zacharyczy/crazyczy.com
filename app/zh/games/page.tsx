import type { Metadata } from 'next';
import { GamesView } from '@/components/games-view';
export const metadata: Metadata = { title: '游戏', description: '贪吃蛇和星际飞行像素小游戏。', alternates: { canonical: '/zh/games/', languages: { 'zh-CN': '/zh/games/', en: '/en/games/' } } };
export default function Page() { return <GamesView lang="zh" />; }
