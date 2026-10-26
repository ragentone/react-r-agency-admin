import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { type Theme, ThemeContext } from './theme.context.ts';

/** `--background` of `src/index.css` as hex (browser / PWA status bar colour). */
const THEME_COLORS = { light: '#ffffff', dark: '#0a0a0a' } as const;

const applyThemeColor = (resolved: keyof typeof THEME_COLORS) => {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLORS[resolved]);
};

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'app-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      applyThemeColor(systemTheme);
      return;
    }

    root.classList.add(theme);
    applyThemeColor(theme);
  }, [theme]);

  const value = useMemo(() => {
    return {
      theme,
      setTheme: (theme: Theme) => {
        localStorage.setItem(storageKey, theme);
        setTheme(theme);
      },
    };
  }, [storageKey, theme]);

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
