import { Fragment, type ReactNode } from 'react';

function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|~~[^~]+~~)/g).map((part, index) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code key={index}>{part.slice(1, -1)}</code>
    ) : part.startsWith('**') && part.endsWith('**') ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : part.startsWith('~~') && part.endsWith('~~') ? (
      <del key={index}>{part.slice(2, -2)}</del>
    ) : (
      (() => {
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link && /^(https?:\/\/|\/(?!\/)|#)/.test(link[2]))
          return (
            <a
              key={index}
              href={link[2]}
              target={link[2].startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
            >
              {link[1]}
            </a>
          );
        return <Fragment key={index}>{part}</Fragment>;
      })()
    ),
  );
}

function joinSoftLines(lines: string[]) {
  return lines.reduce((joined, line, index) => {
    if (index === 0) return line;
    return joined + (/^[\u3400-\u9fff]/u.test(line) ? '' : ' ') + line;
  }, '');
}

export function Markdown({ source, poem = false }: { source: string; poem?: boolean }) {
  if (poem) {
    return <div className="prose-tech poem-text">{source.trim().split(/\r?\n\s*\r?\n/).map((stanza, index) => (
      <p key={index}>{stanza.trim()}</p>
    ))}</div>;
  }
  const lines = source.split(/\r?\n/);
  const nodes: ReactNode[] = [];
  let code: string[] | null = null;
  let paragraph: string[] = [];
  let paragraphStart = 0;
  const flushParagraph = () => {
    if (!paragraph.length) return;
    nodes.push(<p key={paragraphStart}>{inline(joinSoftLines(paragraph))}</p>);
    paragraph = [];
  };
  lines.forEach((line, index) => {
    if (line.startsWith('```')) {
      flushParagraph();
      if (code) {
        nodes.push(
          <pre key={`code-${index}`}>
            <code>{code.join('\n')}</code>
          </pre>,
        );
        code = null;
      } else code = [];
      return;
    }
    if (code) {
      code.push(line);
      return;
    }
    if (!line.trim()) {
      flushParagraph();
      return;
    }
    if (line.startsWith('## ')) {
      flushParagraph();
      nodes.push(<h2 key={index}>{inline(line.slice(3))}</h2>);
    } else if (line.startsWith('- ')) {
      flushParagraph();
      nodes.push(<li key={index}>{inline(line.slice(2))}</li>);
    } else {
      if (!paragraph.length) paragraphStart = index;
      paragraph.push(line.trim());
    }
  });
  flushParagraph();
  return <div className="prose-tech">{nodes}</div>;
}
