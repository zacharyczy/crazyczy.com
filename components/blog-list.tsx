import type { Language } from '@/lib/content';
import { getPosts } from '@/lib/content';
import { copy } from '@/lib/copy';
import { SiteShell } from './site-shell';
import { WritingIndex } from './writing-index';

export function BlogList({ lang }: { lang: Language }) {
  const t = copy[lang];
  return <SiteShell lang={lang} active="blog"><section className="page-wrap writing-archive-head"><p className="eyebrow">Archive / {getPosts(lang).length.toString().padStart(2, '0')}</p><h1 className="page-title">{t.allWriting}</h1><p className="page-lead">{t.allWritingHint}</p></section><WritingIndex lang={lang} posts={getPosts(lang)} archive /></SiteShell>;
}
