import { ui, defaultLang } from './ui';
import type { Lang, UiKey } from './ui';

export { defaultLang };
export type { Lang };

export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  if (first && first in ui) return first as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return ((ui[lang] as Record<string, string>)[key] ??
            (ui[defaultLang] as Record<string, string>)[key] ??
            key);
  };
}

/** Strip locale prefix and re-add for target language */
export function getLocalizedPath(pathname: string, targetLang: Lang): string {
  const parts = pathname.split('/').filter(Boolean);
  const first = parts[0] as Lang;
  const hasPrefix = first && first in ui && first !== defaultLang;
  const clean = hasPrefix ? parts.slice(1) : parts;
  const base = clean.length ? '/' + clean.join('/') : '/';
  if (targetLang === defaultLang) return base;
  return base === '/' ? `/${targetLang}` : `/${targetLang}${base}`;
}

/** Prefix a nav href for a non-default locale */
export function localizePath(href: string, lang: Lang): string {
  if (lang === defaultLang) return href;
  return href === '/' ? `/${lang}` : `/${lang}${href}`;
}
