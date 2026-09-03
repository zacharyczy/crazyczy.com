import type { Metadata } from 'next';
import { HomeView } from '@/components/home-view';
export const metadata: Metadata = { title: 'Home', description: 'CZY’s personal technical blog about code, products, and the practice of making.', alternates: { canonical: '/en/', languages: { 'zh-CN': '/zh/', en: '/en/' } } };
export default function Page() { return <HomeView lang="en" />; }
