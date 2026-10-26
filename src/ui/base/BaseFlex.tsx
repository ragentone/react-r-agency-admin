import { parseCssWidthOrHeight } from '@core/utils';
import {
  baseDefaultPadding,
  type BaseFlexDirection,
  baseFlexDirectionMap,
  type BaseFlexGap,
  baseFlexGapMap,
  type BaseFlexItems,
  baseFlexItemsMap,
  type BaseFlexJustify,
  baseFlexJustifyMap,
  type BaseFlexWrap,
  baseFlexWrapMap,
  type BasePadding,
  basePaddingMap,
} from '@ui/base';
import { cn } from '@ui/lib';
import { type ReactNode, useEffect, useState } from 'react';

export interface IBaseFlexProps {
  direction?: BaseFlexDirection;
  children?: ReactNode;
  gap?: BaseFlexGap;
  justify?: BaseFlexJustify;
  items?: BaseFlexItems;
  width?: string | number;
  padding?: BasePadding;
  wrap?: BaseFlexWrap;
}

export const BaseFlex = (props: IBaseFlexProps) => {
  const [justify, setJustify] = useState<BaseFlexJustify>('start');
  const [items, setItems] = useState<BaseFlexItems>('start');

  useEffect(() => {
    const change = () => {
      setJustify(props.justify ?? 'start');
      setItems(props.items ?? 'start');
    };
    change();
  }, [props.justify, props.items]);

  return (
    <div
      style={{ width: parseCssWidthOrHeight(props.width, '100%') }}
      className={cn(
        'relative flex',
        baseFlexDirectionMap[props.direction ?? 'row'],
        baseFlexGapMap[props.gap ?? 'none'],
        baseFlexItemsMap[items],
        baseFlexJustifyMap[justify],
        basePaddingMap[props.padding ?? baseDefaultPadding],
        baseFlexWrapMap[props.wrap ?? 'nowrap']
      )}
    >
      {props.children}
    </div>
  );
};
