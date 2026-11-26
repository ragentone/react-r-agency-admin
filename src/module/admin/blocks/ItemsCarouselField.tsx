import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@ui/shad-cn/components/carousel';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCarouselSlides } from './useCarouselSlides';

const ROUND =
  'grid size-8 place-items-center rounded-full hover:bg-foreground/10 disabled:opacity-30';

/** Typing / buttons must not start a swipe (text selection, taps). */
const noSwipeOnFields = (_api: CarouselApi, event: MouseEvent | TouchEvent) =>
  !(event.target as HTMLElement | null)?.closest(
    'input,textarea,button,label,[role=radio],[contenteditable=true]'
  );

interface IProps<T> {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  max: number;
  addLabel: string;
  /** Header of a card (the position "2 / 3" is added). */
  title: (item: T, index: number) => string;
  render: (item: T, update: (item: T) => void) => React.ReactNode;
  disabled?: boolean;
}

/**
 * List items as a carousel of their own: swipe (or use the arrows) from card to card, every
 * card holds the item's fields plus move left / right and delete. Replaces the stacked list
 * (`ItemsField`) where the cards are tall (slides, plans).
 */
export const ItemsCarouselField = <T,>({
  label,
  items,
  onChange,
  create,
  max,
  addLabel,
  title,
  render,
  disabled,
}: IProps<T>) => {
  const { t } = useTranslation('admin');
  const [api, setApi] = useState<CarouselApi>();
  const { index } = useCarouselSlides(api);
  const target = useRef<number | null>(null);
  const set = (list: T[], to?: number) => {
    target.current = to ?? null;
    onChange(list);
  };

  // After add / move / delete: jump to the card that was meant (once it is rendered).
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
    set(next.length ? next : [create()], Math.max(at - 1, 0));
  };
  const update = (at: number, item: T) =>
    onChange(items.map((current, i) => (i === at ? item : current)));

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-caption font-medium text-foreground">
          {label}{' '}
          <span className="font-normal text-muted-foreground tabular-nums">
            {index + 1} / {items.length} · max. {max}
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
            onClick={() => set([...items, create()], items.length)}
            disabled={disabled || items.length >= max}
            aria-label={addLabel}
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
                    {at + 1} / {items.length}
                    {title(item, at) ? ` · ${title(item, at)}` : ''}
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
                <div className="space-y-4 p-3">{render(item, next => update(at, next))}</div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
