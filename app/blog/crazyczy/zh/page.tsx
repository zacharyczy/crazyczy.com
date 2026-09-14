import { languageAlternates } from '@/lib/routes';
import type { Metadata } from 'next';
import { ArticleView } from '@/components/article-view';
import { getPost } from '@/lib/content';
const post = getPost('zh', 'crazyczy')!;
export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: languageAlternates('zh', 'blog/crazyczy'),
  openGraph: {
    type: 'article',
    title: post.title,
    description: post.description,
    url: '/blog/crazyczy/zh/',
    locale: 'zh-CN',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: post.title,
    description: post.description,
    images: ['/og.png'],
  },
};
export default function Page() {
  return <ArticleView lang="zh" slug="crazyczy" />;
}
