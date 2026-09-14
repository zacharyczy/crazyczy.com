import { languageAlternates } from '@/lib/routes';
import type { Metadata } from 'next';
import { TerminalPage } from '@/components/terminal-page';
export const metadata: Metadata = {
  title: 'Terminal',
  description: 'Navigate crazyczy.com with simple commands.',
  alternates: languageAlternates('en', 'terminal'),
};
export default function Page() {
  return <TerminalPage lang="en" />;
}
