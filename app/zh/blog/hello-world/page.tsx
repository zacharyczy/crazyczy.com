import type { Metadata } from 'next'; import { ArticleView } from '@/components/article-view'; import { getPost } from '@/lib/content';
const post = getPost('zh', 'hello-world')!;
export const metadata: Metadata = { title: post.title, description: post.description, alternates: { canonical: '/zh/blog/hello-world/', languages: { 'zh-CN': '/zh/blog/hello-world/', en: '/en/blog/hello-world/' } }, openGraph: { type: 'article', title: post.title, description: post.description, url: '/zh/blog/hello-world/', images: ['/og.png'] }, twitter: { card: 'summary_large_image', title: post.title, description: post.description, images: ['/og.png'] } };
export default function Page() { return <ArticleView lang="zh" slug="hello-world" />; }
