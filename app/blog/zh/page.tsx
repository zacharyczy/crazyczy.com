import { languageAlternates } from '@/lib/routes';
import type { Metadata } from 'next';
import { BlogList } from '@/components/blog-list';
export const metadata: Metadata = {
  alternates: languageAlternates('zh', 'blog'),
  title: '文章',
  description: 'CZY 的技术文章与构建记录。',
};
export default function Page() {
  return <BlogList lang="zh" />;
}
