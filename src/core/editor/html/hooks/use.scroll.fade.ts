import { type RefObject, useEffect, useState } from 'react';

/** Tracks whether a horizontal scroll container can scroll further left/right. */
export function useScrollFade(ref: RefObject<HTMLElement | null>) {
  const [fade, setFade] = useState({ start: false, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const start = el.scrollLeft > 1;
      const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
      setFade(prev => (prev.start === start && prev.end === end ? prev : { start, end }));
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    Array.from(el.children).forEach(child => observer.observe(child));

    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [ref]);

  return fade;
}

/** CSS mask that fades out the clipped edges. */
export function scrollFadeMask({ start, end }: { start: boolean; end: boolean }) {
  if (!start && !end) return undefined;
  const from = start ? 'transparent, black 1.5rem' : 'black';
  const to = end ? 'black calc(100% - 1.5rem), transparent' : 'black';
  return `linear-gradient(to right, ${from}, ${to})`;
}
