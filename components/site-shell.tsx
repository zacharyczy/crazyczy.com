import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Language } from '@/lib/content';
import { copy } from '@/lib/copy';

export function SiteShell({ lang, active, children }: { lang: Language; active?: string; children: ReactNode }) {
  const t = copy[lang];
  const other = lang === 'zh' ? 'en' : 'zh';
  const otherHref = active && ['blog', 'projects', 'about'].includes(active) ? `/${other}/${active}/` : `/${other}/`;
  return (
    <main className="min-h-screen overflow-hidden">
      <div className="noise" aria-hidden="true" />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href={`/${lang}/`} className="group flex items-center gap-3" aria-label="crazyczy">
          <span className="grid size-9 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/8 font-mono text-sm font-bold text-cyan-200">C/</span>
          <span className="font-mono text-sm text-slate-200">crazyczy.com</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-slate-400 md:flex" aria-label="Primary">
          {[['home', t.home, `/${lang}/`], ['blog', t.blog, `/${lang}/blog/`], ['projects', t.projects, `/${lang}/projects/`], ['about', t.about, `/${lang}/about/`]].map(([key, label, href]) => (
            <a key={key} className={`nav-link ${active === key ? 'text-white' : ''}`} href={href}>{label}</a>
          ))}
        </nav>
        <a href={otherHref} className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3.5 text-xs font-medium text-slate-300 transition hover:border-cyan-300/30 hover:text-white">
          <span aria-hidden="true">文/A</span> {t.languageCode}
        </a>
      </header>
      <nav className="mx-auto flex w-full max-w-6xl gap-5 overflow-x-auto px-5 pb-4 text-xs text-slate-500 md:hidden" aria-label="Mobile navigation">
        {[['home', t.home, `/${lang}/`], ['blog', t.blog, `/${lang}/blog/`], ['projects', t.projects, `/${lang}/projects/`], ['about', t.about, `/${lang}/about/`]].map(([key, label, href]) => <a key={key} href={href} className={active === key ? 'text-cyan-200' : 'hover:text-white'}>{label}</a>)}
      </nav>
      {children}
      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-9 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-mono">© 2026 CZY · Built with curiosity.</p>
        <div className="flex gap-5"><Link href={`/${lang}/tags/`} className="hover:text-white">{t.tags}</Link><Link href="/rss.xml" className="hover:text-white">RSS</Link></div>
      </footer>
    </main>
  );
}
