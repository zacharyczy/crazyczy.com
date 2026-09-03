import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Language } from '@/lib/content';
import { copy } from '@/lib/copy';
import { ThemeToggle } from './theme-toggle';

export function SiteShell({ lang, active, path, children }: { lang: Language; active?: string; path?: string; children: ReactNode }) {
  const t = copy[lang];
  const other = lang === 'zh' ? 'en' : 'zh';
  const otherHref = path ? `/${other}/${path}/` : active && ['blog', 'projects', 'games', 'terminal', 'about'].includes(active) ? `/${other}/${active}/` : `/${other}/`;
  const navItems = [
    ['home', t.home, `/${lang}/`],
    ['blog', t.blog, `/${lang}/blog/`],
    ['projects', t.projects, `/${lang}/projects/`],
    ['games', t.games, `/${lang}/games/`],
    ['terminal', t.terminal, `/${lang}/terminal/`],
    ['about', t.about, `/${lang}/about/`],
  ];
  return (
    <main className="min-h-screen overflow-hidden">
      <div className="noise" aria-hidden="true" />
      <header className="site-header mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href={`/${lang}/`} className="group flex items-center gap-3" aria-label="crazyczy">
          <span className="brand-mark grid size-9 place-items-center">C/</span>
          <span className="brand-name text-sm">crazyczy.com</span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm text-slate-400 lg:flex" aria-label="Primary">
          {navItems.map(([key, label, href]) => (
            <a key={key} className={`nav-link ${active === key ? 'text-white' : ''}`} href={href}>{label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle lang={lang} />
          <a href={otherHref} className="language-toggle inline-flex h-9 items-center gap-2 px-3.5 text-xs font-medium">
            <span aria-hidden="true">文/A</span> {t.languageCode}
          </a>
        </div>
      </header>
      <nav className="mx-auto flex w-full max-w-6xl gap-5 overflow-x-auto px-5 pb-4 text-xs text-slate-500 lg:hidden" aria-label="Mobile navigation">
        {navItems.map(([key, label, href]) => <a key={key} href={href} className={active === key ? 'text-cyan-200' : 'hover:text-white'}>{label}</a>)}
      </nav>
      {children}
      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-9 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-mono">© 2026 CZY · Built with curiosity.</p>
        <div className="flex gap-5"><Link href={`/${lang}/tags/`} className="hover:text-white">{t.tags}</Link><Link href="/rss.xml" className="hover:text-white">RSS</Link></div>
      </footer>
    </main>
  );
}
