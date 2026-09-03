import type { Language } from './content';

export const projects = {
  zh: [
    { year: '2026', status: '进行中', title: 'crazyczy.com', description: '双语个人技术博客与长期数字花园。', stack: ['React', 'Cloudflare', 'Markdown'] },
    { year: '2026', status: '实验', title: 'Signal Notes', description: '把零散技术笔记整理为可检索知识的小工具。', stack: ['TypeScript', 'Search'] },
  ],
  en: [
    { year: '2026', status: 'In progress', title: 'crazyczy.com', description: 'A bilingual technical blog and long-term digital garden.', stack: ['React', 'Cloudflare', 'Markdown'] },
    { year: '2026', status: 'Experiment', title: 'Signal Notes', description: 'A tiny tool for turning scattered technical notes into searchable knowledge.', stack: ['TypeScript', 'Search'] },
  ],
} satisfies Record<Language, Array<{ year: string; status: string; title: string; description: string; stack: string[] }>>;
