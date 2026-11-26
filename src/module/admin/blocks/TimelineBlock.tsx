import React from 'react';

import { pageImageSrcSet } from './image.utils';
import type { ITimelineBlockData } from './types';

const SIZES = '(min-width: 768px) 640px, calc(100vw - 3rem)';

/** Vertical time line: a line with a dot per entry, date above the title, optional image. */
export const TimelineBlock: React.FC<{ data: ITimelineBlockData }> = ({ data }) => {
  const items = data.items.filter(item => item.date || item.title || item.text || item.imageUrl);
  if (!items.length) return null;
  return (
    <section>
      {data.title && <h2 className="mb-5 text-xl font-bold tracking-tight">{data.title}</h2>}
      <ol className="ml-2 border-l border-border/50">
        {items.map((item, index) => {
          const srcSet = item.imageUrl ? pageImageSrcSet(item.imageUrl) : undefined;
          return (
            <li key={index} className="relative pb-8 pl-6 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute top-1.5 -left-[5px] size-2.5 rounded-full bg-foreground ring-4 ring-background"
              />
              {item.date && (
                <p className="text-caption font-semibold text-muted-foreground tabular-nums">
                  {item.date}
                </p>
              )}
              {item.title && <h3 className="text-lg font-bold tracking-tight">{item.title}</h3>}
              {item.text && (
                <p className="mt-1 text-body whitespace-pre-line text-muted-foreground">
                  {item.text}
                </p>
              )}
              {item.imageUrl && (
                <div className="mt-3 aspect-video overflow-hidden rounded-xl bg-muted">
                  <img
                    src={item.imageUrl}
                    srcSet={srcSet}
                    sizes={srcSet ? SIZES : undefined}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover"
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
};
