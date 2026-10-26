import { cn } from '@ui/lib/utils';
import { ArrowRight } from 'lucide-react';
import React from 'react';

import { BlockLink } from './BlockLink';
import { FocusImage } from './FocusImage';
import { pageImageSrcSet, RATIO_CLASS } from './image.utils';
import {
  type ICardItem,
  type ICardsBlockData,
  type IImageBlockData,
  type ISplitBlockData,
  isSafeUrl,
} from './types';

/** Reading column: full phone width, at most 720 px. */
const COLUMN_SIZES = '(min-width: 768px) 720px, 100vw';
/** Half of the column (split, two cards). */
const HALF_SIZES = '(min-width: 640px) 360px, 100vw';
const THIRD_SIZES = '(min-width: 640px) 240px, 100vw';

const BUTTON =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-body font-bold text-background transition-opacity hover:opacity-85';

/* ---------------------------------------------------------------- image */

export const ImageBlock: React.FC<{ data: IImageBlockData; first?: boolean }> = ({
  data,
  first = false,
}) => {
  if (!data.imageUrl) return null;
  const loading = first ? 'eager' : 'lazy';
  const ratio = data.ratio !== 'auto' ? RATIO_CLASS[data.ratio] : undefined;
  // Wide: edge to edge on phones (the column has 16 px padding there).
  const frame = cn(
    'overflow-hidden bg-muted',
    data.wide ? '-mx-4 rounded-none sm:mx-0 sm:rounded-2xl' : 'rounded-2xl'
  );
  const srcSet = pageImageSrcSet(data.imageUrl);
  return (
    <figure className="m-0">
      {ratio ? (
        <div className={cn(frame, ratio)}>
          <FocusImage
            src={data.imageUrl}
            alt={data.alt}
            focusX={data.focusX}
            focusY={data.focusY}
            loading={loading}
            sizes={COLUMN_SIZES}
            className="size-full"
          />
        </div>
      ) : (
        <div className={frame}>
          <img
            src={data.imageUrl}
            srcSet={srcSet}
            sizes={srcSet ? COLUMN_SIZES : undefined}
            alt={data.alt}
            loading={loading}
            decoding="async"
            fetchPriority={first ? 'high' : undefined}
            className="block h-auto w-full"
          />
        </div>
      )}
      {data.caption && (
        <figcaption className="mt-2 text-caption whitespace-pre-line text-muted-foreground">
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
};

/* ---------------------------------------------------------------- split */

export const SplitBlock: React.FC<{ data: ISplitBlockData; first?: boolean }> = ({
  data,
  first = false,
}) => {
  const hasText = Boolean(data.title || data.text || (data.buttonLabel && data.buttonUrl));
  if (!data.imageUrl && !hasText) return null;
  const image = data.imageUrl ? (
    <div
      className={cn(
        'overflow-hidden rounded-2xl bg-muted',
        RATIO_CLASS[data.ratio] ?? RATIO_CLASS['4/3'],
        // Phones: image always first; from tablet on the chosen side.
        data.imageSide === 'right' && 'sm:order-last'
      )}
    >
      <FocusImage
        src={data.imageUrl}
        alt={data.alt}
        focusX={data.focusX}
        focusY={data.focusY}
        loading={first ? 'eager' : 'lazy'}
        sizes={HALF_SIZES}
        className="size-full"
      />
    </div>
  ) : null;
  return (
    <section
      className={cn('grid gap-5 sm:items-center sm:gap-8', image && hasText && 'sm:grid-cols-2')}
    >
      {image}
      {hasText && (
        <div className="min-w-0">
          {data.title && <h2 className="text-2xl font-bold tracking-tight">{data.title}</h2>}
          {data.text && (
            <p
              className={cn(
                'text-base whitespace-pre-line text-muted-foreground',
                data.title && 'mt-2'
              )}
            >
              {data.text}
            </p>
          )}
          {data.buttonLabel && data.buttonUrl && (
            <BlockLink href={data.buttonUrl} className={cn(BUTTON, 'mt-5')}>
              {data.buttonLabel}
            </BlockLink>
          )}
        </div>
      )}
    </section>
  );
};

/* ---------------------------------------------------------------- cards */

const CARD_GRID: Record<ICardsBlockData['columns'], string> = {
  '1': '',
  '2': 'sm:grid-cols-2',
  '3': 'sm:grid-cols-3',
};

const CARD_SIZES: Record<ICardsBlockData['columns'], string> = {
  '1': COLUMN_SIZES,
  '2': HALF_SIZES,
  '3': THIRD_SIZES,
};

const Card: React.FC<{ item: ICardItem; sizes: string }> = ({ item, sizes }) => {
  const link = Boolean(item.linkUrl && isSafeUrl(item.linkUrl));
  const srcSet = item.imageUrl ? pageImageSrcSet(item.imageUrl) : undefined;
  const content = (
    <>
      {item.imageUrl && (
        <div className="aspect-video overflow-hidden bg-muted">
          <img
            src={item.imageUrl}
            srcSet={srcSet}
            sizes={srcSet ? sizes : undefined}
            alt={item.alt}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        {item.title && <h3 className="font-bold text-foreground">{item.title}</h3>}
        {item.text && (
          <p
            className={cn(
              'text-body whitespace-pre-line text-muted-foreground',
              item.title && 'mt-1'
            )}
          >
            {item.text}
          </p>
        )}
        {link && (
          <span className="mt-auto inline-flex items-center gap-1 pt-3 text-body font-bold text-foreground">
            {item.linkLabel || item.title}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        )}
      </div>
    </>
  );
  const className =
    'group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card';
  // Whole card is the link: big touch target on phones.
  return link ? (
    <BlockLink
      href={item.linkUrl}
      className={cn(
        className,
        'transition-colors hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:bg-foreground/[0.03]'
      )}
    >
      {content}
    </BlockLink>
  ) : (
    <div className={className}>{content}</div>
  );
};

export const CardsBlock: React.FC<{ data: ICardsBlockData }> = ({ data }) => {
  const items = data.items.filter(item => item.title || item.text || item.imageUrl);
  if (!items.length) return null;
  const columns = data.columns in CARD_GRID ? data.columns : '2';
  return (
    <section>
      {data.title && <h2 className="mb-4 text-xl font-bold tracking-tight">{data.title}</h2>}
      <ul className={cn('grid grid-cols-1 gap-3', CARD_GRID[columns])}>
        {items.map((item, index) => (
          <li key={index} className="min-w-0">
            <Card item={item} sizes={CARD_SIZES[columns]} />
          </li>
        ))}
      </ul>
    </section>
  );
};
