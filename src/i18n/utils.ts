import { ui, defaultLang } from './ui';
import type { Lang, UiKey } from './ui';

export { defaultLang };
export type { Lang };

const rawBaseUrl = import.meta.env.BASE_URL || '/';

export const basePath = rawBaseUrl === '/' ? '' : rawBaseUrl.replace(/\/$/, '');

function isExternalHref(href: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href);
}

function splitPathSuffix(href: string): [string, string] {
  const match = href.match(/^([^?#]*)(.*)$/);
  return [match?.[1] || '/', match?.[2] || ''];
}

export function stripBase(pathname: string): string {
  if (!basePath) return pathname || '/';
  if (pathname === basePath) return '/';
  if (pathname.startsWith(`${basePath}/`)) return pathname.slice(basePath.length) || '/';
  return pathname || '/';
}

export function withBase(href: string): string {
  if (!href || isExternalHref(href) || !href.startsWith('/')) return href;
  if (!basePath || href === basePath || href.startsWith(`${basePath}/`)) return href;
  return href === '/' ? `${basePath}/` : `${basePath}${href}`;
}

export function getLangFromUrl(url: URL): Lang {
  const [, first] = stripBase(url.pathname).split('/');
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
  const [pathOnly, suffix] = splitPathSuffix(pathname);
  const parts = stripBase(pathOnly).split('/').filter(Boolean);
  const first = parts[0] as Lang;
  const hasPrefix = first && first in ui && first !== defaultLang;
  const clean = hasPrefix ? parts.slice(1) : parts;
  const base = clean.length ? '/' + clean.join('/') : '/';
  const localized = targetLang === defaultLang ? base : base === '/' ? `/${targetLang}` : `/${targetLang}${base}`;
  return withBase(`${localized}${suffix}`);
}

/** Prefix a nav href for a non-default locale */
export function localizePath(href: string, lang: Lang): string {
  if (!href || isExternalHref(href) || !href.startsWith('/')) return href;
  const [pathOnly, suffix] = splitPathSuffix(href);
  const normalized = stripBase(pathOnly);
  const localized = lang === defaultLang ? normalized : normalized === '/' ? `/${lang}` : `/${lang}${normalized}`;
  return withBase(`${localized}${suffix}`);
}
