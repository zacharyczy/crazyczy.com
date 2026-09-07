import type { Metadata } from 'next';
import { HomeView } from '@/components/home-view';
export const metadata: Metadata = {
  title: '首页',
  description: 'Zachary Cheng 程致远的个人技术博客、项目、游戏与数字空间。',
  alternates: {
    canonical: '/zh/',
    languages: { 'zh-CN': '/zh/', en: '/', 'x-default': '/' },
  },
  openGraph: {
    url: 'https://crazyczy.com/zh/',
    description: '个人技术博客、项目、游戏与数字空间。',
  },
};
export default function Page() {
  return <HomeView lang="zh" />;
}
