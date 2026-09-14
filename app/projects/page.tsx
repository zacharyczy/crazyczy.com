import { languageAlternates } from '@/lib/routes';
import type { Metadata } from 'next';
import { ProjectsView } from '@/components/projects-view';
export const metadata: Metadata = {
  alternates: languageAlternates('en', 'projects'),
  title: 'Projects',
};
export default function Page() {
  return <ProjectsView lang="en" />;
}
