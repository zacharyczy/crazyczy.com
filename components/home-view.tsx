import type { Language } from '@/lib/content';
import { getPosts } from '@/lib/content';
import { copy } from '@/lib/copy';
import { SiteShell } from './site-shell';

export function HomeView({ lang }: { lang: Language }) {
  const t = copy[lang];
  const posts = getPosts(lang);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Person', name: 'CZY', url: 'https://crazyczy.com' },
      { '@type': 'WebSite', name: 'CZY', url: 'https://crazyczy.com', inLanguage: ['zh-CN', 'en'] },
    ],
  };
  return (
    <SiteShell lang={lang} active="home">
      <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.25fr_.75fr] lg:items-end lg:gap-20 lg:pb-28">
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-200/80">
            <span className="size-2 rounded-full bg-emerald-300" /> Online · Shanghai / UTC+8
          </div>
          <p className="mb-5 font-mono text-sm text-cyan-300">{t.greeting}</p>
          <h1 className="max-w-3xl text-balance text-[clamp(3.4rem,8vw,7.2rem)] font-semibold leading-[.9] tracking-[-0.075em] text-white">
            Build things.<span className="block text-slate-500">Write the signal.</span>
          </h1>
          <p className="mt-8 max-w-xl text-pretty text-base leading-7 text-slate-400 sm:text-lg">{t.lead}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href={`/${lang}/blog/`} className="primary-pill">{t.read} <span>↗</span></a>
            <a href={`/${lang}/projects/`} className="secondary-pill"><span>{'{ }'}</span> {t.browse}</a>
          </div>
        </div>
        <aside className="terminal-card" aria-label="profile">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-3.5">
            <div className="flex gap-1.5" aria-hidden="true"><span className="size-2 rounded-full bg-rose-400/70" /><span className="size-2 rounded-full bg-amber-300/70" /><span className="size-2 rounded-full bg-emerald-300/70" /></div>
            <span className="font-mono text-[10px] uppercase tracking-[.18em] text-slate-600">profile.ts</span>
          </div>
          <div className="space-y-5 p-5 font-mono text-[13px] leading-6 sm:p-6">
            <p><span className="text-fuchsia-300">const</span> <span className="text-cyan-200">czy</span> <span className="text-slate-500">=</span> {'{'}</p>
            <div className="space-y-1 pl-5 text-slate-300">
              <p><span className="text-slate-500">focus:</span> <span className="text-amber-200">&apos;web &amp; product&apos;</span>,</p>
              <p><span className="text-slate-500">currently:</span> <span className="text-amber-200">&apos;building in public&apos;</span>,</p>
              <p><span className="text-slate-500">principle:</span> <span className="text-amber-200">&apos;less, but better&apos;</span></p>
            </div>
            <p>{'}'};</p>
            <div className="border-t border-white/8 pt-5 text-slate-500"><span className="text-emerald-300">➜</span> _ ready to make something useful</div>
          </div>
        </aside>
      </section>
      <section className="border-y border-white/7 bg-white/[.015]">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[.55fr_1.45fr] lg:py-20">
          <div><p className="eyebrow">Latest writing</p><h2 className="mt-3 text-2xl font-semibold tracking-[-.035em] text-white">{t.latest}</h2><p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">{t.latestHint}</p></div>
          <div className="divide-y divide-white/8 border-t border-white/8">
            {posts.map((post) => <PostRow key={post.slug} lang={lang} post={post} />)}
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </SiteShell>
  );
}

export function PostRow({ lang, post }: { lang: Language; post: ReturnType<typeof getPosts>[number] }) {
  return (
    <a href={`/${lang}/blog/${post.slug}/`} className="post-row group grid gap-4 py-6 sm:grid-cols-[110px_1fr_auto] sm:items-start">
      <time className="font-mono text-[11px] tracking-wider text-slate-600">{post.publishDate.replaceAll('-', '.')}</time>
      <div><h3 className="text-base font-medium text-slate-200 transition group-hover:text-cyan-200">{post.title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{post.description}</p><div className="mt-3 flex gap-2">{post.tags.map((tag) => <span key={tag} className="font-mono text-[10px] text-slate-600">#{tag}</span>)}</div></div>
      <span className="mt-1 hidden text-slate-700 transition group-hover:text-cyan-300 sm:block">↗</span>
    </a>
  );
}
