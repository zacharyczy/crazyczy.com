import type { Language } from '@/lib/content';
import { copy } from '@/lib/copy';
import { GameBest } from './game-best';
import { SiteShell } from './site-shell';

export function GamesView({ lang }: { lang: Language }) {
  const t = copy[lang];
  const games = [
    {
      slug: 'snake',
      number: '01',
      title: lang === 'zh' ? '贪吃蛇' : 'Snake',
      description: lang === 'zh' ? '吃掉像素，避开墙壁和自己。速度会随分数提升。' : 'Eat pixels, avoid the walls and yourself. The pace rises with your score.',
      controls: lang === 'zh' ? '方向键 / WASD / 触屏' : 'Arrow keys / WASD / touch',
      storageKey: 'crazyczy-snake-best',
      art: '◆··■··◆',
    },
    {
      slug: 'starflight',
      number: '02',
      title: lang === 'zh' ? '星际飞行' : 'Starflight',
      description: lang === 'zh' ? '穿过不断加速的星域，避开迎面而来的障碍。' : 'Cross an accelerating starfield and dodge incoming obstacles.',
      controls: lang === 'zh' ? '← → / A D / 触屏' : '← → / A D / touch',
      storageKey: 'crazyczy-starflight-best',
      art: '· ✦  ▲  ✦ ·',
    },
  ];

  return (
    <SiteShell lang={lang} active="games">
      <section className="page-wrap">
        <p className="eyebrow">Arcade / 02</p>
        <h1 className="page-title">{t.games}</h1>
        <p className="page-lead">{lang === 'zh' ? '两段可以随时开始的小型像素游戏。分数只保存在你的设备上。' : 'Two small pixel games ready whenever you are. Scores stay on your device.'}</p>
        <div className="game-grid">
          {games.map((game) => (
            <a key={game.slug} href={`/${lang}/games/${game.slug}/`} className="game-card">
              <div className="game-card-meta"><span>{game.number}</span><GameBest storageKey={game.storageKey} lang={lang} /></div>
              <div className="game-card-art" aria-hidden="true">{game.art}</div>
              <h2>{game.title}</h2>
              <p>{game.description}</p>
              <div className="game-card-footer"><span>{game.controls}</span><b>PLAY →</b></div>
            </a>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
