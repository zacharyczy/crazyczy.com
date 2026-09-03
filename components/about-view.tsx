import type { Language } from '@/lib/content';
import { copy } from '@/lib/copy';
import { SiteShell } from './site-shell';

export function AboutView({ lang }: { lang: Language }) {
  const t = copy[lang];
  const paragraphs = lang === 'zh'
    ? ['我关注 Web、产品与工具如何改变我们思考和创造的方式。比起追逐每一个新东西，我更喜欢理解基础、建立清晰的系统，然后把它们真正做出来。', '这个网站是我的公开工作台：项目会在这里留下过程，文章会把零散经验整理成可以再次使用的知识。']
    : ['I care about the web, products, and the ways tools shape how we think and make. Instead of chasing every new thing, I prefer understanding the foundations, building clear systems, and shipping them.', 'This site is my public workbench: projects leave a trail here, while writing turns scattered experience into knowledge I can use again.'];
  return <SiteShell lang={lang} active="about"><section className="page-wrap"><div className="grid gap-12 lg:grid-cols-[.65fr_1.35fr]"><div><p className="eyebrow">Profile / CZY</p><h1 className="page-title">{t.aboutTitle}</h1></div><div className="pt-3"><p className="text-lg leading-8 text-slate-200">{t.aboutLead}</p><div className="mt-8 space-y-6 text-base leading-8 text-slate-500">{paragraphs.map((p) => <p key={p}>{p}</p>)}</div><dl className="mt-10 grid grid-cols-2 gap-6 border-t border-white/8 pt-8 font-mono text-xs"><div><dt className="text-slate-600">Location</dt><dd className="mt-2 text-slate-300">Shanghai · UTC+8</dd></div><div><dt className="text-slate-600">Focus</dt><dd className="mt-2 text-slate-300">Web · Product · Writing</dd></div></dl></div></div></section></SiteShell>;
}
