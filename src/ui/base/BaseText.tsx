import { cn } from '@ui/lib';
import { type ReactNode } from 'react';

/**
 * Interface representing the base properties for a text component.
 * @interface IBaseTextProps
 * @property {string} text - The text content to display.
 * @property {string} [className] - Optional CSS class name for styling the component.
 */
export interface IBaseTextProps {
  text?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * BaseText is a functional component that renders a paragraph element with configurable styles and text content.
 * The text content is passed via the `text` property, and additional CSS classes can be specified using the `className` property.
 */
const BaseText = (props: IBaseTextProps) => {
  return (
    <span className={cn('text-muted-foreground text-xs sm:text-sm', props.className)}>
      {props.children ? props.children : props.text}
    </span>
  );
};

export { BaseText };
