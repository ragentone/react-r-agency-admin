import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@ui/shad-cn/components/carousel';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TextField } from './BlockFields';
import { CropImageField } from './CropImageField';
import { RATIO_CLASS } from './image.utils';
import { AltField } from './MediaBlockEditors';
import {
  emptySlide,
  type ICarouselBlockData,
  type ICarouselItem,
  SITE_PAGE_CAROUSEL_MAX,
} from './types';
import { useCarouselSlides } from './useCarouselSlides';

const ROUND =
  'grid size-8 place-items-center rounded-full hover:bg-foreground/10 disabled:opacity-30';

/** Typing / buttons must not start a swipe (text selection, taps). */
const noSwipeOnFields = (_api: CarouselApi, event: MouseEvent | TouchEvent) =>
  !(event.target as HTMLElement | null)?.closest('input,textarea,button,label,[role=radio]');

interface IProps {
  data: ICarouselBlockData;
  onChange: (data: ICarouselBlockData) => void;
  disabled?: boolean;
}

/**
 * The slides as a carousel of their own: swipe (or use the arrows) from slide to slide,
 * every slide is a card with image (crop), alt text and caption, plus move / delete.
 */
export const CarouselSlidesField: React.FC<IProps> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const [api, setApi] = useState<CarouselApi>();
  const { index } = useCarouselSlides(api);
  const target = useRef<number | null>(null);
  const items = data.items;
  const set = (list: ICarouselItem[], to?: number) => {
    target.current = to ?? null;
    onChange({ ...data, items: list });
  };

  // After add / move / delete: jump to the slide that was meant (once it is rendered).
  useEffect(() => {
    if (target.current === null || !api) return;
    api.reInit();
    api.scrollTo(Math.min(target.current, items.length - 1));
    target.current = null;
  }, [items, api]);

  const move = (from: number, delta: number) => {
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(from + delta, 0, item);
    set(next, from + delta);
  };
  const remove = (at: number) => {
    const next = items.filter((_, i) => i !== at);
    set(next.length ? next : [emptySlide()], Math.max(at - 1, 0));
  };
  const update = (at: number, item: ICarouselItem) =>
    onChange({ ...data, items: items.map((current, i) => (i === at ? item : current)) });

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-caption font-medium text-foreground">
          {t('blocks.carousel.items')}{' '}
          <span className="font-normal text-muted-foreground tabular-nums">
            {index + 1} / {items.length} · max. {SITE_PAGE_CAROUSEL_MAX}
          </span>
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={ROUND}
            onClick={() => api?.scrollPrev()}
            disabled={disabled || index === 0}
            aria-label={t('blocks.carousel.prev')}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className={ROUND}
            onClick={() => api?.scrollNext()}
            disabled={disabled || index >= items.length - 1}
            aria-label={t('blocks.carousel.next')}
          >
            <ChevronRight className="size-4" />
          </button>
          <button
            type="button"
            className={ROUND}
            onClick={() => set([...items, emptySlide()], items.length)}
            disabled={disabled || items.length >= SITE_PAGE_CAROUSEL_MAX}
            aria-label={t('blocks.carousel.add')}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
      <Carousel setApi={setApi} opts={{ align: 'start', watchDrag: noSwipeOnFields }}>
        <CarouselContent className="-ml-3">
          {items.map((item, at) => (
            <CarouselItem key={at} className="basis-[92%] pl-3">
              <div className="h-full rounded-xl border border-border/50 bg-background">
                <div className="flex items-center gap-1 border-b border-border/50 py-1 pr-1 pl-3">
                  <span className="min-w-0 flex-1 truncate text-caption font-semibold text-muted-foreground">
                    {t('blocks.carousel.slide', { current: at + 1, total: items.length })}
                  </span>
                  <button
                    type="button"
                    className={ROUND}
                    onClick={() => move(at, -1)}
                    disabled={disabled || at === 0}
                    aria-label={t('blocks.carousel.moveLeft')}
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    className={ROUND}
                    onClick={() => move(at, 1)}
                    disabled={disabled || at === items.length - 1}
                    aria-label={t('blocks.carousel.moveRight')}
                  >
                    <ArrowRight className="size-4" />
                  </button>
                  <button
                    type="button"
                    className={`${ROUND} text-destructive hover:bg-destructive/10`}
                    onClick={() => remove(at)}
                    disabled={disabled}
                    aria-label={t('blocks.action.removeItem')}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="space-y-4 p-3">
                  <CropImageField
                    label={t('blocks.field.image')}
                    value={item.imageUrl}
                    onChange={imageUrl => update(at, { ...item, imageUrl })}
                    ratio={data.ratio}
                    aspect={RATIO_CLASS[data.ratio]}
                    disabled={disabled}
                  />
                  {item.imageUrl && (
                    <AltField
                      value={item.alt}
                      onChange={alt => update(at, { ...item, alt })}
                      disabled={disabled}
                    />
                  )}
                  <TextField
                    label={t('blocks.field.caption')}
                    value={item.caption}
                    onChange={caption => update(at, { ...item, caption })}
                    max={200}
                    disabled={disabled}
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
