import { notFound } from 'next/navigation';
import type { Language } from '@/lib/content';
import { getPost, getTranslation } from '@/lib/content';
import { copy } from '@/lib/copy';
import { Markdown } from './markdown';
import { SiteShell } from './site-shell';

export function ArticleView({ lang, slug }: { lang: Language; slug: string }) {
  const post = getPost(lang, slug);
  if (!post) notFound();
  const translation = getTranslation(post);
  const t = copy[lang];
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title,
    description: post.description, datePublished: post.publishDate, dateModified: post.updatedDate,
    inLanguage: t.locale, url: `https://crazyczy.com/${lang}/blog/${post.slug}/`,
    author: { '@type': 'Person', name: 'CZY', url: 'https://crazyczy.com' },
  };
  return <SiteShell lang={lang} active="blog"><article className="article-wrap"><a href={`/${lang}/blog/`} className="font-mono text-xs text-slate-500 transition hover:text-cyan-300">← {t.back}</a><header className="mt-12 border-b border-white/8 pb-10"><div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[.15em] text-slate-600"><time>{post.publishDate}</time><span>·</span><span>{t.readTime}</span></div><h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.06] tracking-[-.055em] text-white sm:text-6xl">{post.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">{post.description}</p><div className="mt-7 flex flex-wrap items-center gap-2">{post.tags.map((tag) => <a key={tag} href={`/${lang}/tags/`} className="tag">#{tag}</a>)}{translation && <a href={`/${translation.lang}/blog/${translation.slug}/`} className="ml-auto text-xs text-cyan-300 hover:text-cyan-200">{translation.lang === 'zh' ? '阅读中文版' : 'Read in English'} ↗</a>}</div></header><Markdown source={post.body} /></article><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /></SiteShell>;
}
