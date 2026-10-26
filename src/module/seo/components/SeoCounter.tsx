import { cn } from '@ui/lib/utils';
import React from 'react';

/** `42 / 60` – muted up to `ideal`, bold above it (still allowed), red above `max`. */
export const SeoCounter: React.FC<{ length: number; ideal: number; max: number; id?: string }> = ({
  length,
  ideal,
  max,
  id,
}) => (
  <span
    id={id}
    aria-live="polite"
    className={cn(
      'text-xs tabular-nums',
      length > max
        ? 'font-semibold text-destructive'
        : length > ideal
          ? 'font-semibold text-foreground'
          : 'text-muted-foreground'
    )}
  >
    {length} / {ideal}
  </span>
);
