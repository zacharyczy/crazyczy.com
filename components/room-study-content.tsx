'use client';
import { RoomGuideContent } from './room-guide-content';
import { useEffect, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import type { Language } from '@/lib/content';
import { getPost, getPosts, getTranslation } from '@/lib/content';
import { projects } from '@/lib/projects';
import { WritingIndex } from './writing-index';
import { Markdown } from './markdown';
import { TerminalView } from './terminal-view';
import { AboutContent } from './about-view';
import { SuggestionsPanel } from './suggestions-panel';
import { studyLabel } from '@/lib/room-guide';
import type { StudyPanel } from '@/lib/room-guide';
import { STUDY_VIEWS, LAPTOP } from './room-study-models';

type Props = {
  panel: StudyPanel | null;
  ready: boolean;
  lang: Language;
  onClose: () => void;
  onTV: () => void;
  onOpen: (panel: StudyPanel) => void;
};
function Reader({
  lang,
  onLanguage,
  slug,
  setSlug,
}: {
  lang: Language;
  onLanguage: (lang: Language) => void;
  slug: string | null;
  setSlug: (slug: string | null) => void;
}) {
  const post = slug ? getPost(lang, slug) : undefined;
  const [tag, setTag] = useState<string | null>(null);
  const posts = getPosts(lang).filter((p) => !tag || p.tags.includes(tag));
  return (
    <div
      className="room-reader"
      onClickCapture={(e) => {
        const a = (e.target as HTMLElement).closest('a');
        if (!a) return;
        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin) return;
        e.preventDefault();
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts[0] === 'en' || parts[0] === 'zh') onLanguage(parts[0]);
        if (parts[1] === 'blog' && parts[2]) setSlug(parts[2]);
        else setSlug(null);
      }}
    >
      {post ? (
        <article>
          <button onClick={() => setSlug(null)}>
            ← {lang === 'zh' ? '返回目录' : 'Index'}
          </button>
          <p className="reader-date">{post.publishDate}</p>
          <h1>{post.title}</h1>
          <p>{post.description}</p>
          <div className="reader-tags">
            {post.tags.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTag(t);
                  setSlug(null);
                }}
              >
                #{t}
              </button>
            ))}
            {getTranslation(post) && (
              <button onClick={() => onLanguage(lang === 'zh' ? 'en' : 'zh')}>
                {lang === 'zh' ? 'Read in English' : '阅读中文版'}
              </button>
            )}
          </div>
          <Markdown source={post.body} />
        </article>
      ) : (
        <>
          {tag && <button onClick={() => setTag(null)}>× {tag}</button>}
          <WritingIndex lang={lang} posts={posts} onRead={setSlug} />
        </>
      )}
    </div>
  );
}
export default function RoomStudyContent({
  panel,
  ready,
  lang,
  onClose,
  onTV,
  onOpen,
}: Props) {
  const [language, setLanguage] = useState(lang),
    [windowName, setWindow] = useState('projects'),
    [terminal, setTerminal] = useState(false),
    [slug, setSlug] = useState<string | null>(null),
    [computerSlug, setComputerSlug] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [visibleHeight, setVisibleHeight] = useState<number | null>(null);
  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () =>
      setVisibleHeight(viewport?.height ?? window.innerHeight);
    const frame = requestAnimationFrame(update);
    viewport?.addEventListener('resize', update);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener('resize', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  const root = useRef<HTMLDialogElement>(null),
    scroll = useRef<HTMLDivElement>(null),
    scrollPositions = useRef<Record<string, number>>({});
  const active = panel ?? 'computer';
  useEffect(() => {
    const q = matchMedia('(max-width: 700px), (max-height: 500px)');
    const update = () => setMobile(q.matches);
    update();
    q.addEventListener('change', update);
    return () => q.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setLanguage(lang));
    return () => cancelAnimationFrame(frame);
  }, [lang]);
  useEffect(() => {
    if (!panel || !ready) return;
    const controls = () =>
      Array.from(
        root.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a,input,textarea,[tabindex="0"]',
        ) ?? [],
      ).filter((el) => el.getClientRects().length > 0);
    const frame = requestAnimationFrame(() =>
      controls()[0]?.focus({ preventScroll: true }),
    );
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      const list = controls(),
        i = list.indexOf(document.activeElement as HTMLElement);
      list[(i + (e.shiftKey ? -1 : 1) + list.length) % list.length]?.focus();
    };
    document.addEventListener('keydown', trap, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', trap, true);
    };
  }, [panel, ready, terminal, windowName, mobile]);
  useEffect(() => {
    if (scroll.current)
      scroll.current.scrollTop = scrollPositions.current[windowName] ?? 0;
  }, [windowName]);
  const navigate = (route: string) => {
    if (route === 'games') {
      onTV();
      return;
    }
    setTerminal(false);
    setWindow(
      route === 'blog' ? 'writing' : route === 'home' ? 'desktop' : route,
    );
  };
  const ui = (
    <dialog
      open
      ref={root}
      className={`study-surface ${active === 'computer' ? 'computer-surface' : 'paper-surface'} ${mobile ? 'mobile-study' : ''}`}
      aria-modal="true"
      aria-label={studyLabel(active, language)}
      style={{
        display: panel && ready ? 'flex' : 'none',
        height:
          mobile && visibleHeight
            ? Math.max(180, visibleHeight - 24)
            : undefined,
      }}
      onFocusCapture={(e) => {
        if (
          mobile &&
          e.target instanceof HTMLElement &&
          e.target.matches('input,textarea')
        ) {
          const element = e.target;
          requestAnimationFrame(() =>
            element.scrollIntoView({ block: 'nearest' }),
          );
        }
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <header className="study-titlebar">
        <span>
          {active === 'computer'
            ? 'CRAZY OS / ' + windowName.toUpperCase()
            : studyLabel(active, language)}
        </span>
        <div>
          <button onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}>
            {language === 'zh' ? 'EN' : '中文'}
          </button>
          <button
            aria-label={
              language === 'zh' ? '关闭并返回房间' : 'Close and return'
            }
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </header>
      <div className="computer-body" hidden={active !== 'computer'}>
        <div
          ref={scroll}
          className="study-scroll computer-workspace"
          onScroll={(e) => {
            scrollPositions.current[windowName] = e.currentTarget.scrollTop;
          }}
        >
          <div hidden={terminal}>
            {windowName === 'projects' && (
              <>
                <p className="desktop-kicker">SELECTED WORK / 2026</p>
                <h1>Projects</h1>
                <div className="room-projects">
                  {projects[language].map((p) => (
                    <article key={p.title}>
                      <small>
                        {p.year} · {p.status}
                      </small>
                      <h2>{p.title}</h2>
                      <p>{p.description}</p>
                      <p>{p.stack.join(' / ')}</p>
                      <button
                        onClick={() => {
                          setComputerSlug(p.articleSlug);
                          setWindow('writing');
                        }}
                      >
                        {language === 'zh'
                          ? '阅读项目文章'
                          : 'Read project note'}{' '}
                        →
                      </button>
                      <a href={p.repository} target="_blank" rel="noreferrer">
                        GitHub ↗
                      </a>
                    </article>
                  ))}
                </div>
              </>
            )}
            {windowName === 'writing' && (
              <Reader
                lang={language}
                onLanguage={setLanguage}
                slug={computerSlug}
                setSlug={setComputerSlug}
              />
            )}
            {windowName === 'about' && <AboutContent lang={language} />}
            {windowName === 'desktop' && (
              <div className="computer-desktop">
                <p>CRAZY OS</p>
                <h1>
                  {language === 'zh' ? '想做点什么？' : 'What shall we do?'}
                </h1>
                {['projects', 'writing', 'about'].map((name) => (
                  <button key={name} onClick={() => setWindow(name)}>
                    {name.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div hidden={!terminal} className="room-terminal-holder">
            <button
              className="terminal-minimize"
              onClick={() => setTerminal(false)}
            >
              {language === 'zh' ? '— 最小化' : '— Minimize'}
            </button>
            <TerminalView
              lang={language}
              onNavigate={navigate}
              onLanguage={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            />
          </div>
        </div>
        <footer className="computer-taskbar">
          <button
            onClick={() => {
              setTerminal(false);
              setWindow('desktop');
            }}
          >
            ▦
          </button>
          <button
            aria-pressed={!terminal && windowName === 'projects'}
            onClick={() => {
              setTerminal(false);
              setWindow('projects');
            }}
          >
            Projects
          </button>
          <button
            aria-pressed={terminal}
            onClick={() => setTerminal((v) => !v)}
          >
            ▸ Terminal {terminal ? '' : '—'}
          </button>
          <span>CRAZY / LOCAL</span>
        </footer>
      </div>
      <div className="study-scroll" hidden={active === 'computer'}>
        {active === 'writing' && (
          <Reader
            lang={language}
            onLanguage={setLanguage}
            slug={slug}
            setSlug={setSlug}
          />
        )}
        {active === 'guide' && (
          <>
            <RoomGuideContent lang={language} />
            <button onClick={() => onOpen('suggestions')}>
              {language === 'zh' ? '打开建议访客簿' : 'Open visitor book'} →
            </button>
          </>
        )}
        {active === 'suggestions' && (
          <SuggestionsPanel lang={language} embedded />
        )}
      </div>
      <div className="study-footnote">
        {language === 'zh'
          ? 'Esc 返回 · 你仍然在房间里'
          : 'Esc to return · Still in the room'}
      </div>
    </dialog>
  );
  if (mobile)
    return (
      <Html
        key="mobile-reader"
        // This is a viewport reader: the world origin can be behind the camera.
        onOcclude={() => undefined}
        fullscreen
        calculatePosition={(_object, _camera, size) => [
          size.width / 2,
          size.height / 2,
        ]}
        zIndexRange={[30, 25]}
        style={{ pointerEvents: panel && ready ? 'auto' : 'none' }}
      >
        <div
          className="mobile-study-backdrop"
          style={{
            position: 'absolute',
            display: panel && ready ? 'grid' : 'none',
          }}
        >
          {ui}
        </div>
      </Html>
    );
  const position =
    active === 'computer'
      ? LAPTOP.screen.position
      : active === 'writing'
        ? [-2.35, 1.47, 0.8]
        : STUDY_VIEWS.guide.position;
  const rotation =
    active === 'writing'
      ? [-1.116, 0, 0]
      : active === 'computer'
        ? [LAPTOP.tilt, 0, 0]
        : [0, 0, 0];
  return (
    <Html
      key="world-reader"
      transform
      position={position as [number, number, number]}
      rotation={rotation as [number, number, number]}
      distanceFactor={
        active === 'computer' ? (LAPTOP.screen.width / 720) * 400 : 1.2
      }
      zIndexRange={[12, 10]}
      style={{ pointerEvents: panel && ready ? 'auto' : 'none' }}
    >
      {ui}
    </Html>
  );
}
