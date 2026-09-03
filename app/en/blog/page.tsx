import type { Metadata } from 'next';
import { BlogList } from '@/components/blog-list';
export const metadata: Metadata = { title: 'Writing', description: 'Technical notes and build logs by CZY.' };
export default function Page() { return <BlogList lang="en" />; }
