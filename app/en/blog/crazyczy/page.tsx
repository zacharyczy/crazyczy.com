import type { Metadata } from 'next'; import { ArticleView } from '@/components/article-view'; import { getPost } from '@/lib/content';
const post = getPost('en', 'crazyczy')!;
export const metadata: Metadata = { title: post.title, description: post.description, alternates: { canonical: '/en/blog/crazyczy/', languages: { 'zh-CN': '/zh/blog/crazyczy/', en: '/en/blog/crazyczy/' } }, openGraph: { type: 'article', title: post.title, description: post.description, url: '/en/blog/crazyczy/', locale: 'en', images: ['/og.png'] }, twitter: { card: 'summary_large_image', title: post.title, description: post.description, images: ['/og.png'] } };
export default function Page() { return <ArticleView lang="en" slug="crazyczy" />; }
