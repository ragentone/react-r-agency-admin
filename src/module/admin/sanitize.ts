import DOMPurify from 'dompurify';

/** Same tags as the backend sanitizer (runtime apps/site-page/utils/html.ts). */
const ALLOWED_TAGS = [
  'p',
  'br',
  'hr',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'mark',
  'code',
  'pre',
  'blockquote',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'h4',
  'a',
];
const ALIGN = /text-align\s*:\s*(left|center|right|justify)/i;

// Own instance – the hook must not affect other DOMPurify users.
const purify = DOMPurify(window);
purify.addHook('uponSanitizeAttribute', (_node, data) => {
  if (data.attrName !== 'style') return;
  const align = ALIGN.exec(data.attrValue);
  if (align) data.attrValue = `text-align: ${align[1].toLowerCase()}`;
  else data.keepAttr = false;
});
purify.addHook('afterSanitizeAttributes', node => {
  if (node.tagName === 'A' && /^https?:\/\//i.test(node.getAttribute('href') ?? '')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer nofollow');
  }
});

/** Page HTML → safe HTML (second line of defense, the backend sanitizes too). */
export const sanitizePageHtml = (html: string | null | undefined): string =>
  html
    ? purify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR: ['href', 'target', 'rel', 'style'],
        ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/(?!\/)|#)/i,
      })
    : '';
