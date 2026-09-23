import type { Metadata } from 'next';
import { ArticleView } from '@/components/article-view';
import { getPost } from '@/lib/content';
import { languageAlternates, pageHref } from '@/lib/routes';

const post = getPost('en', 'lifeline')!;
export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: languageAlternates('en', 'blog/lifeline'),
  openGraph: {
    type: 'article',
    title: post.title,
    description: post.description,
    url: pageHref('en', 'blog/lifeline'),
    images: ['/og.png'],
  },
};
export default function Page() {
  return <ArticleView lang="en" slug="lifeline" />;
}
