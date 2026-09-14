import { languageAlternates } from '@/lib/routes';
import type { Metadata } from 'next';
import { TagsView } from '@/components/tags-view';
export const metadata: Metadata = {
  alternates: languageAlternates('en', 'tags'),
  title: 'Tags',
};
export default function Page() {
  return <TagsView lang="en" />;
}
