import type { Metadata } from 'next';
import { ArticleView } from '@/components/article-view';
import { getPost } from '@/lib/content';
import { languageAlternates, pageHref } from '@/lib/routes';
const post = getPost('zh', 'ppt-to-chinese')!;
export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: languageAlternates('zh', 'blog/ppt-to-chinese'),
  openGraph: {
    type: 'article',
    title: post.title,
    description: post.description,
    url: pageHref('zh', 'blog/ppt-to-chinese'),
    images: ['/og.png'],
  },
};
export default function Page() {
  return <ArticleView lang="zh" slug="ppt-to-chinese" />;
}
