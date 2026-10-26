import type {
  BaseAnimation,
  BaseBackground,
  BaseBorder,
  BaseFlexDirection,
  BaseFlexGap,
  BaseFlexItems,
  BaseFlexJustify,
  BaseFlexWrap,
  BaseFont,
  BasePadding,
  BaseRing,
  BaseRounded,
  BaseShadow,
  BaseTextSize,
  BaseWidth,
} from '@ui/base/types.ts';
import { cn } from '@ui/lib';

export const baseRingSize = 'ring-[3px]';
export const baseDefaultPadding: BasePadding = 'md';
export const baseDefaultRounded: BaseRounded = 'md';
export const baseDefaultTextSize: BaseTextSize = 'md';
export const baseDefaultBorder: BaseBorder = 'none';

export const baseWidthMap: Record<BaseWidth, string> = {
  auto: 'w-auto',
  sm: 'w-sm',
  md: 'w-md',
  lg: 'w-lg',
  xl: 'w-xl',
  '2xl': 'w-2xl',
  '3xl': 'w-3xl',
  '4xl': 'w-4xl',
  wide: 'w-7xl',
  full: 'w-full',
};

export const baseFontMap: Record<BaseFont, string> = {
  none: '',
  bold: 'font-bold',
  medium: 'font-medium',
  light: 'font-light',
  'extra-bold': 'font-extrabold',
  'extra-light': 'font-extralight',
};

export const baseBackgroundMap: Record<BaseBackground, string> = {
  default: 'bg-background',
  danger: 'bg-red-500 text-white',
  primary: 'bg-primary text-background dark:text-black',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white',
};

export const baseRingMap: Record<BaseRing, string> = {
  default: cn(baseRingSize, 'ring-ring/32'),
  warning: cn(baseRingSize, 'ring-yellow-500/32'),
  danger: cn(baseRingSize, 'ring-red-500/32'),
  info: cn(baseRingSize, 'ring-blue-500/32'),
  success: cn(baseRingSize, 'ring-green-500/32'),
  none: 'ring-0',
};

export const baseAnimationMap: Record<BaseAnimation, string> = {
  none: '',
  ping: 'animate-ping',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
};

export const baseBoxShadowMap: Record<BaseShadow, string> = {
  none: 'shadow-none',
  sm: 'shadow-xs',
  md: 'shadow',
  lg: 'shadow-lg',
};

export const baseBorderMap: Record<BaseBorder, string> = {
  strong: 'border border-border',
  default: 'border border-border/50',
  none: 'border-none border-0',
};

export const baseTextSizeMap: Record<BaseTextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '4xl': 'text-4xl',
  headline: cn('sm:text-4xl text-xl'),
};

export const basePaddingMap: Record<BasePadding, string> = {
  none: 'p-0',
  xs: 'p-1',
  sm: 'p-4',
  md: 'p-4',
  lg: 'sm:p-6 p-4',
  xl: 'sm:p-8 p-4',
};

export const baseRoundMap: Record<BaseRounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-xl',
  md: 'rounded-2xl',
  lg: 'rounded-4xl',
  full: 'rounded-full',
};

export const baseFlexDirectionMap: Record<BaseFlexDirection, string> = {
  row: 'flex-row',
  column: 'flex-col',
};

export const baseFlexJustifyMap: Record<BaseFlexJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export const baseFlexItemsMap: Record<BaseFlexItems, string> = {
  baseline: 'items-baseline',
  stretch: 'items-stretch',
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
};

export const baseFlexGapMap: Record<BaseFlexGap, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export const baseFlexWrapMap: Record<BaseFlexWrap, string> = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse',
};
