import { createContext } from 'react';

export interface ILocaleContext {
  setLanguage(language: string): void;
  language: string;
}

export const LocaleContext = createContext<ILocaleContext | undefined>(undefined);
