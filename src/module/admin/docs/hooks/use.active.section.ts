import { type RefObject, useEffect, useState } from 'react';

/**
 * The section the reader is on: the first heading (document order) inside the top quarter of
 * the viewport. Re-observes when `key` changes (new HTML after a search step or a new doc).
 */
export const useActiveSection = (root: RefObject<HTMLElement | null>, key: unknown, enabled: boolean) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const element = root.current;
    if (!element || !enabled) return;
    const headings = Array.from(element.querySelectorAll<HTMLElement>('[id^="doc-section-"]'));
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        const first = headings.find(heading => visible.has(heading.id));
        if (first) setActiveId(first.id);
      },
      { rootMargin: '0px 0px -75% 0px' }
    );
    headings.forEach(heading => observer.observe(heading));
    return () => observer.disconnect();
  }, [root, key, enabled]);

  return activeId;
};
