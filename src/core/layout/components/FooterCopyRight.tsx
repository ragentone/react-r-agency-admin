import { cn } from '@ui/lib';

/**
 * Defines the properties that can be passed to a component implementing this interface.
 *
 * @interface IProps
 * @property {string} [className] - An optional CSS class name to apply custom styling.
 */
interface IProps {
  className?: string;
}

/**
 * FooterCopyRight is a functional React component that renders
 * a copyright notice with the current year. The component applies
 * stylings using a combination of default and custom class names.
 * @param {IProps} props - The properties passed to the component.
 * @param {string} [props.className] - An optional custom className
 */
const FooterCopyRight = (props: IProps) => {
  return (
    <small className={cn('text-muted-foreground select-none font-bold', props.className)}>
      Copyright © {new Date().getFullYear()}
    </small>
  );
};

export { FooterCopyRight };
