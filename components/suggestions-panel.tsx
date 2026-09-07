'use client';

import { Send, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Language } from '@/lib/content';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type Note = {
  id: string;
  name: string;
  text: string;
  score: number;
  createdAt: number;
};

const TEXT = {
  en: {
    trigger: 'Suggestions',
    kicker: 'VISITOR BOOK · 访客簿',
    title: 'Kind words & honest notes',
    description:
      'The newest three notes appear first. The rest are ranked by score.',
    placeholder: 'Write a suggestion…',
    send: 'Leave note',
    limit: 'Up to two notes per day.',
    duplicate: 'You already voted on this note.',
    daily: 'Two notes today — come back tomorrow.',
    unavailable: 'Suggestions are temporarily unavailable.',
    empty: 'No notes yet. You can leave the first one.',
  },
  zh: {
    trigger: '建议',
    kicker: 'VISITOR BOOK · 访客簿',
    title: '善意与真话',
    description: '最新三条留言优先展示，其余按分数排序。',
    placeholder: '写下一条建议…',
    send: '留下',
    limit: '每天最多两条。',
    duplicate: '你已经评价过这条留言。',
    daily: '今天已经留下两条，明天再来吧。',
    unavailable: '建议暂时无法加载。',
    empty: '还没有留言，你可以写下第一条。',
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

export function SuggestionsPanel({
  lang,
  mobile = false,
  embedded = false,
}: {
  lang: Language;
  mobile?: boolean;
  embedded?: boolean;
}) {
  const t = TEXT[lang];
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [status, setStatus] = useState('');

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setStatus('');
    fetch('/api/suggestions', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('request failed');
        return response.json() as Promise<Note[]>;
      })
      .then(setNotes)
      .catch(() => setStatus(t.unavailable))
      .finally(() => setLoading(false));
  }, [t.unavailable]);

  useEffect(() => {
    if (!embedded) return;
    const frame = requestAnimationFrame(() => void loadNotes());
    return () => cancelAnimationFrame(frame);
  }, [embedded, loadNotes]);

  function changeOpen(next: boolean) {
    setOpen(next);
    if (next) void loadNotes();
  }

  async function vote(id: string, value: 1 | -1) {
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-czy-visitor': visitorId(),
        },
        body: JSON.stringify({ kind: 'vote', id, value }),
      });
      if (!response.ok) {
        setStatus(t.duplicate);
        return;
      }
      setNotes((items) =>
        items.map((note) =>
          note.id === id ? { ...note, score: note.score + value } : note,
        ),
      );
      setStatus('');
    } catch {
      setStatus(t.unavailable);
    }
  }

  async function submit() {
    try {
      const text = draft.trim();
      if (!text) return;
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-czy-visitor': visitorId(),
        },
        body: JSON.stringify({ kind: 'comment', text }),
      });
      const data = (await response.json().catch(() => ({}))) as Note & {
        error?: string;
      };
      if (!response.ok) {
        setStatus(
          response.status === 429 ? t.daily : (data.error ?? t.unavailable),
        );
        return;
      }
      setNotes((items) => [data, ...items]);
      setDraft('');
      setFocused(false);
      setStatus('');
    } catch {
      setStatus(t.unavailable);
    }
  }

  const content = (
    <>
      {' '}
      <div className={`note-composer ${focused ? 'focused' : ''}`}>
        <textarea
          maxLength={280}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={t.placeholder}
          aria-label={t.placeholder}
        />
        <div>
          <small>{status || t.limit}</small>
          <button type="button" onClick={submit} disabled={!draft.trim()}>
            <Send />
            {t.send}
          </button>
        </div>
      </div>
      <div className="visitor-notes" aria-live="polite">
        {loading && <p className="notes-state">···</p>}
        {!loading && !notes.length && !status && (
          <p className="notes-state">{t.empty}</p>
        )}
        {notes.map((note, index) => (
          <article key={note.id}>
            <header>
              <span>{note.name}</span>
              {index < 3 && <b>NEW</b>}
            </header>
            <p>{note.text}</p>
            <footer>
              <button
                type="button"
                onClick={() => vote(note.id, 1)}
                aria-label="Like"
              >
                <ThumbsUp />
              </button>
              <strong>{note.score}</strong>
              <button
                type="button"
                onClick={() => vote(note.id, -1)}
                aria-label="Dislike"
              >
                <ThumbsDown />
              </button>
              <time>
                {new Intl.DateTimeFormat(lang, {
                  month: 'short',
                  day: 'numeric',
                }).format(note.createdAt)}
              </time>
            </footer>
          </article>
        ))}
      </div>
    </>
  );
  if (embedded)
    return (
      <section className="room-guestbook">
        <p>{t.kicker}</p>
        <h2>{t.title}</h2>
        <p>{t.description}</p>
        {content}
      </section>
    );

  return (
    <Sheet open={open} onOpenChange={changeOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label={t.trigger}
            className={
              mobile
                ? 'suggestions-trigger mobile'
                : 'nav-link suggestions-trigger'
            }
          />
        }
      >
        {t.trigger}
        <sup>{notes.length ? String(notes.length).padStart(2, '0') : ''}</sup>
      </SheetTrigger>
      <SheetContent className="suggestions-drawer sm:max-w-[36rem]">
        <p className="drawer-kicker">{t.kicker}</p>
        <SheetTitle className="drawer-title">{t.title}</SheetTitle>
        <SheetDescription className="drawer-description">
          {t.description}
        </SheetDescription>
        {content}
      </SheetContent>
    </Sheet>
  );
}
