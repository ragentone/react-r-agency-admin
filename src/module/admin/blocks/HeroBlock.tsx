import { cn } from '@ui/lib/utils';
import { ArrowRight } from 'lucide-react';
import React from 'react';

import { BlockLink } from './BlockLink';
import { FocusImage } from './FocusImage';
import type { IHeroBlockData } from './types';

const BUTTON =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-body font-bold transition-opacity hover:opacity-85';

/** Mobile first: min heights grow with the text instead of a fixed ratio. */
const HERO_SIZE = {
  sm: 'min-h-56 sm:min-h-72',
  md: 'min-h-80 sm:min-h-[26rem]',
  lg: 'min-h-[28rem] sm:min-h-[34rem]',
} as const;

const HERO_JUSTIFY = { top: 'justify-start', center: 'justify-center', bottom: 'justify-end' };
const HERO_ALIGN = { left: 'items-start text-left', center: 'items-center text-center' };

const percent = (value: unknown, fallback: number, max = 100) => {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(0, number)) : fallback;
};

/**
 * Banner: background image (focus point stays visible on every width) or a plain black /
 * light area, with heading, text and button. Edge to edge, or inset + rounded.
 */
export const HeroBlock: React.FC<{ data: IHeroBlockData; first: boolean }> = ({ data, first }) => {
  const Heading = first ? 'h1' : 'h2';
  const image = Boolean(data.imageUrl);
  const light = !image && data.tone === 'light';
  const overlay = percent(data.overlay, 35, 80) / 100;

  return (
    <section
      className={cn(
        'relative isolate flex w-full flex-col overflow-hidden',
        HERO_SIZE[data.size] ?? HERO_SIZE.md,
        data.rounded && 'rounded-3xl',
        light
          ? 'bg-foreground/[0.04] text-foreground'
          : // Black in both themes – a hairline keeps it apart from a black page.
            'bg-neutral-950 text-white dark:ring-1 dark:ring-border dark:ring-inset'
      )}
    >
      {image && (
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <FocusImage
            src={data.imageUrl}
            focusX={percent(data.focusX, 50)}
            focusY={percent(data.focusY, 50)}
            loading={first ? 'eager' : 'lazy'}
            className="absolute inset-0 size-full"
          />
          <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />
          {/* Extra shade behind the text side. */}
          {data.valign !== 'center' && (
            <div
              className={cn(
                'absolute inset-x-0 h-2/3 from-black/55 to-transparent',
                data.valign === 'top' ? 'top-0 bg-gradient-to-b' : 'bottom-0 bg-gradient-to-t'
              )}
            />
          )}
        </div>
      )}
      <div
        className={cn(
          'mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-3 px-5 py-8 sm:px-8 sm:py-12',
          HERO_JUSTIFY[data.valign] ?? HERO_JUSTIFY.bottom,
          HERO_ALIGN[data.align] ?? HERO_ALIGN.left
        )}
      >
        {data.title && (
          <Heading className="max-w-2xl text-3xl leading-tight font-extrabold tracking-tight break-words sm:text-5xl">
            {data.title}
          </Heading>
        )}
        {data.text && (
          <p className="max-w-xl text-base leading-relaxed whitespace-pre-line opacity-90 sm:text-lg">
            {data.text}
          </p>
        )}
        {data.buttonLabel && data.buttonUrl && (
          <div className="pt-2">
            <BlockLink
              href={data.buttonUrl}
              className={cn(
                BUTTON,
                light ? 'bg-foreground text-background' : 'bg-white text-neutral-950'
              )}
            >
              {data.buttonLabel}
              <ArrowRight className="size-4" aria-hidden="true" />
            </BlockLink>
          </div>
        )}
      </div>
    </section>
  );
};
