import { cn } from '@ui/lib/utils';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@ui/shad-cn/components/carousel';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { pageImageSrcSet, RATIO_CLASS } from './image.utils';
import type { CarouselPerView, ICarouselBlockData } from './types';
import { useCarouselAutoplay } from './useCarouselAutoplay';
import { useCarouselSlides } from './useCarouselSlides';

/** Phones: one slide with a peek of the next; from tablet width `perView` side by side. */
const BASIS: Record<CarouselPerView, string> = {
  '1': 'basis-[92%] sm:basis-full',
  '2': 'basis-[85%] sm:basis-1/2',
  '3': 'basis-[85%] sm:basis-1/2 md:basis-1/3',
};
const SIZES: Record<CarouselPerView, string> = {
  '1': '(min-width: 768px) 720px, 100vw',
  '2': '(min-width: 768px) 360px, 90vw',
  '3': '(min-width: 768px) 240px, 90vw',
};
const ARROW =
  'top-[calc(50%-1.25rem)] hidden size-10 border-border/50 bg-background/90 shadow-sm backdrop-blur sm:inline-flex';

/** Swipeable images: touch drag on phones, arrows + dots from tablet width (switchable). */
export const CarouselBlock: React.FC<{ data: ICarouselBlockData; first?: boolean }> = ({
  data,
  first = false,
}) => {
  const { t } = useTranslation('admin');
  const [api, setApi] = useState<CarouselApi>();
  const { index, count } = useCarouselSlides(api);
  useCarouselAutoplay(api, data.autoplay, data.interval);
  const items = data.items.filter(item => item.imageUrl);
  if (!items.length) return null;
  const moves = count > 1;
  const radius = data.rounded
    ? data.wide
      ? 'rounded-none sm:rounded-2xl'
      : 'rounded-2xl'
    : 'rounded-none';
  return (
    <section
      aria-roledescription="carousel"
      aria-label={data.title || undefined}
      className={cn(data.wide && '-mx-4 sm:mx-0')}
    >
      {data.title && (
        <h2 className={cn('mb-4 text-xl font-bold tracking-tight', data.wide && 'px-4 sm:px-0')}>
          {data.title}
        </h2>
      )}
      <Carousel
        setApi={setApi}
        opts={{ loop: data.loop, align: 'start', containScroll: 'trimSnaps' }}
      >
        <CarouselContent className="-ml-3">
          {items.map((item, position) => {
            const srcSet = pageImageSrcSet(item.imageUrl);
            const overlay = data.caption === 'overlay' && item.caption;
            return (
              <CarouselItem
                key={`${item.imageUrl}-${position}`}
                className={cn('pl-3', items.length > 1 && BASIS[data.perView])}
                aria-label={t('blocks.carousel.slide', {
                  current: position + 1,
                  total: items.length,
                })}
              >
                <figure className="m-0">
                  <div
                    className={cn(
                      'relative overflow-hidden bg-muted',
                      radius,
                      RATIO_CLASS[data.ratio]
                    )}
                  >
                    <img
                      src={item.imageUrl}
                      srcSet={srcSet}
                      sizes={srcSet ? SIZES[data.perView] : undefined}
                      alt={item.alt}
                      loading={first && position === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      draggable={false}
                      className={cn(
                        'size-full',
                        data.fit === 'contain' ? 'object-contain' : 'object-cover'
                      )}
                    />
                    {overlay && (
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10 text-caption text-white">
                        {item.caption}
                      </figcaption>
                    )}
                  </div>
                  {item.caption && !overlay && (
                    <figcaption
                      className={cn(
                        'mt-2 text-caption text-muted-foreground',
                        data.wide && 'px-4 sm:px-0'
                      )}
                    >
                      {item.caption}
                    </figcaption>
                  )}
                </figure>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {data.arrows && moves && (
          <>
            <CarouselPrevious className={cn(ARROW, 'left-3')} />
            <CarouselNext className={cn(ARROW, 'right-3')} />
          </>
        )}
      </Carousel>
      {data.dots && moves && (
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
