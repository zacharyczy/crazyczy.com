import type { Metadata } from 'next'; import { ArticleView } from '@/components/article-view'; import { getPost } from '@/lib/content';
const post = getPost('zh', 'crazyczy')!;
export const metadata: Metadata = { title: post.title, description: post.description, alternates: { canonical: '/zh/blog/crazyczy/', languages: { 'zh-CN': '/zh/blog/crazyczy/', en: '/en/blog/crazyczy/' } }, openGraph: { type: 'article', title: post.title, description: post.description, url: '/zh/blog/crazyczy/', locale: 'zh-CN', images: ['/og.png'] }, twitter: { card: 'summary_large_image', title: post.title, description: post.description, images: ['/og.png'] } };
export default function Page() { return <ArticleView lang="zh" slug="crazyczy" />; }
