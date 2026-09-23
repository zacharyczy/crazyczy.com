import type { Metadata } from 'next';
import { ArticleView } from '@/components/article-view';
import { getPost } from '@/lib/content';
import { languageAlternates, pageHref } from '@/lib/routes';

const post = getPost('en', 'focus-takes-root-in-output')!;
export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: languageAlternates('en', 'blog/focus-takes-root-in-output'),
  openGraph: {
    type: 'article',
    title: post.title,
    description: post.description,
    url: pageHref('en', 'blog/focus-takes-root-in-output'),
    images: ['/og.png'],
  },
};
export default function Page() {
  return <ArticleView lang="en" slug="focus-takes-root-in-output" />;
}
