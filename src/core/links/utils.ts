import DOMPurify from 'dompurify';
import { FileText, Info, Link2, type LucideIcon, ShieldCheck } from 'lucide-react';

import type { LinkKind } from './types.ts';

export const LINK_KIND_ICONS: Record<LinkKind, LucideIcon> = {
  imprint: Info,
  terms: FileText,
  privacy: ShieldCheck,
  custom: Link2,
};

/**
 * HTML loader for static files, e.g. `htmlFromUrl('/legal/imprint.{lang}.html')`.
 * Tries the UI language (`de-DE` → `de-DE`, `de`), then `fallbackLang`.
 * Files live in `public/` → editable without a new build.
 */
export const htmlFromUrl =
  (template: string, fallbackLang = 'de') =>
  async (lang: string): Promise<string> => {
    const base = lang.split('-')[0];
    const langs = [...new Set([lang, base, fallbackLang].filter(Boolean))];
    for (const candidate of langs) {
      const response = await fetch(template.replace('{lang}', candidate), { cache: 'no-cache' });
      if (!response.ok) continue;
      const text = await response.text();
      // SPA fallback: an unknown path answers with the app's index.html.
      if (/^\s*<!doctype html/i.test(text) || text.includes('id="root"')) continue;
      return text;
    }
    throw new Error(`No content for ${template}`);
  };

/** Result of `import.meta.glob('./legal/*.html', { query: '?raw', import: 'default' })`. */
export type HtmlModules = Record<string, () => Promise<unknown>>;

/**
 * HTML loader for files that live *inside an app* (bundled with the app's chunk):
 *
 * ```ts
 * // apps/timeline/app.tsx – files: apps/timeline/legal/guidelines.de.html, .en.html, .ru.html
 * const legal = import.meta.glob('./legal/*.html', { query: '?raw', import: 'default' });
 * Core.links.register({
 *   id: 'timeline:guidelines',
 *   label: 'timeline:links.guidelines',
 *   content: { type: 'html', html: htmlFromModules(legal, 'guidelines') },
 * });
 * ```
 *
 * Picks `<name>.<lang>.html` (UI language, then its base, then `fallbackLang`).
 * Each file is its own small chunk – loaded only when the link is opened.
 */
export const htmlFromModules =
  (modules: HtmlModules, name: string, fallbackLang = 'de') =>
  async (lang: string): Promise<string> => {
    const base = lang.split('-')[0];
    const langs = [...new Set([lang, base, fallbackLang].filter(Boolean))];
    for (const candidate of langs) {
      const suffix = `/${name}.${candidate}.html`;
      const key = Object.keys(modules).find(path => path.endsWith(suffix));
      if (key) return String(await modules[key]());
    }
    throw new Error(`No HTML file "${name}.<lang>.html" for ${langs.join(', ')}`);
  };

const ALLOWED_TAGS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'br',
  'hr',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'small',
  'sup',
  'sub',
  'ul',
  'ol',
  'li',
  'a',
  'blockquote',
  'address',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'section',
  'div',
  'span',
  'code',
  'pre',
  'dl',
  'dt',
  'dd',
];

/** Sanitized HTML; external links open in a new tab. */
export const sanitizeLinkHtml = (html: string): string => {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['href', 'title', 'id', 'colspan', 'rowspan'],
  });
  const doc = new DOMParser().parseFromString(clean, 'text/html');
  doc.querySelectorAll('a[href]').forEach(anchor => {
    const href = anchor.getAttribute('href') ?? '';
    if (/^(https?:)?\/\//i.test(href)) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    }
  });
  return doc.body.innerHTML;
};

/** "2026-10-01" → "01.10.2026" (UI language); other text stays as it is. */
export const formatLinkDate = (value: string, lang?: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
        date
      );
};
