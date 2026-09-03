import { Fragment, type ReactNode } from 'react';

function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((part, index) =>
    part.startsWith('`') && part.endsWith('`')
      ? <code key={index}>{part.slice(1, -1)}</code>
      : <Fragment key={index}>{part}</Fragment>
  );
}

export function Markdown({ source }: { source: string }) {
  const lines = source.split(/\r?\n/);
  const nodes: ReactNode[] = [];
  let code: string[] | null = null;
  lines.forEach((line, index) => {
    if (line.startsWith('```')) {
      if (code) { nodes.push(<pre key={`code-${index}`}><code>{code.join('\n')}</code></pre>); code = null; }
      else code = [];
      return;
    }
    if (code) { code.push(line); return; }
    if (line.startsWith('## ')) nodes.push(<h2 key={index}>{inline(line.slice(3))}</h2>);
    else if (line.startsWith('- ')) nodes.push(<li key={index}>{inline(line.slice(2))}</li>);
    else if (line.trim()) nodes.push(<p key={index}>{inline(line)}</p>);
  });
  return <div className="prose-tech">{nodes}</div>;
}
