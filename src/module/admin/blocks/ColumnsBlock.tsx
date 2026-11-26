import { cn } from '@ui/lib/utils';
import React from 'react';

import { SitePageHtml } from '../components/SitePageHtml';
import type { IColumnsBlockData } from './types';

/** Empty editor HTML (`<p></p>`) counts as empty. */
const hasText = (html: string) => html.replace(/<[^>]*>|&nbsp;|\s/g, '') !== '';

/**
 * Side by side from `sm` (2 columns) or `md` (3 columns), stacked below. The optional line
 * separates the columns: on top when stacked, on the left when side by side.
 */
const LAYOUT = {
  2: {
    grid: 'sm:grid-cols-2 sm:gap-8',
    line: 'border-t pt-6 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8',
  },
  3: {
    grid: 'md:grid-cols-3 md:gap-8',
    line: 'border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8',
  },
} as const;

export const ColumnsBlock: React.FC<{ data: IColumnsBlockData; headingClass: string }> = ({
  data,
  headingClass,
}) => {
  const items = data.items.filter(item => hasText(item.html));
  if (!items.length) return null;
  const layout = items.length >= 3 ? LAYOUT[3] : LAYOUT[2];
  return (
    <section>
      {data.title && <h2 className={headingClass}>{data.title}</h2>}
      <div className={cn('grid gap-6', items.length > 1 && layout.grid)}>
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              'min-w-0',
              data.divider && index > 0 && cn('border-border/50', layout.line)
            )}
          >
            <SitePageHtml html={item.html} />
          </div>
        ))}
      </div>
    </section>
  );
};
