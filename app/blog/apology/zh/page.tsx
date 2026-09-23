import type { Metadata } from 'next';
import { ArticleView } from '@/components/article-view';
import { getPost } from '@/lib/content';
import { languageAlternates, pageHref } from '@/lib/routes';

const post = getPost('zh', 'apology')!;
export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: languageAlternates('zh', 'blog/apology'),
  openGraph: {
    type: 'article',
    title: post.title,
    description: post.description,
    url: pageHref('zh', 'blog/apology'),
    images: ['/og.png'],
  },
};
export default function Page() {
  return <ArticleView lang="zh" slug="apology" />;
}
