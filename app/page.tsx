import type { Metadata } from 'next';
import { HomeView } from '@/components/home-view';
export const metadata: Metadata = {
  title: 'Home',
  description:
    'Zachary Cheng’s personal space for writing, projects, games, and making things.',
  alternates: {
    canonical: '/',
    languages: { 'zh-CN': '/zh/', en: '/', 'x-default': '/' },
  },
};
export default function RootPage() {
  return <HomeView lang="en" />;
}
