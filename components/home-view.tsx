import type { Language } from '@/lib/content';
import { getPosts } from '@/lib/content';
import { copy } from '@/lib/copy';
import { HomeExperience } from './home-experience';
import { SiteShell } from './site-shell';
import { WritingIndex } from './writing-index';

export function HomeView({ lang }: { lang: Language }) {
  const posts = getPosts(lang);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Person', name: 'Zachary Cheng', alternateName: '程致远', url: 'https://crazyczy.com' },
      { '@type': 'WebSite', name: 'CZY', url: 'https://crazyczy.com', inLanguage: ['zh-CN', 'en'] },
    ],
  };
  return (
    <>
      <HomeExperience lang={lang} />
      <SiteShell lang={lang} active="home">
        <section className="home-return">
          <div>
            <p className="eyebrow">CRAZYCZY / FIELD NOTES</p>
            <h1>{lang === 'en' ? 'Code, ideas, and things worth keeping.' : '代码、想法，以及值得留下的事。'}</h1>
          </div>
          <p>{copy[lang].lead}</p>
        </section>
        <WritingIndex lang={lang} posts={posts} />
      </SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
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
