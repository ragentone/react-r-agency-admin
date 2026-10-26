import { cn } from '@ui/lib/utils';
import { type ChartConfig, ChartContainer } from '@ui/shad-cn/components/chart.tsx';
import React from 'react';

import { CHART_FILL, CHART_HATCH_ID } from './tokens';

/** Chart block: title, one-line explanation, optional legend / action, chart (full width). */
export const ChartBlock: React.FC<{
  title: string;
  text?: string;
  /** Screen readers: what the chart shows in one sentence. */
  label: string;
  config?: ChartConfig;
  legend?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  /** Without border at the bottom (last block, inside a card). */
  plain?: boolean;
  children: React.ComponentProps<typeof ChartContainer>['children'];
}> = ({ title, text, label, config = {}, legend, action, className, plain, children }) => (
  <figure className={cn('px-4 py-4', !plain && 'border-b border-border/50')}>
    <figcaption className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-title font-bold">{title}</h3>
        {text && <p className="mt-0.5 text-caption text-muted-foreground">{text}</p>}
      </div>
      {action}
    </figcaption>
    {legend && <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">{legend}</div>}
    <ChartContainer
      config={config}
      className={cn('mt-3 aspect-auto h-48 w-full sm:h-56', className)}
      aria-label={label}
      role="img"
    >
      {children}
    </ChartContainer>
  </figure>
);

/** Block without a recharts chart (lists, heatmap, funnel) – same frame as `ChartBlock`. */
export const ChartSection: React.FC<{
  title: string;
  text?: string;
  action?: React.ReactNode;
  legend?: React.ReactNode;
  plain?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ title, text, action, legend, plain, className, children }) => (
  <section className={cn('px-4 py-4', !plain && 'border-b border-border/50', className)}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-title font-bold">{title}</h3>
        {text && <p className="mt-0.5 text-caption text-muted-foreground">{text}</p>}
      </div>
      {action}
    </div>
    {legend && <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">{legend}</div>}
    <div className="mt-3">{children}</div>
  </section>
);

export type ChartLegendVariant = 'filled' | 'hollow' | 'line' | 'dashed' | 'dotted' | 'hatched';

/** Legend entry: square (filled / outlined / hatched) or line (solid / dashed / dotted). */
export const ChartLegendItem: React.FC<{
  variant?: ChartLegendVariant;
  label: React.ReactNode;
  value?: React.ReactNode;
  /** Kids compatibility: `hollow` / `line` flags. */
  hollow?: boolean;
  line?: boolean;
}> = ({ variant, label, value, hollow, line }) => {
  const kind: ChartLegendVariant = variant ?? (line ? 'line' : hollow ? 'hollow' : 'filled');
  return (
    <span className="flex items-center gap-1.5 text-caption font-semibold">
      {kind === 'line' || kind === 'dashed' || kind === 'dotted' ? (
        <span
          className={cn(
            'h-0 w-4 border-t-2 border-foreground',
            kind === 'dashed' && 'border-dashed',
            kind === 'dotted' && 'border-dotted'
          )}
          aria-hidden="true"
        />
      ) : (
        <span
          className={cn(
            'size-3 rounded-[3px] border-2 border-foreground',
            kind === 'filled' && 'bg-foreground'
          )}
          style={
            kind === 'hatched'
              ? {
                  backgroundImage:
                    'repeating-linear-gradient(45deg, var(--foreground) 0 1.5px, transparent 1.5px 4px)',
                }
              : undefined
          }
          aria-hidden="true"
        />
      )}
      {label}
      {value !== undefined && <span className="tabular-nums text-muted-foreground">{value}</span>}
    </span>
  );
};

/** Heading inside a tab (no own border). */
export const ChartHeading: React.FC<{ title: string; text?: string }> = ({ title, text }) => (
  <div className="px-4 pt-4 pb-1">
    <h3 className="text-title font-bold">{title}</h3>
    {text && <p className="mt-0.5 text-caption text-muted-foreground">{text}</p>}
  </div>
);

/** `<defs>` with the hatch pattern – put it as first child of a recharts chart. */
export const ChartHatch: React.FC = () => (
  <defs>
    <pattern
      id={CHART_HATCH_ID}
      width="5"
      height="5"
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(45)"
    >
      <rect width="5" height="5" fill="var(--background)" />
      <line x1="0" y1="0" x2="0" y2="5" stroke={CHART_FILL} strokeWidth="2" />
    </pattern>
  </defs>
);
