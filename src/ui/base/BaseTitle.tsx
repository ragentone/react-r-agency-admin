import { cn } from '@ui/lib';
import { type ReactNode } from 'react';

/**
 * Represents the base properties for a title component.
 * @interface IBaseTitleProps
 * @property {string} text - The text content to be displayed in the title.
 * @property {string} [className] - An optional CSS class name for custom styling.
 */
export interface IBaseTitleProps {
  text?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Functional component that renders a styled span element with a text label.
 * This component is typically used for displaying a base title or informational text with optional custom styling.
 */
const BaseTitle = (props: IBaseTitleProps) => {
  return (
    <span className={cn('text-muted-foreground font-bold text-sm sm:text-lg', props.className)}>
      {props.children ? props.children : props.text}
    </span>
  );
};

export { BaseTitle };
