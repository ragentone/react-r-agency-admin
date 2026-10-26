import { cn } from '@ui/lib/utils';
import { CheckIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

import { contrastColor } from '../utils';

export interface ColorSwatchProps extends Omit<ComponentProps<'button'>, 'color'> {
  color: string;
  selected?: boolean;
}

export function ColorSwatch({ color, selected = false, className, ...props }: ColorSwatchProps) {
  return (
    <button
      type="button"
      aria-label={color}
      aria-pressed={selected}
      title={color}
      className={cn(
        'relative flex aspect-square w-full items-center justify-center rounded-[min(25%,6px)] transition-transform',
        'shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.15)]',
        'hover:z-10 hover:scale-115 focus-visible:z-10 focus-visible:scale-115 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-popover focus-visible:outline-none',
        selected && 'ring-2 ring-ring ring-offset-1 ring-offset-popover',
        className
      )}
      style={{ backgroundColor: color }}
      {...props}
    >
      {selected && <CheckIcon className="size-3/5" style={{ color: contrastColor(color) }} />}
    </button>
  );
}
