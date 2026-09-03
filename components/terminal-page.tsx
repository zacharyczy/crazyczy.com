import type { Language } from '@/lib/content';
import { SiteShell } from './site-shell';
import { TerminalView } from './terminal-view';

export function TerminalPage({ lang }: { lang: Language }) {
  return (
    <SiteShell lang={lang} active="terminal" path="terminal">
      <section className="page-wrap terminal-page">
        <p className="eyebrow">Shell / interactive</p>
        <h1 className="page-title">Terminal</h1>
        <p className="page-lead">{lang === 'zh' ? '输入 help 开始。这里的命令只用于浏览网站。' : 'Type help to begin. Commands here only navigate the website.'}</p>
        <TerminalView lang={lang} />
      </section>
    </SiteShell>
  );
}
