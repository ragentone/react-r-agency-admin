import { cn } from '@ui/lib/utils';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@ui/shad-cn/components/carousel';
import React, { useCallback, useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';

import { pageImageSrcSet, RATIO_CLASS } from './image.utils';
import type { ICarouselBlockData } from './types';

/** Reading column: full phone width, at most 720 px. */
const SIZES = '(min-width: 768px) 720px, 100vw';
const ARROW =
  'top-[calc(50%-1.25rem)] hidden size-10 border-border/50 bg-background/90 shadow-sm backdrop-blur sm:inline-flex';

/** Selected slide + slide count of an embla api (re-render only when they change). */
const useSlides = (api: CarouselApi | undefined) => {
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

/** Swipeable images: touch drag on phones, arrows + dots from tablet width. */
export const CarouselBlock: React.FC<{ data: ICarouselBlockData; first?: boolean }> = ({
  data,
  first = false,
}) => {
  const { t } = useTranslation('admin');
  const [api, setApi] = useState<CarouselApi>();
  const { index, count } = useSlides(api);
  const items = data.items.filter(item => item.imageUrl);
  if (!items.length) return null;
  const single = items.length === 1;
  return (
    <section aria-roledescription="carousel" aria-label={data.title || undefined}>
      {data.title && <h2 className="mb-4 text-xl font-bold tracking-tight">{data.title}</h2>}
      <Carousel setApi={setApi} opts={{ loop: false, align: 'start' }}>
        <CarouselContent className="-ml-3">
          {items.map((item, position) => {
            const srcSet = pageImageSrcSet(item.imageUrl);
            return (
              <CarouselItem
                key={`${item.imageUrl}-${position}`}
                className={cn('pl-3', !single && 'basis-[92%] sm:basis-full')}
                aria-label={t('blocks.carousel.slide', {
                  current: position + 1,
                  total: items.length,
                })}
              >
                <figure className="m-0">
                  <div
                    className={cn('overflow-hidden rounded-2xl bg-muted', RATIO_CLASS[data.ratio])}
                  >
                    <img
                      src={item.imageUrl}
                      srcSet={srcSet}
                      sizes={srcSet ? SIZES : undefined}
                      alt={item.alt}
                      loading={first && position === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      draggable={false}
                      className="size-full object-cover"
                    />
                  </div>
                  {item.caption && (
                    <figcaption className="mt-2 text-caption text-muted-foreground">
                      {item.caption}
                    </figcaption>
                  )}
                </figure>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {!single && (
          <>
            <CarouselPrevious className={cn(ARROW, 'left-3')} />
            <CarouselNext className={cn(ARROW, 'right-3')} />
          </>
        )}
      </Carousel>
      {!single && count > 1 && (
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
          {Array.from({ length: count }, (_, dot) => (
            <span
              key={dot}
              className={cn(
                'h-1.5 rounded-full transition-all',
                dot === index ? 'w-4 bg-foreground' : 'w-1.5 bg-border'
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
};
