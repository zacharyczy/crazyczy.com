import { getSuggestionsDb } from '@/db';

export const dynamic = 'force-dynamic';

type SuggestionRow = {
  id: string;
  author: string;
  body: string;
  score: number;
  created_at: number;
};

const visitorPattern = /^[a-zA-Z0-9-]{16,64}$/;

function visitorFrom(request: Request) {
  const id = request.headers.get('x-czy-visitor') ?? '';
  return visitorPattern.test(id) ? id : null;
}

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET() {
  const db = getSuggestionsDb();
  const result = await db.prepare(
    'SELECT id, author, body, score, created_at FROM suggestions ORDER BY created_at DESC LIMIT 100',
  ).all<SuggestionRow>();
  const rows = result.results ?? [];
  const latest = rows.slice(0, 3);
  const latestIds = new Set(latest.map((row) => row.id));
  const ranked = rows.filter((row) => !latestIds.has(row.id)).sort((a, b) => b.score - a.score || b.created_at - a.created_at);
  return json([...latest, ...ranked].map((row) => ({
    id: row.id,
    name: row.author,
    text: row.body,
    score: row.score,
    createdAt: row.created_at,
  })));
}

export async function POST(request: Request) {
  const visitorId = visitorFrom(request);
  if (!visitorId) return json({ error: 'A valid visitor id is required.' }, 400);
  const db = getSuggestionsDb();
  const payload = await request.json().catch(() => null) as null | { kind?: string; text?: string; id?: string; value?: number };

  if (payload?.kind === 'comment') {
    const body = payload.text?.trim().slice(0, 280) ?? '';
    if (!body) return json({ error: 'Write something first.' }, 400);
    const dayKey = new Date().toISOString().slice(0, 10);
    const usageId = `${visitorId}:${dayKey}`;
    const usage = await db.prepare(
      'SELECT count FROM daily_suggestion_usage WHERE visitor_id = ? AND day_key = ?',
    ).bind(visitorId, dayKey).first<{ count: number }>();
    if ((usage?.count ?? 0) >= 2) return json({ error: 'Daily limit reached.' }, 429);
    const id = crypto.randomUUID();
    const createdAt = Date.now();
    await db.batch([
      db.prepare('INSERT INTO suggestions (id, author, body, score, created_at) VALUES (?, ?, ?, 0, ?)').bind(id, 'Guest', body, createdAt),
      db.prepare(
        'INSERT INTO daily_suggestion_usage (id, visitor_id, day_key, count) VALUES (?, ?, ?, 1) ON CONFLICT(visitor_id, day_key) DO UPDATE SET count = count + 1',
      ).bind(usageId, visitorId, dayKey),
    ]);
    return json({ id, name: 'Guest', text: body, score: 0, createdAt }, 201);
  }

  if (payload?.kind === 'vote') {
    const suggestionId = payload.id ?? '';
    const value = payload.value === -1 ? -1 : payload.value === 1 ? 1 : 0;
    if (!suggestionId || !value) return json({ error: 'Invalid vote.' }, 400);
    try {
      await db.batch([
        db.prepare('INSERT INTO suggestion_votes (id, suggestion_id, visitor_id, value, created_at) VALUES (?, ?, ?, ?, ?)').bind(crypto.randomUUID(), suggestionId, visitorId, value, Date.now()),
        db.prepare('UPDATE suggestions SET score = score + ? WHERE id = ?').bind(value, suggestionId),
      ]);
      return json({ ok: true });
    } catch {
      return json({ error: 'You already voted on this note.' }, 409);
    }
  }

  return json({ error: 'Unsupported action.' }, 400);
}
