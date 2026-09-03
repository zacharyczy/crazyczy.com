import type { Language } from '@/lib/content';
import { getPosts, getTags } from '@/lib/content';
import { copy } from '@/lib/copy';
import { SiteShell } from './site-shell';

export function TagsView({ lang }: { lang: Language }) {
  const tags = getTags(lang);
  return <SiteShell lang={lang}><section className="page-wrap"><p className="eyebrow">Index / {tags.length.toString().padStart(2, '0')}</p><h1 className="page-title">{copy[lang].tags}</h1><div className="mt-14 grid gap-3 sm:grid-cols-2">{tags.map((tag) => <section key={tag} className="rounded-xl border border-white/8 bg-white/[.02] p-5"><div className="flex items-center justify-between"><h2 className="font-mono text-sm text-cyan-200">#{tag}</h2><span className="text-xs text-slate-600">{getPosts(lang).filter((post) => post.tags.includes(tag)).length.toString().padStart(2, '0')}</span></div>{getPosts(lang).filter((post) => post.tags.includes(tag)).map((post) => <a key={post.slug} href={`/${lang}/blog/${post.slug}/`} className="mt-5 block text-sm text-slate-400 hover:text-white">{post.title} <span className="text-slate-700">↗</span></a>)}</section>)}</div></section></SiteShell>;
}
