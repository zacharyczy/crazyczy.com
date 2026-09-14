import { languageAlternates } from '@/lib/routes';
import type { Metadata } from 'next';
import { TagsView } from '@/components/tags-view';
export const metadata: Metadata = {
  alternates: languageAlternates('zh', 'tags'),
  title: '标签',
};
export default function Page() {
  return <TagsView lang="zh" />;
}
