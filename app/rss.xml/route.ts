import { posts } from '@/lib/content';
function escapeXml(value: string) { return value.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char]!); }
export function GET() {
  const items = posts.map((post) => `<item><title>${escapeXml(post.title)}</title><link>https://crazyczy.com/${post.lang}/blog/${post.slug}/</link><guid>https://crazyczy.com/${post.lang}/blog/${post.slug}/</guid><description>${escapeXml(post.description)}</description><pubDate>${new Date(post.publishDate).toUTCString()}</pubDate><language>${post.lang}</language></item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>CZY — Writing</title><link>https://crazyczy.com</link><description>Code, products, and the practice of making.</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
