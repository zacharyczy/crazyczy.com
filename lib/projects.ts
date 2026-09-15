import type { Language } from './content';

export const projects = {
  zh: [
    {
      year: '2026',
      status: '新项目',
      title: 'no-pink-elephant',
      description:
        '让模型在代码、文章、注释及回复中自然遵守用户负向要求，减少不必要的约束确认和禁止内容复述。',
      stack: ['Agent Skill', 'Prompting', 'Writing'],
      repository: 'https://github.com/zacharyczy/no-pink-elephant',
      articleSlug: 'no-pink-elephant',
    },
    {
      year: '2026',
      status: '新项目',
      title: 'ppt-to-chinese',
      description:
        '将英文 PowerPoint 整理成可阅读中文 Markdown 的 Agent Skill，保留页序、备注并提供结构检查。',
      stack: ['Python', 'MarkItDown', 'Agent Skill'],
      repository: 'https://github.com/zacharyczy/ppt-to-chinese',
      articleSlug: 'ppt-to-chinese',
    },
    {
      year: '2026',
      status: '持续更新',
      title: 'crazyczy.com',
      description:
        '以英文为主、提供中文支持的个人网站：技术写作、项目记录、像素主题、小游戏与终端导航。',
      stack: ['React', 'Vinext', 'Cloudflare'],
      repository: 'https://github.com/zacharyczy/crazyczy.com',
      articleSlug: 'crazyczy',
    },
    {
      year: '2026',
      status: '学习项目',
      title: 'Gentzen G′ Sequent Prover',
      description: '用 C++17 实现命题逻辑证明搜索、证明树输出与反模型验证。',
      stack: ['C++17', 'Logic', 'CLI'],
      repository: 'https://github.com/zacharyczy/gentzen',
      articleSlug: 'gentzen',
    },
    {
      year: '2026',
      status: '课程实验',
      title: 'NJU Compiler Principles Labs',
      description: '从词法语法分析、语义检查和 IR 到 MIPS32 生成与优化。',
      stack: ['C', 'Flex', 'Bison'],
      repository: 'https://github.com/zacharyczy/compiler',
      articleSlug: 'compiler',
    },
  ],
  en: [
    {
      year: '2026',
      status: 'New',
      title: 'no-pink-elephant',
      description:
        'An agent skill for quietly honoring negative user constraints across code, prose, comments, and replies.',
      stack: ['Agent Skill', 'Prompting', 'Writing'],
      repository: 'https://github.com/zacharyczy/no-pink-elephant',
      articleSlug: 'no-pink-elephant',
    },
    {
      year: '2026',
      status: 'New',
      title: 'ppt-to-chinese',
      description:
        'An agent skill for turning English PowerPoint decks into readable Chinese Markdown, with slide order, speaker notes, and structural checks.',
      stack: ['Python', 'MarkItDown', 'Agent Skill'],
      repository: 'https://github.com/zacharyczy/ppt-to-chinese',
      articleSlug: 'ppt-to-chinese',
    },
    {
      year: '2026',
      status: 'Active',
      title: 'crazyczy.com',
      description:
        'An English-first personal site with Chinese support for writing, projects, pixel themes, small games, and terminal navigation.',
      stack: ['React', 'Vinext', 'Cloudflare'],
      repository: 'https://github.com/zacharyczy/crazyczy.com',
      articleSlug: 'crazyczy',
    },
    {
      year: '2026',
      status: 'Study project',
      title: 'Gentzen G′ Sequent Prover',
      description:
        'A C++17 propositional proof searcher with proof trees and verified countermodels.',
      stack: ['C++17', 'Logic', 'CLI'],
      repository: 'https://github.com/zacharyczy/gentzen',
      articleSlug: 'gentzen',
    },
    {
      year: '2026',
      status: 'Course labs',
      title: 'NJU Compiler Principles Labs',
      description:
        'A pipeline from parsing and semantic analysis through IR, MIPS32 generation, and optimization.',
      stack: ['C', 'Flex', 'Bison'],
      repository: 'https://github.com/zacharyczy/compiler',
      articleSlug: 'compiler',
    },
  ],
} satisfies Record<
  Language,
  Array<{
    year: string;
    status: string;
    title: string;
    description: string;
    stack: string[];
    repository: string;
    articleSlug: string;
  }>
>;
