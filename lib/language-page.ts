import { getPost, getTranslation, type Language } from './content';
import { gameCatalogue } from './games';
import { pageHref } from './routes';
export function languagePage(path: string, lang: Language) {
  let title = '',
    description = '';
  if (path.startsWith('blog/')) {
    const slug = path.slice(5);
    const original =
      getPost(lang, slug) ?? getPost(lang === 'en' ? 'zh' : 'en', slug);
    const post =
      original?.lang === lang ? original : original && getTranslation(original);
    if (post) {
      path = `blog/${post.slug}`;
      title = post.title;
      description = post.description;
    }
  }
  if (!title) {
    const names: Record<string, [string, string]> = {
      '': ['Home', '首页'],
      blog: ['Writing', '写作'],
      projects: ['Projects', '项目'],
      about: ['About', '关于'],
      tags: ['Tags', '标签'],
      games: ['Games', '游戏'],
      terminal: ['Terminal', '终端'],
    };
    const game = gameCatalogue(lang).find((g) => path === `games/${g.slug}`);
    title =
      game?.title ?? names[path]?.[lang === 'en' ? 0 : 1] ?? 'crazyczy.com';
    const descriptions: Record<string, [string, string]> = {
      blog: [
        'Technical notes and build logs by CZY.',
        'CZY 的技术文章与构建记录。',
      ],
      games: [
        'Pixel-sized Snake and Starflight games.',
        '贪吃蛇和星际飞行像素小游戏。',
      ],
      terminal: [
        'Navigate crazyczy.com with simple commands.',
        '通过简单命令浏览 crazyczy.com。',
      ],
    };
    description =
      game?.description ??
      descriptions[path]?.[lang === 'en' ? 0 : 1] ??
      (lang === 'en'
        ? 'Zachary Cheng’s English-first personal site for writing, projects, and games, with Chinese support.'
        : 'Zachary Cheng 程致远的个人写作、项目、游戏与数字空间。');
  }
  return {
    path,
    title,
    description,
    href: pageHref(lang, path),
    article: path.startsWith('blog/'),
  };
}
