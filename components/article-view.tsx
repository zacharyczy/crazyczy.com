'use client';
import { useSiteLanguage, LanguageLink } from './site-language';
import { pageHref } from '@/lib/routes';
import { notFound } from 'next/navigation';
import type { Language } from '@/lib/content';
import { getPost, getTranslation } from '@/lib/content';
import { copy } from '@/lib/copy';
import { Markdown } from './markdown';
import { WritingFeedback } from './writing-feedback';
import { SiteShell } from './site-shell';

export function ArticleView({
  lang: initialLang,
  slug,
}: {
  lang: Language;
  slug: string;
}) {
  const { lang } = useSiteLanguage(initialLang);
  const original = getPost(initialLang, slug);
  const post =
    original?.lang === lang ? original : original && getTranslation(original);
  if (!post) notFound();
  const translation = getTranslation(post);
  const t = copy[lang];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishDate,
    dateModified: post.updatedDate,
    inLanguage: t.locale,
    url: `https://crazyczy.com${pageHref(lang, `blog/${post.slug}`)}`,
    author: {
      '@type': 'Person',
      name: 'Zachary Cheng',
      alternateName: '程致远',
      url: 'https://crazyczy.com',
    },
  };
  return (
    <SiteShell lang={lang} active="blog" path={`blog/${post.slug}`}>
      <article className="article-wrap readable-detail">
        <a
          href={pageHref(lang, `blog`)}
          className="font-mono text-xs text-slate-500 transition hover:text-cyan-300"
        >
          ← {t.back}
        </a>
        <header className="mt-12 border-b border-white/8 pb-10">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[.15em] text-slate-600">
            <time>{post.publishDate}</time>
            <span>·</span>
            <span>{t.readTime}</span>
          </div>
          <h1 className="mt-6 max-w-4xl text-balance text-3xl font-semibold leading-[1.2] tracking-[-.025em] text-white sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400">
            {post.description}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-2">
            {post.tags.map((tag) => (
              <a key={tag} href={pageHref(lang, `tags`)} className="tag">
                #{tag}
              </a>
            ))}
            {translation && (
              <LanguageLink
                lang={translation.lang}
                href={pageHref(translation.lang, `blog/${translation.slug}`)}
                className="ml-auto text-xs text-cyan-300 hover:text-cyan-200"
              >
                {translation.lang === 'zh' ? '阅读中文版' : 'Read in English'} ↗
              </LanguageLink>
            )}
          </div>
        </header>
        <Markdown source={post.body} poem={post.tags.some((tag) => ['Poem', 'Poetry', '诗歌'].includes(tag))} />
        <WritingFeedback key={`${post.lang}:${post.slug}`} lang={post.lang} slug={post.slug} />
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </SiteShell>
  );
}
