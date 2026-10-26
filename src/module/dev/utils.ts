import DOMPurify from 'dompurify';

/** Visible text of an HTML description (tags removed, block elements → line breaks). */
export const htmlToText = (html: string | null | undefined): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(
    html.replace(/<\/(p|div|li|h[1-6])>|<br\s*\/?>/gi, '$&\n'),
    'text/html'
  );
  return (doc.body.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim();
};

/** Characters the editor counts (tags don't count). */
export const htmlTextLength = (html: string | null | undefined): number =>
  htmlToText(html).replace(/\n/g, '').length;

/** Empty editor (`<p></p>`) → ''. */
export const normalizeHtml = (html: string): string => (htmlToText(html) ? html : '');

/** Short date in the UI language ("12. Okt."). */
export const formatShortDate = (value: string | null | undefined, lang?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(lang, { day: '2-digit', month: 'short' }).format(date);
};

/** Formatting the editors produce – everything else (links, images, styles …) is dropped. */
const ALLOWED_TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li'];

/** User HTML (tickets) → safe HTML for rendering. Plain text of older tickets stays text. */
export const sanitizeTicketHtml = (html: string | null | undefined): string =>
  html ? DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: [] }) : '';
