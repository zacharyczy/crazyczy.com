import type { Metadata } from 'next'; import { TagsView } from '@/components/tags-view';
export const metadata: Metadata = { title: 'Tags' }; export default function Page() { return <TagsView lang="en" />; }
