import type { CarouselApi } from '@ui/shad-cn/components/carousel';
import { useEffect } from 'react';

/**
 * Switches slide every `seconds`. Stands still while the visitor touches / hovers / focuses
 * the carousel, while the tab is hidden and with "reduce motion"; the timer restarts after
 * every manual swipe. Nothing runs when `enabled` is off.
 */
export const useCarouselAutoplay = (
  api: CarouselApi | undefined,
  enabled: boolean,
  seconds: number
) => {
  useEffect(() => {
    if (!api || !enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = api.rootNode();
    let hold = false;
    let timer = 0;
    const tick = () => {
      if (hold || document.hidden) return;
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    };
    const restart = () => {
      window.clearInterval(timer);
      timer = window.setInterval(tick, Math.max(2, seconds) * 1000);
    };
    const stop = () => {
      hold = true;
    };
    const go = () => {
      hold = false;
      restart();
    };
    restart();
    api.on('pointerDown', stop).on('settle', go);
    root.addEventListener('pointerenter', stop);
    root.addEventListener('pointerleave', go);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', go);
    return () => {
      window.clearInterval(timer);
      api.off('pointerDown', stop).off('settle', go);
      root.removeEventListener('pointerenter', stop);
      root.removeEventListener('pointerleave', go);
      root.removeEventListener('focusin', stop);
      root.removeEventListener('focusout', go);
    };
  }, [api, enabled, seconds]);
};
