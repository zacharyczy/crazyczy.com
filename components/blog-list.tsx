import type { Language } from '@/lib/content';
import { getPosts } from '@/lib/content';
import { copy } from '@/lib/copy';
import { PostRow } from './home-view';
import { SiteShell } from './site-shell';

export function BlogList({ lang }: { lang: Language }) {
  const t = copy[lang];
  return <SiteShell lang={lang} active="blog"><section className="page-wrap"><p className="eyebrow">Archive / {getPosts(lang).length.toString().padStart(2, '0')}</p><h1 className="page-title">{t.allWriting}</h1><p className="page-lead">{t.allWritingHint}</p><div className="mt-14 divide-y divide-white/8 border-t border-white/8">{getPosts(lang).map((post) => <PostRow key={post.slug} lang={lang} post={post} />)}</div></section></SiteShell>;
}
