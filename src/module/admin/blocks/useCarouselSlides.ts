import type { CarouselApi } from '@ui/shad-cn/components/carousel';
import { useCallback, useSyncExternalStore } from 'react';

/** Selected slide + slide count of an embla api (re-render only when they change). */
export const useCarouselSlides = (api: CarouselApi | undefined) => {
  const subscribe = useCallback(
    (notify: () => void) => {
      api?.on('select', notify).on('reInit', notify);
      return () => {
        api?.off('select', notify).off('reInit', notify);
      };
    },
    [api]
  );
  const index = useSyncExternalStore(subscribe, () => api?.selectedScrollSnap() ?? 0);
  const count = useSyncExternalStore(subscribe, () => api?.scrollSnapList().length ?? 0);
  return { index, count };
};
