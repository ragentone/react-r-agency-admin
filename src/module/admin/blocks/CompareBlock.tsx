import { cn } from '@ui/lib/utils';
import { ArrowLeftRight } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { pageImageSrcSet, RATIO_CLASS } from './image.utils';
import type { ICompareBlockData } from './types';

const SIZES = '(min-width: 768px) 800px, 100vw';
const CHIP =
  'pointer-events-none absolute top-3 max-w-[40%] truncate rounded-full bg-black/60 px-2.5 py-1 text-caption font-semibold text-white backdrop-blur';

const Picture: React.FC<{ url: string; alt?: string; className?: string; clip?: string }> = ({
  url,
  alt = '',
  className,
  clip,
}) => {
  const srcSet = pageImageSrcSet(url);
  return (
    <img
      src={url}
      srcSet={srcSet}
      sizes={srcSet ? SIZES : undefined}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      style={clip ? { clipPath: clip } : undefined}
      className={cn('absolute inset-0 size-full object-cover', className)}
    />
  );
};

/**
 * Before / after: the "before" image lies over the "after" image and is cut off at the divider.
 * A transparent range input on top does the dragging (touch, mouse and keyboard, screen readers).
 */
export const CompareBlock: React.FC<{ data: ICompareBlockData }> = ({ data }) => {
  const { t } = useTranslation('admin');
  const [position, setPosition] = useState(data.start);
  if (!data.beforeUrl || !data.afterUrl) return null;
  const before = data.beforeLabel || t('blocks.compare.before');
  const after = data.afterLabel || t('blocks.compare.after');
  return (
    <figure className="m-0">
      {data.title && <h2 className="mb-3 text-xl font-bold tracking-tight">{data.title}</h2>}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl bg-muted select-none has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-foreground',
          RATIO_CLASS[data.ratio]
        )}
      >
        <Picture url={data.afterUrl} alt={data.alt} />
        <Picture url={data.beforeUrl} clip={`inset(0 ${100 - position}% 0 0)`} />
        <span className={cn(CHIP, 'left-3')}>{before}</span>
        <span className={cn(CHIP, 'right-3')}>{after}</span>
        <div
          aria-hidden="true"
          style={{ left: `${position}%` }}
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_6px_rgba(0,0,0,0.5)]"
        >
          <span className="absolute top-1/2 left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-black shadow-lg">
            <ArrowLeftRight className="size-4" />
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={position}
          onChange={event => setPosition(Number(event.target.value))}
          aria-label={t('blocks.compare.slider', { before, after })}
          className="absolute inset-0 size-full cursor-ew-resize touch-pan-y opacity-0"
        />
      </div>
      {data.caption && (
        <figcaption className="mt-2 text-caption whitespace-pre-line text-muted-foreground">
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
};
