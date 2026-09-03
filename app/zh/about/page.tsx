import type { Metadata } from 'next'; import { AboutView } from '@/components/about-view';
export const metadata: Metadata = { title: '关于' }; export default function Page() { return <AboutView lang="zh" />; }
