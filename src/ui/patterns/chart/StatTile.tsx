import { cn } from '@ui/lib/utils';
import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import React from 'react';

import { Sparkline } from './Sparkline';

/**
 * Key figure: big bold number, short label, optional hint, sparkline and change against the
 * previous period (arrow instead of colour). `goodWhenDown` for bounce rate & co.
 */
export const StatTile: React.FC<{
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
  spark?: number[];
  /** Change in percent against the previous period (null = no comparison). */
  change?: number | null;
  changeLabel?: string;
}> = ({ icon, label, value, hint, className, spark, change, changeLabel }) => {
  const Arrow =
    change === null || change === undefined || Math.abs(change) < 1
      ? ArrowRight
      : change > 0
        ? ArrowUpRight
        : ArrowDownRight;
  return (
    <Card className={cn('rounded-2xl border-border/60 shadow-none', className)}>
      <CardContent className="flex h-full flex-col gap-1 p-3">
        <span className="flex items-center gap-1.5 text-caption font-semibold text-muted-foreground [&>svg]:size-4 [&>svg]:shrink-0">
          {icon}
          <span className="min-w-0 truncate">{label}</span>
        </span>
        <span className="text-display font-black tabular-nums break-words">{value}</span>
        {change !== undefined && (
          <span
            className="flex items-center gap-1 text-micro font-semibold text-muted-foreground"
            aria-label={changeLabel}
          >
            <Arrow className="size-3.5 text-foreground" aria-hidden="true" />
            {change === null ? '–' : `${change > 0 ? '+' : ''}${Math.round(change)} %`}
          </span>
        )}
        {hint && <span className="text-micro text-muted-foreground">{hint}</span>}
        {spark && spark.length > 1 && <Sparkline values={spark} className="mt-auto pt-1" />}
      </CardContent>
    </Card>
  );
};
