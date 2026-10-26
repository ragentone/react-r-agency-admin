import { useEffect, useRef } from 'react';

/** Infinite scroll: calls `loadMore` when the sentinel comes close to the viewport. */
export const useLoadMoreSentinel = (
  enabled: boolean,
  loadMore: () => void | Promise<void>,
  rootMargin = '240px'
) => {
  const sentinel = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !enabled) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry?.isIntersecting && void loadMore(),
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, loadMore, rootMargin]);
  return sentinel;
};
