import { useCallback, useEffect, useRef } from 'react';

/** Nearest scrollable ancestor (drawer nav / sidebar list). */
const scrollParentOf = (el: HTMLElement): HTMLElement | null => {
  let node = el.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
};

/**
 * Scrolls a just expanded group into view: the whole group if it fits, otherwise the parent
 * row to the top (the children follow below). Does nothing when it is already fully visible.
 */
const revealGroup = (el: HTMLElement, smooth: boolean) => {
  const container = scrollParentOf(el);
  if (!container) return;
  const margin = 8;
  const box = container.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto';
  if (rect.height + margin * 2 > box.height || rect.top < box.top + margin) {
    container.scrollBy({ top: rect.top - box.top - margin, behavior });
  } else if (rect.bottom > box.bottom - margin) {
    container.scrollBy({ top: rect.bottom - box.bottom + margin, behavior });
  }
};

/**
 * Reveals a menu group after the user expanded it. `request(true)` when the user opens the
 * group, `reveal` once the children are visible (end of the expand animation).
 */
export const useMenuGroupReveal = (open: boolean, reduceMotion: boolean) => {
  const groupRef = useRef<HTMLDivElement>(null);
  const pending = useRef(false);

  const request = useCallback((next: boolean) => {
    pending.current = next;
  }, []);

  const reveal = useCallback(() => {
    if (!pending.current || !groupRef.current) return;
    pending.current = false;
    revealGroup(groupRef.current, !reduceMotion);
  }, [reduceMotion]);

  // Reduced motion: no expand animation (no `onAnimationComplete`) → reveal after layout.
  useEffect(() => {
    if (!open || !reduceMotion) return;
    const frame = requestAnimationFrame(reveal);
    return () => cancelAnimationFrame(frame);
  }, [open, reduceMotion, reveal]);

  return { groupRef, request, reveal };
};
