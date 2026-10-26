import { useIdGenerator } from '@core/hooks';
import { parseCssWidthOrHeight } from '@core/utils';
import { cn } from '@ui/lib';
import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from 'react';

interface IChildrenArgs {
  index: number;
  id: string;
}

type ContainerChildrenFn = (args: IChildrenArgs) => ReactNode;

export interface IContainerProps {
  children: ReactNode;
  border?: boolean;
  className?: string;
  onClick?: () => void;
  onMounted?: () => void;
  onUnmounted?: () => void;
  style?: CSSProperties;
  width?: string | number;
}

export interface IContainerOptions {
  children: ReactNode | ContainerChildrenFn;
  className?: string;
  onClick?: () => void;
  onMounted?: () => void;
  onUnmounted?: () => void;
}

interface IContainerItem extends IContainerOptions {
  id: string;
}

export interface IContainerGroupProps {
  border?: boolean;
  items: IContainerOptions[];
  children?: ReactNode;
  className?: string;
}

/**
 * A functional component that renders a container group with dynamic child containers.
 * It utilizes memoized processing of container items and assigns unique IDs to each container.
 *
 * @param props - The properties object adhering to the IContainerGroupProps interface. These properties
 * control the behavior and styling of the container group and its items.
 *
 * Props details:
 * - `items`: An array of container options specifying configuration for each child container.
 * - `className`: An optional additional CSS class to customize the styling of the container group.
 * - `border`: Specifies border styles applied to each child container.
 * - `children`: React elements or a render function passed to be displayed after the generated containers.
 *
 * @returns A `div` element containing a dynamically generated list of child containers based
 * on `items` and any additional children provided.
 */
const BaseContainerGroup = (props: IContainerGroupProps) => {
  const [rwaItems] = useState<IContainerOptions[]>(props.items);
  const { rnd } = useIdGenerator();

  const items = useMemo<IContainerItem[]>(() => {
    return rwaItems.map(item => {
      return {
        ...item,
        id: rnd(8).toLowerCase(),
      };
    });
  }, [rnd, rwaItems]);

  return (
    <div className={cn('flex flex-col gap-4', props.className)}>
      {items.map((item, index) => (
        <BaseContainer
          onClick={item.onClick}
          className={item.className}
          key={index}
          border={props.border}
          onMounted={item.onMounted}
          onUnmounted={item.onUnmounted}
        >
          {typeof item.children === 'function'
            ? item.children({ index, id: item.id })
            : item.children}
        </BaseContainer>
      ))}
      {props.children}
    </div>
  );
};

/**
 * A functional component that provides a customizable container with optional behavior and styling.
 * @param {IContainerProps} props - The properties used to configure the container's behavior and appearance.
 * @param {boolean} [props.border] - Determines whether the container should have a bordered style.
 * @param {string} [props.className] - Additional custom CSS classes to apply to the container.
 * @param {React.ReactNode} [props.children] - The content to be rendered inside the container.
 * @param {function} [props.onClick] - Optional callback function invoked when the container is clicked.
 * @param {function} [props.onMounted] - Optional callback function invoked after the component is mounted.
 * @param {function} [props.onUnmounted] - Optional callback function invoked before the component is unmounted.
 */
const BaseContainer = (props: IContainerProps) => {
  useEffect(() => {
    if (props.onMounted) {
      props.onMounted();
    }
    return () => {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onClick={() => {
        if (!props.onClick) return;
        props.onClick();
      }}
      className={cn(
        'group p-4 transition-all duration-200 select-none',
        {
          'border border-border/50 rounded-2xl': props.border,
          'border-none!': !props.border,
          'cursor-pointer': props.onClick,
        },
        props.className
      )}
      style={{
        ...props.style,
        width: parseCssWidthOrHeight(props.width, '100%'),
        maxWidth: '100%',
      }}
    >
      {props.children}
    </div>
  );
};

export { BaseContainer, BaseContainerGroup };
