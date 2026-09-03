import type { Language } from '@/lib/content';
import { copy } from '@/lib/copy';
import { projects } from '@/lib/projects';
import { SiteShell } from './site-shell';

export function ProjectsView({ lang }: { lang: Language }) {
  const t = copy[lang];
  return <SiteShell lang={lang} active="projects"><section className="page-wrap"><p className="eyebrow">Selected work</p><h1 className="page-title">{t.projectsTitle}</h1><p className="page-lead">{t.projectsHint}</p><div className="mt-14 grid gap-4 md:grid-cols-2">{projects[lang].map((project, index) => <article key={project.title} className="project-card"><div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[.14em] text-slate-600"><span>0{index + 1} / {project.year}</span><span className="text-emerald-300/70">{project.status}</span></div><h2 className="mt-16 text-2xl font-semibold text-white">{project.title}</h2><p className="mt-3 text-sm leading-6 text-slate-500">{project.description}</p><div className="mt-8 flex flex-wrap gap-2">{project.stack.map((item) => <span key={item} className="tag">{item}</span>)}</div></article>)}</div></section></SiteShell>;
}
