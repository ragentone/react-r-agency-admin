import { cn } from '@ui/lib/utils';
import { ChevronDown } from 'lucide-react';
import React from 'react';

/**
 * Funnel as falling bars: each step with its number, the share of the first step and – between
 * two steps – how many dropped out.
 */
export const Funnel: React.FC<{
  steps: Array<{ key: string; label: string; value: number }>;
  dropLabel: (percent: number) => string;
  className?: string;
}> = ({ steps, dropLabel, className }) => {
  const first = Math.max(1, steps[0]?.value ?? 0);
  return (
    <ol className={cn('flex flex-col', className)}>
      {steps.map((step, index) => {
        const share = (step.value / first) * 100;
        const previous = index > 0 ? steps[index - 1].value : null;
        const drop =
          previous !== null && previous > 0
            ? Math.max(0, Math.round(((previous - step.value) / previous) * 100))
            : null;
        return (
          <li key={step.key}>
            {drop !== null && (
              <div className="flex items-center gap-1 py-1 pl-2 text-micro font-semibold text-muted-foreground">
                <ChevronDown className="size-3.5" aria-hidden="true" />
                {dropLabel(drop)}
              </div>
            )}
            <div className="relative flex min-h-11 items-center gap-3 overflow-hidden rounded-xl border border-border/60 px-3">
              <span
                className="absolute inset-y-0 left-0 bg-foreground/10"
                style={{ width: `${Math.max(1, Math.min(100, share))}%` }}
                aria-hidden="true"
              />
              <span className="relative min-w-0 flex-1 text-sm font-semibold">{step.label}</span>
              <span className="relative text-sm font-bold tabular-nums">
                {step.value.toLocaleString()}
              </span>
              <span className="relative w-12 text-right text-caption text-muted-foreground tabular-nums">
                {index === 0 ? '100 %' : `${Math.round(share)} %`}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
};
