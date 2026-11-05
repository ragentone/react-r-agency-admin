import { useEffect, useMemo, useRef, useState } from 'react';

import { highlightHtml, scrollToMatch } from '../highlight';

/**
 * Search inside one rendered doc. The marks are part of the HTML React renders, so every
 * next / previous step is a normal render. After the render the active hit is scrolled to.
 */
export const useDocSearch = (html: string, query: string) => {
  const [index, setIndex] = useState(0);
  const articleRef = useRef<HTMLElement | null>(null);
  const result = useMemo(() => highlightHtml(html, query, index), [html, query, index]);

  // A new doc or a new query starts again at the first hit.
  useEffect(() => {
    setIndex(0);
  }, [html, query]);

  // After the commit: the marked HTML is in the DOM, scroll the active hit into view.
  useEffect(() => {
    const mark = articleRef.current?.querySelector<HTMLElement>(`mark[data-hit="${index}"]`);
    if (!mark) return;
    const frame = requestAnimationFrame(() => scrollToMatch(mark));
    return () => cancelAnimationFrame(frame);
  }, [result.html, index]);

  const step = (delta: number) =>
    setIndex(value => (result.count ? (value + delta + result.count) % result.count : 0));

  return {
    html: result.html,
    count: result.count,
    index,
    next: () => step(1),
    prev: () => step(-1),
    articleRef,
  };
};
