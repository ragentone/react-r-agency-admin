import {
  baseAnimationMap,
  baseBackgroundMap,
  baseBorderMap,
  baseBoxShadowMap,
  baseDefaultBorder,
  baseDefaultRounded,
  baseDefaultTextSize,
  baseFontMap,
  basePaddingMap,
  baseRingMap,
  baseRoundMap,
  baseTextSizeMap,
} from '@ui/base/const.ts';
import type {
  BaseAnimation,
  BaseBackground,
  BaseBorder,
  BaseFont,
  BasePadding,
  BaseRing,
  BaseRounded,
  BaseShadow,
  BaseTextSize,
  BaseWidth,
} from '@ui/base/types.ts';
import { getBaseWidth } from '@ui/base/utils.ts';
import { cn } from '@ui/lib';
import { type ReactNode } from 'react';

export interface IBaseBoxProps {
  children?: ReactNode;
  padding?: BasePadding;
  rounded?: BaseRounded;
  textSize?: BaseTextSize;
  border?: BaseBorder;
  shadow?: BaseShadow;
  ring?: BaseRing;
  animation?: BaseAnimation;
  background?: BaseBackground;
  font?: BaseFont;
  className?: string;
  width?: BaseWidth;
}

export const BaseBox = (props: IBaseBoxProps) => {
  return (
    <div
      className={cn(
        'relative',
        [
          basePaddingMap[props.padding ?? 'none'],
          baseRoundMap[props.rounded ?? baseDefaultRounded],
          baseBorderMap[props.border ?? baseDefaultBorder],
          baseTextSizeMap[props.textSize ?? baseDefaultTextSize],
          baseBoxShadowMap[props.shadow ?? 'none'],
          baseRingMap[props.ring ?? 'none'],
          baseAnimationMap[props.animation ?? 'none'],
          baseBackgroundMap[props.background ?? 'default'],
          baseFontMap[props.font ?? 'none'],
          getBaseWidth(props.width ?? 'auto', { center: true }),
        ],
        props.className
      )}
    >
      {props.children}
    </div>
  );
};
