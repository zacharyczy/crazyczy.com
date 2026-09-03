import enHello from '@/content/posts/en/hello-world.md?raw';
import zhHello from '@/content/posts/zh/hello-world.md?raw';

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
    if (separator > -1) values[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  const required = ['title', 'description', 'publishDate', 'updatedDate', 'lang', 'translationKey', 'tags', 'draft', 'coverImage'];
  for (const field of required) if (!values[field]) throw new Error(`Missing ${field} in ${slug}`);
  const lang = values.lang as Language;
  if (!['zh', 'en'].includes(lang)) throw new Error(`Invalid language in ${slug}`);
  return {
    slug,
    title: values.title,
    description: values.description,
    publishDate: values.publishDate,
    updatedDate: values.updatedDate,
    lang,
    translationKey: values.translationKey,
    tags: values.tags.replace(/^\[|\]$/g, '').split(',').map((tag) => tag.trim()),
    draft: values.draft === 'true',
    coverImage: values.coverImage,
    body: match[2].trim(),
  };
}

const allPosts = [parsePost('hello-world', zhHello), parsePost('hello-world', enHello)];

export const posts = allPosts.filter((post) => !post.draft);
export function getPosts(lang: Language) {
  return posts.filter((post) => post.lang === lang).sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}
export function getPost(lang: Language, slug: string) {
  return posts.find((post) => post.lang === lang && post.slug === slug);
}
export function getTranslation(post: Post) {
  return posts.find((candidate) => candidate.translationKey === post.translationKey && candidate.lang !== post.lang);
}
export function getTags(lang: Language) {
  return [...new Set(getPosts(lang).flatMap((post) => post.tags))].sort();
}
