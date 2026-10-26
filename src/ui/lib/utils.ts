import { type ClassValue, clsx } from 'clsx';
import { tv, twMerge } from './merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const focusRing = tv({
  base: 'outline-none',
  variants: {
    isFocusVisible: {
      false: 'outline-0',
      true: 'ring-ring/50 ring-[3px] border-ring',
    },
  },
});
