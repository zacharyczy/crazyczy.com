import type { Language } from './content';

/** English is canonical; Chinese translations use a suffix on the same path. */
export function pageHref(lang: Language, path = '') {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return `${clean ? '/' + clean : ''}${lang === 'zh' ? '/zh' : ''}/`;
}
export const homeHref = (lang: Language) => pageHref(lang);
export function languageAlternates(lang: Language, path = '') {
  return {
    canonical: pageHref(lang, path),
    languages: {
      en: pageHref('en', path),
      'zh-CN': pageHref('zh', path),
      'x-default': pageHref('en', path),
    },
  };
}
export function parseSitePath(pathname: string): {
  lang: Language;
  path: string;
} {
  const parts = pathname.split('/').filter(Boolean);
  let lang: Language = 'en';
  if (parts[0] === 'en' || parts[0] === 'zh') lang = parts.shift() as Language;
  if (parts.at(-1) === 'zh') {
    parts.pop();
    lang = 'zh';
  }
  return { lang, path: parts.join('/') };
}
