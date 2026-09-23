import type { MetadataRoute } from 'next';
import { posts, type Language } from '@/lib/content';
import { pageHref, languageAlternates } from '@/lib/routes';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://crazyczy.com';
  const paths = [
    '',
    'blog',
    'projects',
    'games',
    'games/snake',
    'games/starflight',
    'terminal',
    'about',
    'tags',
    'suggestions',
  ];
  const entry = (lang: Language, path: string, date: string) => ({
    url: base + pageHref(lang, path),
    lastModified: new Date(date),
    alternates: {
      languages: Object.fromEntries(
        Object.entries(languageAlternates(lang, path).languages).map(
          ([key, value]) => [key, base + value],
        ),
      ),
    },
  });
  return [
    ...(['en', 'zh'] as const).flatMap((lang) =>
      paths.map((path) => entry(lang, path, '2026-09-14')),
    ),
    ...posts.map((post) =>
      entry(post.lang, `blog/${post.slug}`, post.updatedDate),
    ),
  ];
}
