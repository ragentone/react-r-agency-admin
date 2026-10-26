import { baseWidthMap } from '@ui/base/const.ts';
import type { BaseWidth } from '@ui/base/types.ts';
import { cn } from '@ui/lib';
import type { ClassValue } from 'clsx';

interface IWidthOptions {
  center?: boolean;
  extends?: ClassValue;
}

/**
 * A utility function for managing Tailwind CSS class names. This function
 * combines multiple class name values into a single string using the `cn`
 * function. It simplifies the dynamic composition of class lists for use
 * with Tailwind CSS.
 */
export const tailwind = (...classes: ClassValue[]) => {
  return cn(...classes);
};

/**
 * Returns the Tailwind CSS class representing the base width configuration.
 */
export const getBaseWidth = (key: BaseWidth, options: IWidthOptions = {}): string => {
  return tailwind(
    baseWidthMap[key],
    {
      'mx-auto': options.center,
      'max-w-full': true,
    },
    options.extends
  );
};
