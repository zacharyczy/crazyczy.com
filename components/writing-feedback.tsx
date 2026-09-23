'use client';

import { Heart, Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Language } from '@/lib/content';

type Comment = {
  id: string;
  name: string;
  text: string;
  createdAt: number;
  likes: number;
  liked: boolean;
  isMine: boolean;
};
type WritingActivity = { likes: number; liked: boolean; comments: Comment[] };

const LABELS = {
  en: {
    like: 'Like this writing',
    liked: 'Liked',
    comments: 'Comments',
    placeholder: 'Leave a comment…',
    send: 'Post comment',
    limit: 'Up to two comments per day across Writing.',
    daily: 'Two comments today — come back tomorrow.',
    duplicate: 'You already liked this.',
    own: 'You cannot like your own comment.',
    unavailable: 'Comments are temporarily unavailable.',
    empty: 'No comments yet.',
    likeComment: 'Like comment',
  },
  zh: {
    like: '喜欢这篇作品',
    liked: '已点赞',
    comments: '评论',
    placeholder: '写下评论…',
    send: '发表评论',
    limit: '整个 Writing 每天最多评论两条。',
    daily: '今天已经评论两条，明天再来吧。',
    duplicate: '你已经点过赞了。',
    own: '不能给自己的评论点赞。',
    unavailable: '评论暂时无法加载。',
    empty: '还没有评论。',
    likeComment: '给评论点赞',
  },
};

function visitorId() {
  const key = 'crazyczy-visitor';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(key, created);
  return created;
}

export function WritingFeedback({ lang, slug }: { lang: Language; slug: string }) {
  const t = LABELS[lang];
  const [activity, setActivity] = useState<WritingActivity | null>(null);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const endpoint = `/api/writing?lang=${lang}&slug=${encodeURIComponent(slug)}`;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        cache: 'no-store',
        headers: { 'x-czy-visitor': visitorId() },
      });
      if (!response.ok) throw new Error('request failed');
      setActivity(await response.json() as WritingActivity);
      setStatus('');
    } catch {
      setStatus(LABELS[lang].unavailable);
    } finally {
      setLoading(false);
    }
  }, [endpoint, lang]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => void refresh());
    return () => cancelAnimationFrame(frame);
  }, [refresh]);

  async function post(payload: Record<string, unknown>) {
    const response = await fetch('/api/writing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-czy-visitor': visitorId(),
      },
      body: JSON.stringify({ lang, slug, ...payload }),
    });
    if (!response.ok) throw response.status;
    return response;
  }

  async function like(commentId?: string) {
    if (busy) return;
    setBusy(true);
    try {
      await post({ kind: 'like', ...(commentId ? { commentId } : {}) });
      await refresh();
    } catch (error) {
      setStatus(error === 409 ? t.duplicate : error === 403 ? t.own : t.unavailable);
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      await post({ kind: 'comment', text });
      setDraft('');
      await refresh();
    } catch (error) {
      setStatus(error === 429 ? t.daily : t.unavailable);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="writing-feedback" aria-label={t.comments}>
      <div className="writing-feedback-head">
        <h2>{t.comments}</h2>
        <button
          type="button"
          className="writing-like"
          onClick={() => void like()}
          disabled={busy || loading || !activity || activity.liked}
          aria-pressed={activity?.liked ?? false}
          aria-label={activity?.liked ? t.liked : t.like}
        >
          <Heart aria-hidden="true" fill={activity?.liked ? 'currentColor' : 'none'} />
          <span>{activity?.liked ? t.liked : t.like}</span>
          <strong>{activity?.likes ?? 0}</strong>
        </button>
      </div>
      <div className="note-composer">
        <textarea
          maxLength={280}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t.placeholder}
          aria-label={t.placeholder}
        />
        <div>
          <small>{t.limit}</small>
          <button type="button" onClick={() => void submit()} disabled={busy || !draft.trim()}>
            <Send aria-hidden="true" />{t.send}
          </button>
        </div>
      </div>
      {status && <output className="writing-feedback-status">{status}</output>}
      {loading && !activity && <p className="writing-feedback-status">···</p>}
      {!loading && activity?.comments.length === 0 && <p className="writing-feedback-status">{t.empty}</p>}
      <div className="visitor-notes">
        {activity?.comments.map((comment) => (
          <article key={comment.id}>
            <header><span>{comment.name}</span><time>{new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'short', day: 'numeric' }).format(comment.createdAt)}</time></header>
            <p>{comment.text}</p>
            <footer>
              <button
                type="button"
                onClick={() => void like(comment.id)}
                disabled={busy || comment.liked || comment.isMine}
                aria-pressed={comment.liked}
                aria-label={t.likeComment}
                title={comment.isMine ? t.own : undefined}
              >
                <Heart aria-hidden="true" fill={comment.liked ? 'currentColor' : 'none'} />
              </button>
              <strong>{comment.likes}</strong>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
