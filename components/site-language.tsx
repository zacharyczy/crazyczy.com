'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useSyncExternalStore,
} from 'react';
import type { ReactNode, MouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import type { Language } from '@/lib/content';
import { languagePage } from '@/lib/language-page';
import { parseSitePath, pageHref } from '@/lib/routes';
const eventName = 'crazyczy-language';
const notify = () => window.dispatchEvent(new Event(eventName));
const subscribe = (listener: () => void) => {
  window.addEventListener(eventName, listener);
  window.addEventListener('popstate', listener);
  return () => {
    window.removeEventListener(eventName, listener);
    window.removeEventListener('popstate', listener);
  };
};
const snapshot = () => parseSitePath(window.location.pathname).lang;
type LanguageState = { lang: Language; setLanguage: (lang: Language) => void };
const Context = createContext<LanguageState | null>(null);
function captureScroll() {
  const root = document.scrollingElement;
  const nodes = new Set<Element>(
    document.querySelectorAll(
      'main, main *, dialog, dialog *, [role="dialog"], [role="dialog"] *, .study-scroll',
    ),
  );
  if (root) nodes.add(root);
  const positions = [...nodes]
    .filter((e) => e.clientHeight > 0 && e.scrollHeight > e.clientHeight + 1)
    .map((e) => ({
      e,
      ratio: e.scrollTop / (e.scrollHeight - e.clientHeight),
      left: e.scrollLeft,
    }));
  return () =>
    positions.forEach(({ e, ratio, left }) => {
      if (e.isConnected) {
        e.scrollTop = ratio * Math.max(0, e.scrollHeight - e.clientHeight);
        e.scrollLeft = left;
      }
    });
}
function syncMetadata(lang: Language) {
  const info = languagePage(parseSitePath(location.pathname).path, lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = `${info.title} · crazyczy.com`;
  const meta = (
    attribute: 'name' | 'property',
    key: string,
    content: string,
  ) => {
    let node = document.head.querySelector<HTMLMetaElement>(
      `meta[${attribute}="${key}"]`,
    );
    if (!node) {
      node = document.createElement('meta');
      node.setAttribute(attribute, key);
      document.head.appendChild(node);
    }
    node.content = content;
  };
  meta('name', 'description', info.description);
  for (const prefix of ['og', 'twitter']) {
    meta(prefix === 'og' ? 'property' : 'name', `${prefix}:title`, info.title);
    meta(
      prefix === 'og' ? 'property' : 'name',
      `${prefix}:description`,
      info.description,
    );
  }
  meta('property', 'og:url', `https://crazyczy.com${info.href}`);
  meta('property', 'og:locale', lang === 'zh' ? 'zh_CN' : 'en_US');
  meta('property', 'og:type', info.article ? 'article' : 'website');
  const link = (selector: string, attributes: Record<string, string>) => {
    let node = document.head.querySelector<HTMLLinkElement>(selector);
    if (!node) {
      node = document.createElement('link');
      document.head.appendChild(node);
    }
    Object.entries(attributes).forEach(([key, value]) =>
      node!.setAttribute(key, value),
    );
  };
  link('link[rel="canonical"]', {
    rel: 'canonical',
    href: `https://crazyczy.com${info.href}`,
  });
  for (const [code, language] of [
    ['en', 'en'],
    ['zh-CN', 'zh'],
    ['x-default', 'en'],
  ] as const)
    link(`link[rel="alternate"][hreflang="${code}"]`, {
      rel: 'alternate',
      hreflang: code,
      href: `https://crazyczy.com${languagePage(info.path, language).href}`,
    });
}
export function SiteLanguageProvider({
  initialLanguage,
  children,
}: {
  initialLanguage: Language;
  children: ReactNode;
}) {
  const lang = useSyncExternalStore(subscribe, snapshot, () => initialLanguage);
  const pathname = usePathname();
  useEffect(() => {
    notify();
  }, [pathname]);
  useLayoutEffect(() => {
    syncMetadata(lang);
  }, [lang, pathname]);
  const setLanguage = useCallback((next: Language) => {
    if (snapshot() === next) return;
    const restore = captureScroll();
    const current = new URL(location.href),
      path = parseSitePath(current.pathname).path;
    const target = languagePage(path, next);
    history.replaceState(
      history.state,
      '',
      target.href + current.search + current.hash,
    );
    notify();
    requestAnimationFrame(() => {
      restore();
      requestAnimationFrame(restore);
    });
  }, []);
  return (
    <Context.Provider value={{ lang, setLanguage }}>
      {children}
    </Context.Provider>
  );
}
export function useSiteLanguage(initialLanguage: Language) {
  const context = useContext(Context);
  return (
    context ?? { lang: initialLanguage, setLanguage: (_lang: Language) => {} }
  );
}
export function LanguageLink({
  lang,
  className,
  children,
  href,
}: {
  lang: Language;
  className?: string;
  children: ReactNode;
  href?: string;
}) {
  const { setLanguage } = useSiteLanguage(lang);
  const pathname = usePathname();
  const target = href ?? pageHref(lang, parseSitePath(pathname ?? '/').path);
  const click = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    setLanguage(lang);
  };
  return (
    <a href={target} className={className} onClick={click}>
      {children}
    </a>
  );
}
export function LanguageButtons({
  lang,
  onChange,
}: {
  lang: Language;
  onChange: (lang: Language) => void;
}) {
  return (
    <fieldset
      className="manual-language"
      aria-label={lang === 'zh' ? '手册语言' : 'Manual language'}
    >
      <button
        type="button"
        lang="en"
        aria-pressed={lang === 'en'}
        onClick={() => onChange('en')}
      >
        EN
      </button>
      <button
        type="button"
        lang="zh-CN"
        aria-pressed={lang === 'zh'}
        onClick={() => onChange('zh')}
      >
        中文
      </button>
    </fieldset>
  );
}
