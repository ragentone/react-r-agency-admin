import { cn } from '@ui/lib';

/**
 * Represents the properties for a component.
 * @interface IProps
 * @property {object | Record<string, any> | any[]} value - Defines the main data or content for the component.
 * @property {string} [className] - Specifies an optional CSS class name for styling the component.
 */
interface IProps {
  value: object | Record<string, any> | any[] | undefined | null;
  className?: string;
}

/**
 * A functional component that renders a JSON representation of the provided value.
 * The component wraps the JSON output in a div with optional styling classes.
 */
const BaseJsonView = ({ value, className }: IProps) => {
  return <div className={cn('relative', className)}>{value && JSON.stringify(value, null, 2)}</div>;
};

export { BaseJsonView };
