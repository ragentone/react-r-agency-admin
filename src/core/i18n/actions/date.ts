import { getLocaleByKey } from '@core/i18n/locale';
import { format } from 'date-and-time';
import de from 'date-and-time/locales/de';
import en from 'date-and-time/locales/en';
import ru from 'date-and-time/locales/ru';
import type { Locale } from 'date-and-time/plugin';

import type { DateTimeFormat, Locales } from '../types.ts';

export type DateTimeUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';

const mapping: Record<Locales, Locale> = {
  de: de,
  en: en,
  ru: ru,
};

const parseDate = (date: Date | string | undefined | null) => {
  if (!date) {
    date = new Date();
  }
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date;
};

const formatDateTime = (date: Date | string, toFormat: DateTimeFormat, locale: Locales = 'en') => {
  const matchLocale = getLocaleByKey(locale);
  if (!matchLocale) {
    return undefined;
  }

  if (typeof date === 'string') {
    date = new Date(date);
  }

  try {
    return format(date, matchLocale.formats[toFormat], {
      locale: mapping[matchLocale.key],
      //hour24: 'h24',
    });
  } catch {
    return '';
  }
};

const getTimeDifference = ({
  start,
  end,
  unit,
}: {
  start: Date;
  end?: Date;
  unit?: DateTimeUnit;
}): number => {
  const date1 = start;
  const date2 = end ?? new Date();

  const timeDiffMs = Math.abs(date2.getTime() - date1.getTime());

  switch (unit) {
    case 'minutes':
      return Math.floor(timeDiffMs / (1000 * 60));
    case 'hours':
      return Math.floor(timeDiffMs / (1000 * 60 * 60));
    case 'days':
      return Math.floor(timeDiffMs / (1000 * 60 * 60 * 24));
    case 'weeks':
      return Math.floor(timeDiffMs / (1000 * 60 * 60 * 24 * 7));
    case 'months':
      return Math.floor(timeDiffMs / (1000 * 60 * 60 * 24 * 30.44));
    case 'years':
      return Math.floor(timeDiffMs / (1000 * 60 * 60 * 24 * 365.25));
    default:
      return timeDiffMs;
  }
};

export { formatDateTime, getTimeDifference, parseDate };
