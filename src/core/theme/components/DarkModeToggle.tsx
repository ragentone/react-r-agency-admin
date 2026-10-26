import { Button, type ButtonProps } from '@ui/shad-cn/components/button.tsx';
import { Moon, Sun } from 'lucide-react';
import { type ReactNode, useCallback } from 'react';

import { useTheme } from './use.theme.ts';

interface IProps {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
}

/**
 * A functional component that renders a button to toggle between light and dark themes.
 * The button changes its icon based on the current theme and updates the theme state
 * when clicked.
 *
 * @param {Object} props - The properties passed to the DarkModeToggle component.
 * @param {string} props.variant - The variant/style of the button (e.g., primary, secondary).
 * @param {string} props.size - The size of the button (e.g., small, medium, large).
 * @return {JSX.Element} A button element that toggles the application's theme.
 */
export function DarkModeToggle({ variant, size }: IProps): ReactNode {
  const { setTheme, theme } = useTheme();

  const handle = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [setTheme, theme]);

  return (
    <Button onClick={handle} variant={variant} size={size}>
      {theme === 'light' && <Sun size={18} />}
      {theme === 'dark' && <Moon size={18} />}
    </Button>
  );
}
