import { createContext } from 'react';

export type Theme = 'dark' | 'light' | 'system';

export interface IThemeContext {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: IThemeContext = {
  theme: 'system',
  setTheme: () => null,
};

export const ThemeContext = createContext<IThemeContext>(initialState);
