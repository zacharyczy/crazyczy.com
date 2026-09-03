import type { Metadata } from 'next'; import { ArticleView } from '@/components/article-view'; import { getPost } from '@/lib/content';
const post = getPost('zh', 'compiler')!;
export const metadata: Metadata = { title: post.title, description: post.description, alternates: { canonical: '/zh/blog/compiler/', languages: { 'zh-CN': '/zh/blog/compiler/', en: '/en/blog/compiler/' } }, openGraph: { type: 'article', title: post.title, description: post.description, url: '/zh/blog/compiler/', locale: 'zh-CN', images: ['/og.png'] }, twitter: { card: 'summary_large_image', title: post.title, description: post.description, images: ['/og.png'] } };
export default function Page() { return <ArticleView lang="zh" slug="compiler" />; }
