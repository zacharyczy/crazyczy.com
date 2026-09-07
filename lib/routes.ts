import type { Language } from './content';

export const homeHref = (lang: Language) => (lang === 'en' ? '/' : '/zh/');
