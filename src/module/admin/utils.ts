import { USER_ROLE_PATTERN } from '@core/auth/roles/role.manager.ts';

/** Trimmed + lower case (the backend does the same). */
export const normalizeRole = (role: string) => role.trim().toLowerCase();

/** `scope:…:name` – same rule as the backend (`ADMIN_ROLE_PATTERN`). */
export const isValidRole = (role: string) => USER_ROLE_PATTERN.test(normalizeRole(role));

/** `timeline:moderator:user` → `['timeline', 'moderator:user']` (for the two-tone chip). */
export const splitRole = (role: string): [scope: string, name: string] => {
  const index = role.indexOf(':');
  return index < 0 ? [role, ''] : [role.slice(0, index), role.slice(index + 1)];
};

export const initials = (alias: string) =>
  alias
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

const UMLAUTS: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' };

/** "Über uns & Team!" → `ueber-uns-team` (same rule the backend validates). */
export const slugify = (value: string, max = 80) =>
  value
    .toLowerCase()
    .replace(/[äöüß]/g, char => UMLAUTS[char] ?? char)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/g, '');

/** While typing a slug: lower case, invalid characters → dash, no double dashes. */
export const cleanSlugInput = (value: string, max = 80) =>
  value
    .toLowerCase()
    .replace(/[äöüß]/g, char => UMLAUTS[char] ?? char)
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/g, '')
    .slice(0, max);

/** Visible text of editor HTML. */
export const htmlToText = (html: string | null | undefined): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent ?? '').trim();
};

/** "11. Okt. 2026" in the UI language. */
export const formatDate = (value: string | null | undefined, lang?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', year: 'numeric' }).format(
        date
      );
};
