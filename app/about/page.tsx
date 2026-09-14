import { languageAlternates } from '@/lib/routes';
import type { Metadata } from 'next';
import { AboutView } from '@/components/about-view';
export const metadata: Metadata = {
  alternates: languageAlternates('en', 'about'),
  title: 'About',
};
export default function Page() {
  return <AboutView lang="en" />;
}
