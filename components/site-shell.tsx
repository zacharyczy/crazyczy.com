import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Language } from '@/lib/content';
import { homeHref } from '@/lib/routes';
import { copy } from '@/lib/copy';
import { ThemeToggle } from './theme-toggle';
import { SuggestionsPanel } from './suggestions-panel';

export function SiteShell({
  lang,
  active,
  path,
  children,
}: {
  lang: Language;
  active?: string;
  path?: string;
  children: ReactNode;
}) {
  const t = copy[lang];
  const other = lang === 'zh' ? 'en' : 'zh';
  const otherHref = path
    ? `/${other}/${path}/`
    : active &&
        ['blog', 'projects', 'games', 'terminal', 'about'].includes(active)
      ? `/${other}/${active}/`
      : homeHref(other);
  const navItems = [
    ['home', t.home, homeHref(lang)],
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
        <Link
          href={homeHref(lang)}
          className="group flex items-center gap-3"
          aria-label="crazyczy"
        >
          <span className="brand-mark grid size-9 place-items-center">C/</span>
          <span className="brand-name text-sm">crazyczy.com</span>
        </Link>
        <nav
          className="hidden items-center gap-4 text-sm text-slate-400 lg:flex"
          aria-label="Primary"
        >
          {navItems.map(([key, label, href]) => (
            <a
              key={key}
              className={`nav-link ${active === key ? 'text-white' : ''}`}
              href={href}
            >
              {label}
            </a>
          ))}
          <SuggestionsPanel lang={lang} />
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle lang={lang} />
          <a
            href={otherHref}
            className="language-toggle inline-flex h-9 items-center gap-2 px-3.5 text-xs font-medium"
          >
            <span aria-hidden="true">文/A</span> {t.languageCode}
          </a>
        </div>
      </header>
      <nav
        className="mx-auto flex w-full max-w-6xl gap-5 overflow-x-auto px-5 pb-4 text-xs text-slate-500 lg:hidden"
        aria-label="Mobile navigation"
      >
        {navItems.map(([key, label, href]) => (
          <a
            key={key}
            href={href}
            className={active === key ? 'text-cyan-200' : 'hover:text-white'}
          >
            {label}
          </a>
        ))}
        <SuggestionsPanel lang={lang} mobile />
      </nav>
      {children}
    </main>
  );
}
