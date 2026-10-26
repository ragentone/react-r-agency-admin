import type { IThemeVariables } from '@core/theme/types.ts';
import { cn } from '@ui/lib';

/**
 * ThemeVariable provides the configuration options for theming in the application.
 * It defines the default properties for UI components such as button size and variant.
 *
 * Properties:
 * - buttonSize: Determines the default size of buttons. Possible values include 'sm', 'md', 'lg'.
 * - buttonVariant: Specifies the default visual style of buttons. Possible values include 'outline', 'solid', etc.
 */
export const ThemeVariable: IThemeVariables = {
  buttonSize: 'sm',
  buttonVariant: 'outline',
  inputStyle: opts => {
    return cn(
      'h-11 text-base md:text-base',
      {
        'rounded-2xl': opts?.rounded ?? true,
      },
      opts?.extend
    );
  },
  buttonStyle: opts => {
    return cn('inline-flex h-10 shrink-0 items-center gap-1.5 px-4 text-sm font-bold outline-none', {
      'rounded-full': opts?.rounded ?? true,
    });
  },
};
