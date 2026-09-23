import { getSuggestionsDb } from '@/db';
import { getPost, type Language } from '@/lib/content';

export const dynamic = 'force-dynamic';

const visitorPattern = /^[a-zA-Z0-9-]{16,64}$/;
const slugPattern = /^[a-z0-9-]+$/;
type CommentRow = {
  id: string;
  author: string;
  body: string;
  created_at: number;
  likes: number;
  liked: number;
  is_mine: number;
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

function visitorFrom(request: Request) {
  const id = request.headers.get('x-czy-visitor') ?? '';
  return visitorPattern.test(id) ? id : null;
}

function postFrom(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const { lang, slug } = value as { lang?: string; slug?: string };
  if ((lang !== 'en' && lang !== 'zh') || !slug || !slugPattern.test(slug)) return null;
  if (!getPost(lang as Language, slug)) return null;
  return `${lang}:${slug}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const postKey = postFrom({
    lang: url.searchParams.get('lang'),
    slug: url.searchParams.get('slug'),
  });
  if (!postKey) return json({ error: 'Writing not found.' }, 404);
  const visitorId = visitorFrom(request) ?? '';
  const db = getSuggestionsDb();
  const article = await db.prepare(
    "SELECT COUNT(*) AS likes, COALESCE(MAX(CASE WHEN visitor_id = ? THEN 1 ELSE 0 END), 0) AS liked FROM writing_likes WHERE target_kind = 'post' AND target_id = ?",
  ).bind(visitorId, postKey).first<{ likes: number; liked: number }>();
  const result = await db.prepare(
    `SELECT c.id, c.author, c.body, c.created_at,
      (SELECT COUNT(*) FROM writing_likes l WHERE l.target_kind = 'comment' AND l.target_id = c.id) AS likes,
      EXISTS(SELECT 1 FROM writing_likes l WHERE l.target_kind = 'comment' AND l.target_id = c.id AND l.visitor_id = ?) AS liked,
      (c.visitor_id = ?) AS is_mine
     FROM writing_comments c WHERE c.post_key = ? ORDER BY c.created_at DESC`,
  ).bind(visitorId, visitorId, postKey).all<CommentRow>();
  return json({
    likes: article?.likes ?? 0,
    liked: Boolean(article?.liked),
    comments: (result.results ?? []).map((row) => ({
      id: row.id,
      name: row.author,
      text: row.body,
      createdAt: row.created_at,
      likes: row.likes,
      liked: Boolean(row.liked),
      isMine: Boolean(row.is_mine),
    })),
  });
}

export async function POST(request: Request) {
  const visitorId = visitorFrom(request);
  if (!visitorId) return json({ error: 'A valid visitor id is required.' }, 400);
  const payload = await request.json().catch(() => null) as
    | null
    | { kind?: string; lang?: string; slug?: string; text?: string; commentId?: string };
  const postKey = postFrom(payload);
  if (!postKey) return json({ error: 'Writing not found.' }, 404);
  const db = getSuggestionsDb();

  if (payload?.kind === 'comment') {
    const body = payload.text?.trim().slice(0, 280) ?? '';
    if (!body) return json({ error: 'Write something first.' }, 400);
    const now = Date.now();
    const day = new Date(now).toISOString().slice(0, 10);
    const dayStart = Date.parse(`${day}T00:00:00.000Z`);
    const id = crypto.randomUUID();
    const result = await db.prepare(
      `INSERT INTO writing_comments (id, post_key, visitor_id, author, body, created_at)
       SELECT ?, ?, ?, 'Guest', ?, ?
       WHERE (SELECT COUNT(*) FROM writing_comments
              WHERE visitor_id = ? AND created_at >= ? AND created_at < ?) < 2`,
    ).bind(id, postKey, visitorId, body, now, visitorId, dayStart, dayStart + 86400000).run();
    if (!result.meta.changes) return json({ error: 'Daily limit reached.' }, 429);
    return json({
      id,
      name: 'Guest',
      text: body,
      createdAt: now,
      likes: 0,
      liked: false,
      isMine: true,
    }, 201);
  }

  if (payload?.kind === 'like') {
    const targetKind = payload.commentId ? 'comment' : 'post';
    const targetId = payload.commentId ?? postKey;
    if (targetKind === 'comment') {
      const comment = await db.prepare(
        'SELECT visitor_id FROM writing_comments WHERE id = ? AND post_key = ?',
      ).bind(targetId, postKey).first<{ visitor_id: string }>();
      if (!comment) return json({ error: 'Comment not found.' }, 404);
      if (comment.visitor_id === visitorId) return json({ error: 'You cannot like your own comment.' }, 403);
    }
    const result = await db.prepare(
      'INSERT OR IGNORE INTO writing_likes (id, post_key, target_kind, target_id, visitor_id, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    ).bind(crypto.randomUUID(), postKey, targetKind, targetId, visitorId, Date.now()).run();
    if (!result.meta.changes) return json({ error: 'You already liked this.' }, 409);
    return json({ ok: true });
  }

  return json({ error: 'Unsupported action.' }, 400);
}
