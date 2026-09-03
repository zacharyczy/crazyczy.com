import type { MetadataRoute } from 'next';
import { posts } from '@/lib/content';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://crazyczy.com';
  const paths = ['', 'blog', 'projects', 'games', 'games/snake', 'games/starflight', 'terminal', 'about', 'tags'];
  const staticRoutes = ['zh', 'en'].flatMap((lang) => paths.map((path) => ({ url: `${base}/${lang}/${path ? `${path}/` : ''}`, lastModified: new Date('2026-09-04') })));
  const articleRoutes = posts.map((post) => ({ url: `${base}/${post.lang}/blog/${post.slug}/`, lastModified: new Date(post.updatedDate) }));
  return [...staticRoutes, ...articleRoutes];
}
