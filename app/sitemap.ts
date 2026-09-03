import type { MetadataRoute } from 'next';
import { posts } from '@/lib/content';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://crazyczy.com';
  const staticRoutes = ['zh', 'en'].flatMap((lang) => ['', 'blog', 'projects', 'about', 'tags'].map((path) => ({ url: `${base}/${lang}/${path ? `${path}/` : ''}`, lastModified: new Date('2026-09-03') })));
  const articleRoutes = posts.map((post) => ({ url: `${base}/${post.lang}/blog/${post.slug}/`, lastModified: new Date(post.updatedDate) }));
  return [...staticRoutes, ...articleRoutes];
}
