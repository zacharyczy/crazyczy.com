import type { ReactNode } from 'react';
import type { Language } from '@/lib/content';
import { SiteShell } from './site-shell';

export function GamePage({ lang, slug, title, description, children }: { lang: Language; slug: string; title: string; description: string; children: ReactNode }) {
  return (
    <SiteShell lang={lang} active="games" path={`games/${slug}`}>
      <section className="article-wrap game-page">
        <a href={`/${lang}/games/`} className="back-link">← {lang === 'zh' ? '返回游戏厅' : 'Back to games'}</a>
        <header className="game-page-header"><p className="eyebrow">Games / {slug}</p><h1>{title}</h1><p>{description}</p></header>
        {children}
      </section>
    </SiteShell>
  );
}
