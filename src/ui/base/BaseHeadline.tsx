import { cn } from '@ui/lib';
import { type ReactNode } from 'react';

/**
 * Interface representing the properties for a basic headline component.
 * @interface IBaseHeadlineProps
 * @property {string} text - The text content of the headline.
 * @property {string} [className] - An optional CSS class to apply to the headline for styling purposes.
 */
export interface IBaseHeadlineProps {
  text?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * BaseHeadline is a functional component that renders a styled headline element.
 * This component applies default styling for text size, weight, tracking, and color,
 * while also allowing customization through additional class names and text content.
 */
const BaseHeadline = (props: IBaseHeadlineProps) => {
  return (
    <h1
      className={cn(
        'text-xl sm:text-2xl font-bold tracking-tight text-foreground',
        props.className
      )}
    >
      {props.children ? props.children : props.text}
    </h1>
  );
};

export { BaseHeadline };
