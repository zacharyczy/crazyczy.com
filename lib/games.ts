import type { Language } from './content';

export type GameId = 'snake' | 'starflight';
export type GamePresentation = { lang: Language; presentation?: 'page' | 'tv'; inputEnabled?: boolean };
export const GAME_STORAGE = { snake: 'crazyczy-snake-best', starflight: 'crazyczy-starflight-best' } as const;
export function gameCatalogue(lang: Language) {
  return [
    {
      slug: 'snake' as const,
      number: '01',
      title: lang === 'zh' ? '贪吃蛇' : 'Snake',
      description: lang === 'zh' ? '吃掉像素，避开墙壁和自己。速度会随分数提升。' : 'Eat pixels, avoid the walls and yourself. The pace rises with your score.',
      controls: lang === 'zh' ? '方向键 / WASD / 触屏' : 'Arrow keys / WASD / touch',
      storageKey: GAME_STORAGE.snake,
      art: '◆··■··◆',
    },
    {
      slug: 'starflight' as const,
      number: '02',
      title: lang === 'zh' ? '星际飞行' : 'Starflight',
      description: lang === 'zh' ? '穿过不断加速的星域，避开迎面而来的障碍。' : 'Cross an accelerating starfield and dodge incoming obstacles.',
      controls: lang === 'zh' ? '← → / A D / 触屏' : '← → / A D / touch',
      storageKey: GAME_STORAGE.starflight,
      art: '· ✦  ▲  ✦ ·',
    },
  ];
}
export function readGameBest(key: string) { try { return Math.max(0, Number(localStorage.getItem(key)) || 0); } catch { return 0; } }
export function saveGameBest(key: string, score: number) { const best = Math.max(readGameBest(key), score); try { localStorage.setItem(key, String(best)); } catch { /* Storage may be disabled; the game remains playable. */ } return best; }
