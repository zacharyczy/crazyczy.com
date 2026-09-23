import type { Metadata } from 'next';
import { ArticleView } from '@/components/article-view';
import { getPost } from '@/lib/content';
import { languageAlternates, pageHref } from '@/lib/routes';

const post = getPost('zh', 'miser')!;
export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: languageAlternates('zh', 'blog/miser'),
  openGraph: {
    type: 'article',
    title: post.title,
    description: post.description,
    url: pageHref('zh', 'blog/miser'),
    images: ['/og.png'],
  },
};
export default function Page() {
  return <ArticleView lang="zh" slug="miser" />;
}
