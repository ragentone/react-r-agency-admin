import { cn } from '@ui/lib/utils';
import React from 'react';

export interface IBarListItem {
  key: string;
  label: React.ReactNode;
  value: number;
  /** Shown instead of `value` (e.g. "42 · 61 %"). */
  display?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}

/**
 * Horizontal bars as a list (labels never cut off on 375 px, no chart library): the bar is a
 * light fill behind the row, the number stays readable on the right.
 */
export const BarList: React.FC<{
  items: IBarListItem[];
  /** Longest bar (default: biggest value). */
  max?: number;
  hollow?: boolean;
  empty?: React.ReactNode;
  className?: string;
}> = ({ items, max, hollow, empty, className }) => {
  if (!items.length) return <>{empty ?? null}</>;
  const top = Math.max(1, max ?? Math.max(...items.map(item => item.value)));
  return (
    <ul className={cn('flex flex-col gap-1', className)}>
      {items.map(item => {
        const width = `${Math.max(2, (item.value / top) * 100)}%`;
        const Row = item.onClick ? 'button' : 'div';
        return (
          <li key={item.key}>
            <Row
              type={item.onClick ? 'button' : undefined}
              onClick={item.onClick}
              className={cn(
                'relative flex min-h-9 w-full items-center gap-2 overflow-hidden rounded-lg px-2.5 py-1.5 text-left',
                item.onClick && 'hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring'
              )}
            >
              <span
                className={cn(
                  'absolute inset-y-0 left-0 rounded-lg',
                  hollow ? 'border-2 border-foreground/25' : 'bg-foreground/10'
                )}
                style={{ width }}
                aria-hidden="true"
              />
              {item.icon && (
                <span className="relative shrink-0 text-muted-foreground [&>svg]:size-4">
                  {item.icon}
                </span>
              )}
              <span className="relative min-w-0 flex-1 text-sm font-semibold break-words">
                {item.label}
              </span>
              <span className="relative shrink-0 text-sm font-bold tabular-nums">
                {item.display ?? item.value.toLocaleString()}
              </span>
            </Row>
          </li>
        );
      })}
    </ul>
  );
};
