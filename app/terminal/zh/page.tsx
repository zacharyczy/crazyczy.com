import { languageAlternates } from '@/lib/routes';
import type { Metadata } from 'next';
import { TerminalPage } from '@/components/terminal-page';
export const metadata: Metadata = {
  title: 'Terminal',
  description: '通过简单命令浏览 crazyczy.com。',
  alternates: languageAlternates('zh', 'terminal'),
};
export default function Page() {
  return <TerminalPage lang="zh" />;
}
