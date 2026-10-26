import type { DateTimeFormat, Locales } from '../types.ts';

export interface ILocale {
  key: Locales;
  label: string;
  base: boolean;
  formats: Record<DateTimeFormat, string>;
}
