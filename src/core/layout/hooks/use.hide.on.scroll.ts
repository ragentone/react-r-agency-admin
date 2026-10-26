import { useRouterState } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

const DELTA = 6;
const MIN_OFFSET = 56;

/**
 * `true` while the user scrolls down (used by floating UI like the menu button) (any scroll container of the page), `false` when scrolling up,
 * near the top or after a route change. Scrolling inside dialogs is ignored.
 */
const useHideOnScroll = (enabled = true) => {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const [hidden, setHidden] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // New page → show the bar again (state adjustment during render, no effect needed).
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setHidden(false);
  }

  useEffect(() => {
    if (!enabled) return;
    const last = new WeakMap<EventTarget, number>();

    const onScroll = (event: Event) => {
      const target = event.target;
      const el =
        target === document || target === window
          ? document.scrollingElement
          : target instanceof Element
            ? target
            : null;
      if (!el || el.closest('[role="dialog"], [role="alertdialog"]')) return;

      const top = el.scrollTop;
      const prev = last.get(el) ?? top;
      last.set(el, top);

      if (top < MIN_OFFSET) setHidden(false);
      else if (top - prev > DELTA) setHidden(true);
      else if (prev - top > DELTA) setHidden(false);
    };

    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => document.removeEventListener('scroll', onScroll, { capture: true });
  }, [enabled]);

  return enabled && hidden;
};
export default useHideOnScroll
