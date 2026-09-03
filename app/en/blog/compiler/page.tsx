import type { Metadata } from 'next'; import { ArticleView } from '@/components/article-view'; import { getPost } from '@/lib/content';
const post = getPost('en', 'compiler')!;
export const metadata: Metadata = { title: post.title, description: post.description, alternates: { canonical: '/en/blog/compiler/', languages: { 'zh-CN': '/zh/blog/compiler/', en: '/en/blog/compiler/' } }, openGraph: { type: 'article', title: post.title, description: post.description, url: '/en/blog/compiler/', locale: 'en', images: ['/og.png'] }, twitter: { card: 'summary_large_image', title: post.title, description: post.description, images: ['/og.png'] } };
export default function Page() { return <ArticleView lang="en" slug="compiler" />; }
