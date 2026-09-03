import type { Metadata } from 'next'; import { ArticleView } from '@/components/article-view'; import { getPost } from '@/lib/content';
const post = getPost('en', 'gentzen')!;
export const metadata: Metadata = { title: post.title, description: post.description, alternates: { canonical: '/en/blog/gentzen/', languages: { 'zh-CN': '/zh/blog/gentzen/', en: '/en/blog/gentzen/' } }, openGraph: { type: 'article', title: post.title, description: post.description, url: '/en/blog/gentzen/', locale: 'en', images: ['/og.png'] }, twitter: { card: 'summary_large_image', title: post.title, description: post.description, images: ['/og.png'] } };
export default function Page() { return <ArticleView lang="en" slug="gentzen" />; }
