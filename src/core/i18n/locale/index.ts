import type { ILocale } from '@core/i18n/locale/types.ts';

import type { Locales } from '../types.ts';

export * from './types.ts';

const allowedLocaleKeys: Locales[] = ['de', 'en', 'ru'];
const fallbackLocaleKey: Locales = 'en';

const locales: ILocale[] = [
  {
    key: 'de',
    label: 'locale.de',
    base: false,
    formats: {
      dateLong: 'ddd DD MMM YYYY',
      dateShort: 'DD.MM.YYYY',
      dateTimeLong: 'ddd DD MMM YYYY HH:mm',
      dateTimeShort: 'DD.MM.YYYY HH:mm',
      dateMonthYear: 'MMM YYYY',
    },
  },
  {
    key: 'en',
    label: 'locale.en',
    base: true,
    formats: {
      dateLong: 'ddd DD MMM YYYY',
      dateShort: 'MM.DD.YYYY',
      dateTimeShort: 'ddd DD MMM YYYY HH:mm',
      dateTimeLong: 'MM.DD.YYYY HH:mm',
      dateMonthYear: 'MMM YYYY',
    },
  },
  {
    key: 'ru',
    label: 'locale.ru',
    base: false,
    formats: {
      dateLong: 'ddd DD MMM YYYY',
      dateShort: 'DD.MM.YYYY',
      dateTimeLong: 'ddd DD MMM YYYY HH:mm',
      dateTimeShort: 'DD.MM.YYYY HH:mm',
      dateMonthYear: 'MMM YYYY',
    },
  },
];
const getLocales = (): ILocale[] => {
  return locales;
};

const getLocaleByKey = (key: Locales): ILocale | undefined => {
  return locales.find(locale => locale.key === key);
};

export { allowedLocaleKeys, fallbackLocaleKey, getLocaleByKey, getLocales };
