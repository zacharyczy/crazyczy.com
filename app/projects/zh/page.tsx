import { languageAlternates } from '@/lib/routes';
import type { Metadata } from 'next';
import { ProjectsView } from '@/components/projects-view';
export const metadata: Metadata = {
  alternates: languageAlternates('zh', 'projects'),
  title: '项目',
};
export default function Page() {
  return <ProjectsView lang="zh" />;
}
