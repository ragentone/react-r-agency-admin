import type { ButtonProps } from '@ui/shad-cn/components/button.tsx';

interface InputStyleOptions {
  rounded?: boolean;
  extend?: string;
}

interface ButtonStyleOptions {
  rounded?: boolean;
  extend?: string;
}
/**
 * Interface representing theme variables for a UI component library.
 *
 * This interface defines the customizable properties related to theme variations
 * that can be used to style components such as buttons.
 *
 * Properties:
 * - `buttonVariant`: Defines the variant of the button, such as "primary" or "secondary".
 * - `buttonSize`: Specifies the size of the button, such as "small", "medium", or "large".
 */
export interface IThemeVariables {
  buttonVariant: ButtonProps['variant'];
  buttonSize: ButtonProps['size'];
  inputStyle: (opts?: InputStyleOptions) => string;
  buttonStyle: (opts?: ButtonStyleOptions) => string;
}

/**
 * Represents the properties that can be passed to a Button component.
 *
 * @interface
 *
 * @property variant - Optional. Defines the visual style of the button.
 *                     This property maps to the 'variant' type defined in ButtonProps.
 * @property size - Optional. Specifies the size of the button.
 *                  This property maps to the 'size' type defined in ButtonProps.
 */
export interface IButtonProps {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  flat?: any;
}
