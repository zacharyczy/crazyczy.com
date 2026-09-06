import { gameCatalogue } from '@/lib/games';
import type { Language } from '@/lib/content';
import { copy } from '@/lib/copy';
import { GameBest } from './game-best';
import { SiteShell } from './site-shell';

export function GamesView({ lang }: { lang: Language }) {
  const t = copy[lang];
  const games = gameCatalogue(lang);

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
