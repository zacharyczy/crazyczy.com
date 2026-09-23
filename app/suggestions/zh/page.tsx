import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-shell';
import { SuggestionsPanel } from '@/components/suggestions-panel';
import { languageAlternates } from '@/lib/routes';

export const metadata: Metadata = {
  title: '建议',
  description: '向 crazyczy.com 提建议，阅读其他访客的留言。',
  alternates: languageAlternates('zh', 'suggestions'),
};

export default function Page() {
  return <SiteShell lang="zh" path="suggestions"><div className="article-wrap"><SuggestionsPanel lang="zh" standalone /></div></SiteShell>;
}
