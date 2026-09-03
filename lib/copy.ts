import type { Language } from './content';

export const copy = {
  zh: {
    locale: 'zh-CN', home: '首页', blog: '文章', projects: '项目', games: '游戏', terminal: '终端', about: '关于', tags: '标签',
    greeting: '你好，我是 CZY。', lead: '一个关于代码、产品与持续创造的个人空间。这里记录我做过的项目，也整理那些值得留下的技术思考。',
    read: '阅读文章', browse: '浏览项目', latest: '最近在写', latestHint: '技术笔记、构建过程，以及偶尔偏离主题的观察。',
    allWriting: '全部文章', allWritingHint: '关于 Web 开发、产品设计与更平静的工作方式。',
    projectsTitle: '正在构建', projectsHint: '有些项目解决问题，有些项目帮助我提出更好的问题。',
    aboutTitle: '关于我', aboutLead: '我喜欢把复杂的事情做得清楚、可靠，并且足够好用。',
    back: '返回文章', language: 'English', languageCode: 'EN', readTime: '3 分钟阅读',
  },
  en: {
    locale: 'en', home: 'Home', blog: 'Writing', projects: 'Projects', games: 'Games', terminal: 'Terminal', about: 'About', tags: 'Tags',
    greeting: 'Hi, I’m CZY.', lead: 'A personal space about code, products, and the practice of making. I share projects here—and keep the technical ideas worth returning to.',
    read: 'Read the writing', browse: 'View projects', latest: 'Latest writing', latestHint: 'Technical notes, build logs, and the occasional useful tangent.',
    allWriting: 'All writing', allWritingHint: 'Web development, product design, and calmer ways of working.',
    projectsTitle: 'Things I’m building', projectsHint: 'Some projects solve problems. Others help me ask better questions.',
    aboutTitle: 'About me', aboutLead: 'I like making complicated things clear, reliable, and genuinely useful.',
    back: 'Back to writing', language: '中文', languageCode: '中文', readTime: '3 min read',
  },
} satisfies Record<Language, Record<string, string>>;
