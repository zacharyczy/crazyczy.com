import type { Language } from './content';

export const projects = {
  zh: [
    { year: '2026', status: '持续更新', title: 'crazyczy.com', description: '双语个人网站：技术写作、项目记录、像素主题、小游戏与终端导航。', stack: ['React', 'Vinext', 'Cloudflare'], repository: 'https://github.com/zacharyczy/crazyczy.com', articleSlug: 'crazyczy' },
    { year: '2026', status: '学习项目', title: 'Gentzen G′ Sequent Prover', description: '用 C++17 实现命题逻辑证明搜索、证明树输出与反模型验证。', stack: ['C++17', 'Logic', 'CLI'], repository: 'https://github.com/zacharyczy/gentzen', articleSlug: 'gentzen' },
    { year: '2026', status: '课程实验', title: 'NJU Compiler Principles Labs', description: '从词法语法分析、语义检查和 IR 到 MIPS32 生成与优化。', stack: ['C', 'Flex', 'Bison'], repository: 'https://github.com/zacharyczy/compiler', articleSlug: 'compiler' },
  ],
  en: [
    { year: '2026', status: 'Active', title: 'crazyczy.com', description: 'A bilingual personal site for writing, projects, pixel themes, small games, and terminal navigation.', stack: ['React', 'Vinext', 'Cloudflare'], repository: 'https://github.com/zacharyczy/crazyczy.com', articleSlug: 'crazyczy' },
    { year: '2026', status: 'Study project', title: 'Gentzen G′ Sequent Prover', description: 'A C++17 propositional proof searcher with proof trees and verified countermodels.', stack: ['C++17', 'Logic', 'CLI'], repository: 'https://github.com/zacharyczy/gentzen', articleSlug: 'gentzen' },
    { year: '2026', status: 'Course labs', title: 'NJU Compiler Principles Labs', description: 'A pipeline from parsing and semantic analysis through IR, MIPS32 generation, and optimization.', stack: ['C', 'Flex', 'Bison'], repository: 'https://github.com/zacharyczy/compiler', articleSlug: 'compiler' },
  ],
} satisfies Record<Language, Array<{ year: string; status: string; title: string; description: string; stack: string[];
  repository: string; articleSlug: string }>>;
