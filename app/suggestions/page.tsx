import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-shell';
import { SuggestionsPanel } from '@/components/suggestions-panel';
import { languageAlternates } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Suggestions',
  description: 'Leave a suggestion for crazyczy.com and read notes from other visitors.',
  alternates: languageAlternates('en', 'suggestions'),
};

export default function Page() {
  return <SiteShell lang="en" path="suggestions"><div className="article-wrap"><SuggestionsPanel lang="en" standalone /></div></SiteShell>;
}
