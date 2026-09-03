'use client';

import { KeyboardEvent, useState } from 'react';
import type { Language } from '@/lib/content';

type Line = { kind: 'command' | 'output' | 'error'; text: string };

const ROUTES = ['home', 'blog', 'projects', 'games', 'about'] as const;

export function TerminalView({ lang }: { lang: Language }) {
  const [lines, setLines] = useState<Line[]>([
    { kind: 'output', text: lang === 'zh' ? 'crazyczy shell 已连接。输入 help 查看命令。' : 'crazyczy shell connected. Type help for commands.' },
  ]);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  function navigate(route: string) {
    const path = route === 'home' ? '' : route;
    window.location.assign('/' + lang + '/' + (path ? path + '/' : ''));
  }

  function execute(raw: string) {
    const command = raw.trim();
    if (!command) return;
    const [name = '', argument = ''] = command.split(/\s+/);
    const nextLines: Line[] = [{ kind: 'command', text: command }];
    const help = lang === 'zh'
      ? 'help  ls  pwd  cd <目录>  home  blog  projects  games  about  lang  clear  whoami  date'
      : 'help  ls  pwd  cd <dir>  home  blog  projects  games  about  lang  clear  whoami  date';

    if (name === 'clear') {
      setLines([]);
    } else if (name === 'help') {
      setLines((current) => [...current, ...nextLines, { kind: 'output', text: help }]);
    } else if (name === 'ls') {
      setLines((current) => [...current, ...nextLines, { kind: 'output', text: 'home/  blog/  projects/  games/  about/' }]);
    } else if (name === 'pwd') {
      setLines((current) => [...current, ...nextLines, { kind: 'output', text: '/crazyczy/' + lang + '/terminal' }]);
    } else if (name === 'whoami') {
      setLines((current) => [...current, ...nextLines, { kind: 'output', text: 'Zachary Cheng / 程致远' }]);
    } else if (name === 'date') {
      setLines((current) => [...current, ...nextLines, { kind: 'output', text: new Date().toLocaleString(lang === 'zh' ? 'zh-CN' : 'en') }]);
    } else if (name === 'lang') {
      window.location.assign('/' + (lang === 'zh' ? 'en' : 'zh') + '/terminal/');
    } else if (name === 'cd') {
      if (!argument) {
        setLines((current) => [...current, ...nextLines, { kind: 'error', text: lang === 'zh' ? 'cd: 缺少目录' : 'cd: missing directory' }]);
      } else if (argument === '..' || argument === '/' || argument === '~' || argument === 'home') {
        navigate('home');
      } else if ((ROUTES as readonly string[]).includes(argument)) {
        navigate(argument);
      } else {
        setLines((current) => [...current, ...nextLines, { kind: 'error', text: 'cd: ' + argument + ': ' + (lang === 'zh' ? '没有这个目录' : 'no such directory') }]);
      }
    } else if ((ROUTES as readonly string[]).includes(name)) {
      navigate(name);
    } else {
      setLines((current) => [...current, ...nextLines, { kind: 'error', text: name + ': ' + (lang === 'zh' ? '找不到命令；试试 help' : 'command not found; try help') }]);
    }

    setHistory((current) => [...current, command]);
    setHistoryIndex(-1);
    setValue('');
  }


  function historyKey(event: KeyboardEvent<HTMLInputElement>) {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key) || history.length === 0) return;
    event.preventDefault();
    const next = event.key === 'ArrowUp'
      ? Math.min(history.length - 1, historyIndex + 1)
      : Math.max(-1, historyIndex - 1);
    setHistoryIndex(next);
    setValue(next === -1 ? '' : history[history.length - 1 - next]);
  }

  return (
    <section className="terminal-window" aria-label={lang === 'zh' ? '交互式终端' : 'Interactive terminal'}>
      <div className="terminal-titlebar"><span aria-hidden="true">■ ■ ■</span><b>guest@crazyczy:~</b></div>
      <div className="terminal-output" aria-live="polite">
        {lines.map((line, index) => (
          <p key={index} className={'terminal-line ' + line.kind}>
            {line.kind === 'command' && <span className="terminal-prompt">guest@crazyczy:~$ </span>}{line.text}
          </p>
        ))}
        <form onSubmit={(event) => { event.preventDefault(); execute(value); }} className="terminal-form">
          <label htmlFor="terminal-input" className="terminal-prompt">guest@crazyczy:~$</label>
          <input id="terminal-input" value={value} onChange={(event) => setValue(event.target.value)}
            onKeyDown={historyKey} autoComplete="off" autoCapitalize="none" spellCheck={false} aria-label={lang === 'zh' ? '输入命令' : 'Enter command'} />
        </form>
      </div>
    </section>
  );
}
