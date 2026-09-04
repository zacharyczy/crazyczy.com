'use client';

import { useState } from 'react';
import type { Language, Post } from '@/lib/content';

type HomePost = Pick<Post, 'slug' | 'title' | 'description' | 'publishDate' | 'tags'>;

const TEXT = {
  en: {
    title: 'Latest writing',
    hint: 'Technical notes, personal essays, and poems.',
    tabs: ['Articles', 'Essays', 'Poems'],
    empty: ['No articles yet.', 'Personal essays are gathering here.', 'The poems are still drying by the window.'],
    read: 'Read',
  },
  zh: {
    title: '最近在写',
    hint: '技术文章、个人随笔与诗歌。',
    tabs: ['文章', '随笔', '诗歌'],
    empty: ['还没有文章。', '新的随笔正在路上。', '诗还在窗边晾干。'],
    read: '阅读',
  },
};

function category(post: HomePost) {
  const tags = post.tags.map((tag) => tag.toLowerCase());
  if (tags.some((tag) => tag === 'poem' || tag === 'poetry' || tag === '诗歌')) return 2;
  if (tags.some((tag) => tag === 'essay' || tag === 'notes' || tag === '随笔')) return 1;
  return 0;
}

export function WritingIndex({ lang, posts, archive = false }: { lang: Language; posts: HomePost[]; archive?: boolean }) {
  const [active, setActive] = useState(0);
  const t = TEXT[lang];
  const visible = posts.filter((post) => category(post) === active);

  return (
    <section className={archive ? 'writing-showcase archive' : 'writing-showcase'} id="writing">
      <div className="writing-heading">
        <div><p className="eyebrow">Writing / 0{active + 1}</p><h1>{t.title}</h1></div>
        <p>{t.hint}</p>
      </div>
      <div className="writing-tabs" role="tablist" aria-label={t.title}>
        {t.tabs.map((label, index) => (
          <button key={label} type="button" role="tab" aria-selected={active === index} className={active === index ? 'active' : ''} onClick={() => setActive(index)}>
            <small>0{index + 1}</small>{label}
          </button>
        ))}
      </div>
      {visible.length ? (
        <div className="writing-list">
          {visible.map((post, index) => (
            <a href={`/${lang}/blog/${post.slug}/`} className="writing-row" key={post.slug}>
              <span className="writing-number">{String(index + 1).padStart(2, '0')}</span>
              <div><time>{post.publishDate.replaceAll('-', '.')}</time><h2>{post.title}</h2><p>{post.description}</p></div>
              <footer><span>{post.tags.join(' · ')}</span><b>{t.read} ↗</b></footer>
            </a>
          ))}
        </div>
      ) : (
        <div className="empty-writing"><span>0{active + 1}</span><p>{t.empty[active]}</p></div>
      )}
    </section>
  );
}
