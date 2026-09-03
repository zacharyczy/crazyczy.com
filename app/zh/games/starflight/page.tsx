import type { Metadata } from 'next';
import { GamePage } from '@/components/game-page';
import { StarflightGame } from '@/components/starflight-game';
export const metadata: Metadata = { title: '星际飞行', description: '穿过星域并躲避障碍的像素飞行游戏。', alternates: { canonical: '/zh/games/starflight/', languages: { 'zh-CN': '/zh/games/starflight/', en: '/en/games/starflight/' } } };
export default function Page() { return <GamePage lang="zh" slug="starflight" title="星际飞行" description="飞得越远，星域越快。使用左右方向键、A/D、拖动或屏幕按钮。"><StarflightGame lang="zh" /></GamePage>; }
