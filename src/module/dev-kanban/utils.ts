/**
 * Plain text of a stored description. Descriptions are HTML from the editor; the board
 * shows only text, so tags are dropped via DOMParser (no HTML is ever rendered on the board).
 */
export const htmlToPlainText = (html: string): string => {
  if (!html) return '';
  if (typeof DOMParser === 'undefined')
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
};
