import type { Metadata } from 'next';
import { GamesView } from '@/components/games-view';
export const metadata: Metadata = { title: 'Games', description: 'Pixel-sized Snake and Starflight games.', alternates: { canonical: '/en/games/', languages: { 'zh-CN': '/zh/games/', en: '/en/games/' } } };
export default function Page() { return <GamesView lang="en" />; }
