import type { Metadata } from 'next';
import { TerminalPage } from '@/components/terminal-page';
export const metadata: Metadata = { title: 'Terminal', description: '通过简单命令浏览 crazyczy.com。', alternates: { canonical: '/zh/terminal/', languages: { 'zh-CN': '/zh/terminal/', en: '/en/terminal/' } } };
export default function Page() { return <TerminalPage lang="zh" />; }
