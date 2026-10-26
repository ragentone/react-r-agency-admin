import { cn } from '@ui/lib/utils';
import React, { useMemo } from 'react';

/** Mini line (plain SVG, no recharts) – a trend at a glance inside a tile. */
export const Sparkline: React.FC<{ values: number[]; className?: string; height?: number }> = ({
  values,
  className,
  height = 28,
}) => {
  const path = useMemo(() => {
    const max = Math.max(1, ...values);
    const min = Math.min(0, ...values);
    const span = max - min || 1;
    const step = values.length > 1 ? 100 / (values.length - 1) : 100;
    return values
      .map((value, index) => {
        const x = index * step;
        const y = height - 2 - ((value - min) / span) * (height - 4);
        return `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }, [values, height]);
  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className={cn('h-7 w-full overflow-visible text-foreground', className)}
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};
