import { ark } from '@ark-ui/react/factory';
import type React from 'react';
import type { VariantProps } from 'tailwind-variants';
import { tv } from '@ui/lib/merge';
import { cn } from '@ui/lib/utils';
import { Spinner } from '@ui/shad-cn/components/spinner';

/**
 * The one button of the platform (X look): pill, bold, flat.
 *
 * Variants: `default` (black, one main action per screen) · `outline` (secondary action) ·
 * `secondary` (quiet grey) · `ghost` (icons, toolbars, close) · `destructive` (red, the only
 * colour – irreversible delete) · `destructive-outline` · `link`.
 *
 * Sizes: `xs` 24 · `sm` 32 · `md` 36 (default) · `lg` 44 · `xl` 48 · `2xl` 56 px,
 * icons `icon-xs` 24 · `icon-sm` 32 · `icon-md` 36 · `icon-lg` 40 · `icon-xl` 48 px.
 * Small sizes get an invisible, larger hit area on touch screens (≥ 44 px).
 */
export const buttonVariants = tv({
  base: [
    'relative cursor-pointer select-none',
    'inline-flex shrink-0 items-center justify-center gap-2',
    'whitespace-nowrap font-bold',
    'rounded-lg',
    'transition-[background-color,border-color,color,opacity,transform]',
    'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
    'disabled:pointer-events-none disabled:opacity-50',
    'data-disabled:pointer-events-none data-disabled:opacity-50',
    'aria-disabled:pointer-events-none aria-disabled:opacity-50',
    'data-[state=loading]:pointer-events-none data-[state=loading]:opacity-100',
    'aria-invalid:border-destructive aria-invalid:ring-destructive/24',
    "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    'motion-reduce:transition-none!',
  ],
  variants: {
    variant: {
      default: [
        'bg-primary text-primary-foreground',
        'border border-transparent',
        'hover:bg-primary/85 active:bg-primary/75',
        'focus-visible:border-background',
      ],
      outline: [
        'bg-transparent text-foreground',
        'border border-border',
        'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        'focus-visible:border-foreground',
      ],
      secondary: [
        'bg-secondary text-secondary-foreground',
        'border border-transparent',
        'hover:bg-secondary/80 active:bg-secondary/70',
        'focus-visible:border-foreground',
      ],
      ghost: [
        'bg-transparent text-foreground',
        'border border-transparent',
        'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        'focus-visible:border-foreground',
      ],
      destructive: [
        'bg-destructive text-white',
        'border border-transparent',
        'hover:bg-destructive/90 active:bg-destructive/80',
        'focus-visible:border-background focus-visible:ring-destructive/32',
      ],
      'destructive-outline': [
        'bg-transparent text-destructive',
        'border border-destructive/40',
        'hover:bg-destructive/10 active:bg-destructive/20',
        'focus-visible:border-destructive focus-visible:ring-destructive/24',
      ],
      link: [
        'h-auto! px-0! text-foreground',
        'underline-offset-4',
        'border border-transparent',
        'hover:underline',
      ],
    },
    size: {
      xs: "h-6 gap-1 px-2.5 text-micro [&_svg:not([class*='size-'])]:size-3",
      sm: "h-8 gap-1.5 px-3.5 text-caption [&_svg:not([class*='size-'])]:size-3.5",
      md: 'h-9 px-4 text-sm',
      lg: "h-11 px-5 [&_svg:not([class*='size-'])]:size-5",
      xl: "h-12 px-6 [&_svg:not([class*='size-'])]:size-5",
      '2xl': "h-14 gap-2.5 px-7 text-title [&_svg:not([class*='size-'])]:size-6",
      'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3.5",
      'icon-sm': "size-8 [&_svg:not([class*='size-'])]:size-4",
      'icon-md': "size-9 [&_svg:not([class*='size-'])]:size-4.5",
      'icon-lg': "size-10 [&_svg:not([class*='size-'])]:size-5",
      'icon-xl': "size-12 [&_svg:not([class*='size-'])]:size-6",
    },
    clickEffect: {
      true: 'active:not-aria-[haspopup]:scale-[0.97]',
    },
    pill: {
      true: 'rounded-full',
    },
    fullWidth: {
      true: 'w-full',
    },
  },
  compoundVariants: [
    {
      // Small buttons: at least 44 px tappable on touch screens, without growing visually.
      size: ['xs', 'sm', 'md', 'icon-xs', 'icon-sm', 'icon-md', 'icon-lg'],
      className:
        "pointer-coarse:after:absolute pointer-coarse:after:-inset-y-1.5 pointer-coarse:after:-inset-x-1 pointer-coarse:after:content-['']",
    },
  ],
  defaultVariants: {
    variant: 'default',
    size: 'md',
    clickEffect: true,
    pill: true,
    fullWidth: false,
  },
});

export interface ButtonProps
  extends React.ComponentProps<typeof ark.button>, VariantProps<typeof buttonVariants> {
  /**
   * Apply a click effect to the button
   *
   * @default true
   */
  clickEffect?: boolean;
  /**
   * Rounded pill (X look). `false` only for button groups and similar.
   *
   * @default true
   */
  pill?: boolean;
  /**
   * Full width of the parent (main buttons in drawers and forms).
   *
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Show a loading indicator (keeps the width, blocks clicks)
   *
   * @default false
   */
  isLoading?: boolean;
}

export const Button = (props: ButtonProps) => {
  const {
    variant = 'default',
    size = 'md',
    clickEffect = true,
    pill = true,
    fullWidth = false,
    isLoading = false,
    className,
    children,
    ...rest
  } = props;

  return (
    <ark.button
      className={cn(buttonVariants({ variant, size, clickEffect, pill, fullWidth }), className)}
      data-size={size}
      data-slot="button"
      data-state={isLoading ? 'loading' : 'idle'}
      data-variant={variant}
      type="button"
      {...rest}
      aria-busy={isLoading || undefined}
      aria-disabled={isLoading || rest['aria-disabled'] || undefined}
    >
      {isLoading ? (
        <>
          <span aria-hidden className="invisible inline-flex items-center gap-[inherit]">
            {children}
          </span>

          <span className="sr-only">{children}</span>

          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner aria-hidden />
          </span>
        </>
      ) : (
        children
      )}
    </ark.button>
  );
};
