import enElephant from '@/content/posts/en/no-pink-elephant.md?raw';
import zhElephant from '@/content/posts/zh/no-pink-elephant.md?raw';
import enPpt from '@/content/posts/en/ppt-to-chinese.md?raw';
import zhPpt from '@/content/posts/zh/ppt-to-chinese.md?raw';
import enHello from '@/content/posts/en/hello-world.md?raw';
import enCompiler from '@/content/posts/en/compiler.md?raw';
import enCrazyczy from '@/content/posts/en/crazyczy.md?raw';
import enGentzen from '@/content/posts/en/gentzen.md?raw';
import zhCompiler from '@/content/posts/zh/compiler.md?raw';
import zhCrazyczy from '@/content/posts/zh/crazyczy.md?raw';
import zhGentzen from '@/content/posts/zh/gentzen.md?raw';
import zhHello from '@/content/posts/zh/hello-world.md?raw';
import enFocus from '@/content/essays/en/focus-takes-root-in-output.md?raw';
import zhFocus from '@/content/essays/zh/focus-takes-root-in-output.md?raw';
import enApology from '@/content/poems/en/apology.md?raw';
import zhApology from '@/content/poems/zh/apology.md?raw';
import enMiser from '@/content/posts/en/miser.md?raw';
import zhMiser from '@/content/posts/zh/miser.md?raw';
import enLifeline from '@/content/posts/en/lifeline.md?raw';
import zhLifeline from '@/content/posts/zh/lifeline.md?raw';

export type Language = 'zh' | 'en';

export type Post = {
  slug: string;
  title: string;
  description: string;
  publishDate: string;
  updatedDate: string;
  lang: Language;
  translationKey: string;
  tags: string[];
  draft: boolean;
  coverImage: string;
  body: string;
};

function parsePost(slug: string, raw: string): Post {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`Invalid frontmatter in ${slug}`);
  const values: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator > -1)
      values[line.slice(0, separator).trim()] = line
        .slice(separator + 1)
        .trim();
  }
  const required = [
    'title',
    'description',
    'publishDate',
    'updatedDate',
    'lang',
    'translationKey',
    'tags',
    'draft',
    'coverImage',
  ];
  for (const field of required)
    if (!values[field]) throw new Error(`Missing ${field} in ${slug}`);
  const lang = values.lang as Language;
  if (!['zh', 'en'].includes(lang))
    throw new Error(`Invalid language in ${slug}`);
  return {
    slug,
    title: values.title,
    description: values.description,
    publishDate: values.publishDate,
    updatedDate: values.updatedDate,
    lang,
    translationKey: values.translationKey,
    tags: values.tags
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((tag) => tag.trim()),
    draft: values.draft === 'true',
    coverImage: values.coverImage,
    body: match[2].trim(),
  };
}

const allPosts = [
  parsePost('miser', enMiser),
  parsePost('miser', zhMiser),
  parsePost('lifeline', enLifeline),
  parsePost('lifeline', zhLifeline),
  parsePost('focus-takes-root-in-output', enFocus),
  parsePost('focus-takes-root-in-output', zhFocus),
  parsePost('apology', enApology),
  parsePost('apology', zhApology),
  parsePost('no-pink-elephant', enElephant),
  parsePost('no-pink-elephant', zhElephant),
  parsePost('ppt-to-chinese', enPpt),
  parsePost('ppt-to-chinese', zhPpt),
  parsePost('hello-world', zhHello),
  parsePost('hello-world', enHello),
  parsePost('gentzen', zhGentzen),
  parsePost('gentzen', enGentzen),
  parsePost('compiler', zhCompiler),
  parsePost('compiler', enCompiler),
  parsePost('crazyczy', zhCrazyczy),
  parsePost('crazyczy', enCrazyczy),
];

export const posts = allPosts.filter((post) => !post.draft);
export function getPosts(lang: Language) {
  return posts
    .filter((post) => post.lang === lang)
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}
export function getPost(lang: Language, slug: string) {
  return posts.find((post) => post.lang === lang && post.slug === slug);
}
export function getTranslation(post: Post) {
  return posts.find(
    (candidate) =>
      candidate.translationKey === post.translationKey &&
      candidate.lang !== post.lang,
  );
}
export function getTags(lang: Language) {
  return [...new Set(getPosts(lang).flatMap((post) => post.tags))].sort();
}
