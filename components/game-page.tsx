'use client';
import { useSiteLanguage } from './site-language';
import { gameCatalogue } from '@/lib/games';
import { pageHref } from '@/lib/routes';
import type { ReactNode } from 'react';
import type { Language } from '@/lib/content';
import { SiteShell } from './site-shell';

export function GamePage({
  lang: initialLang,
  slug,
  title,
  description,
  children,
}: {
  lang: Language;
  slug: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { lang } = useSiteLanguage(initialLang);
  const game = gameCatalogue(lang).find(g => g.slug === slug);
  return (
    <SiteShell lang={lang} active="games" path={`games/${slug}`}>
      <section className="article-wrap game-page">
        <a href={pageHref(lang, `games`)} className="back-link">
          ← {lang === 'zh' ? '返回游戏厅' : 'Back to games'}
        </a>
        <header className="game-page-header">
          <p className="eyebrow">Games / {slug}</p>
          <h1>{game?.title ?? title}</h1>
          <p>{game?.description ?? description}</p>
        </header>
        {children}
      </section>
    </SiteShell>
  );
}
