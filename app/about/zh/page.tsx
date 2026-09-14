import { languageAlternates } from '@/lib/routes';
import type { Metadata } from 'next';
import { AboutView } from '@/components/about-view';
export const metadata: Metadata = {
  alternates: languageAlternates('zh', 'about'),
  title: '关于',
};
export default function Page() {
  return <AboutView lang="zh" />;
}
