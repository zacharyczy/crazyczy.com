import type { Metadata } from 'next';
import { GamePage } from '@/components/game-page';
import { StarflightGame } from '@/components/starflight-game';
export const metadata: Metadata = { title: 'Starflight', description: 'A pixel spaceflight obstacle-dodging game.', alternates: { canonical: '/en/games/starflight/', languages: { 'zh-CN': '/zh/games/starflight/', en: '/en/games/starflight/' } } };
export default function Page() { return <GamePage lang="en" slug="starflight" title="Starflight" description="The farther you fly, the faster space moves. Use arrows, A/D, drag, or the on-screen controls."><StarflightGame lang="en" /></GamePage>; }
