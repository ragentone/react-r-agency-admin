import { type IViewOptions, type IViewReturn, useInView } from '@ui/hooks';
import { cn } from '@ui/lib';
import { type ReactNode } from 'react';

interface IChildrenArgs {
  view: Omit<IViewReturn, 'registerElement' | 'destroy'>;
}

type ChildrenFn = (args: IChildrenArgs) => ReactNode;

interface IClickEvent {
  entry: IntersectionObserverEntry;
}

interface IProps {
  children: ChildrenFn | ReactNode;
  className?: string;
  options?: IViewOptions;
  onClick?: (event: IClickEvent) => void;
}

export const BaseInView = (props: IProps) => {
  const { registerElement, isInView, viewed, entry, scrollToView } = useInView(props.options);

  return (
    <div
      onClick={() => {
        if (!entry || !props.onClick) return;
        props.onClick({ entry });
      }}
      className={cn(props.className, {
        'cursor-pointer': props.onClick,
      })}
      ref={registerElement}
    >
      {typeof props.children === 'function' ? (
        props.children({ view: { isInView, viewed, entry, scrollToView } })
      ) : (
        <>{isInView ? props.children : null}</>
      )}
    </div>
  );
};
