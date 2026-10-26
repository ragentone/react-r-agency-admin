import { type IMediaImageProps, MediaImage } from '@core/media';
import { parseCssWidthOrHeight } from '@core/utils';
import { BaseHeadline } from '@ui/base/BaseHeadline.tsx';
import { BaseText } from '@ui/base/BaseText.tsx';
import { cn } from '@ui/lib';
import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { BaseCardContext, type IBaseCardContext } from './base-card.context.ts';

type BaseCardRenderFn = (context: IBaseCardContext) => ReactNode;

interface IProps {
  children?: ReactNode;
  className?: string;
}

interface IProviderProps {
  children: (context: IBaseCardContext) => ReactNode;
  cardProps: IBaseCardProps;
}

export interface IBaseCardImageProps {
  src: string;
  height?: string | number;
  delay?: number;
  objectFit?: IMediaImageProps['objectFit'];
}

export interface IBaseCardProps {
  image?: IBaseCardImageProps;
  width?: string | number;
  center?: boolean;
  headerTitle?: string;
  headerDescription?: string;
  children?: ReactNode | BaseCardRenderFn;
  className?: string;
}

const BaseCardTitle = (props: IProps) => {
  return <BaseHeadline className={cn('leading-5', props.className)}>{props.children}</BaseHeadline>;
};

const BaseCardDescription = (props: IProps) => {
  return <BaseText className={props.className}>{props.children}</BaseText>;
};

const BaseCardHeader = (props: IProps) => {
  return (
    <div
      className={cn(
        'order-1 p-4',
        {
          'border-b border-border/50': true,
        },
        props.className
      )}
    >
      {props.children}
    </div>
  );
};

const BaseCardFooter = (props: IProps) => {
  return (
    <div className={cn('order-4 w-full p-4 border-t border-border/50', props.className)}>
      {props.children}
    </div>
  );
};

const BaseCardContent = (props: IProps) => {
  return <div className={'order-3 p-4'}>{props.children}</div>;
};

const BaseCardImage = (props: IBaseCardImageProps) => {
  return (
    <div className={'relative order-2'}>
      <MediaImage height={props.height} src={props.src} objectFit={props.objectFit} />
    </div>
  );
};

const BaseCardProvider = (props: IProviderProps) => {
  const [mounted, setMounted] = useState(false);

  const contextValue = useMemo<IBaseCardContext>(() => {
    return {
      mounted,
      cardProps: props.cardProps,
    };
  }, [mounted, props.cardProps]);

  useEffect(() => {
    const init = () => setMounted(true);
    init();
  }, []);

  return (
    <BaseCardContext.Provider value={contextValue}>
      {props.children(contextValue)}
    </BaseCardContext.Provider>
  );
};

const BaseCard = (props: IBaseCardProps) => {
  return (
    <BaseCardProvider cardProps={props}>
      {ctx => (
        <div
          role={'base-card'}
          style={{ width: parseCssWidthOrHeight(props.width, '100%'), maxWidth: '100%' }}
          className={cn(
            'relative flex flex-col rounded-2xl border border-border/50',
            {
              'mx-auto': props.center,
            },
            props.className
          )}
        >
          {props.image && <BaseCardImage {...props.image} />}
          {typeof props.children === 'function' ? props.children(ctx) : props.children}
        </div>
      )}
    </BaseCardProvider>
  );
};

export {
  BaseCard,
  BaseCardContent,
  BaseCardDescription,
  BaseCardFooter,
  BaseCardHeader,
  BaseCardTitle,
};
