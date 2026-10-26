import type { TFunction } from 'i18next';

import type { StatsRange } from './types';

export const RANGE_OPTIONS: Array<{ value: StatsRange; label: string }> = [
  { value: 1, label: 'stats.range.1' },
  { value: 7, label: 'stats.range.7' },
  { value: 30, label: 'stats.range.30' },
  { value: 365, label: 'stats.range.365' },
];

export const formatNumber = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);

/** 0.42 → "42 %" */
export const formatPercent = (value: number | null | undefined, locale: string) =>
  value === null || value === undefined
    ? '–'
    : new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(value);

/** 135 → "2:15 min", 4000 → "1 h 7 min" */
export const formatDuration = (seconds: number) => {
  const total = Math.max(0, Math.round(seconds));
  if (total < 60) return `${total} s`;
  const minutes = Math.floor(total / 60);
  if (minutes < 60) return `${minutes}:${String(total % 60).padStart(2, '0')} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min`;
};

/** "vor 3 Min." – relative to now. */
export const formatAgo = (iso: string | null | undefined, locale: string) => {
  if (!iso) return '–';
  const diff = (Date.parse(iso) - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
  const abs = Math.abs(diff);
  if (abs < 45) return rtf.format(Math.round(diff), 'second');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86_400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 86_400 * 30) return rtf.format(Math.round(diff / 86_400), 'day');
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
};

export const formatTime = (iso: string, locale: string) =>
  new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

/** Axis label of a day: "25.10." (or month name for a year). */
export const dayLabel = (day: string, locale: string, range: StatsRange) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString(
    locale,
    range === 365
      ? { month: 'short', timeZone: 'UTC' }
      : { day: 'numeric', month: 'numeric', timeZone: 'UTC' }
  );

export const dayLong = (day: string, locale: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });

/** Mo, Di … (0 = Monday). */
export const weekdayShort = (index: number, locale: string) =>
  new Date(Date.UTC(2024, 0, 1 + index)).toLocaleDateString(locale, {
    weekday: 'short',
    timeZone: 'UTC',
  });

/** Days of a year as weeks: sums per week (year charts stay readable on a phone). */
export const groupWeeks = <T extends { day: string }>(
  days: T[],
  sum: (items: T[]) => Omit<T, 'day'>
): T[] => {
  const weeks: T[][] = [];
  days.forEach((item, index) => {
    if (index % 7 === 0) weeks.push([]);
    weeks[weeks.length - 1].push(item);
  });
  return weeks.map(items => ({ ...sum(items), day: items[0].day }) as T);
};

const PLATFORM: Record<string, string> = {
  iphone: 'iPhone',
  ipad: 'iPad',
  android: 'Android',
  android_tablet: 'Android-Tablet',
  mac: 'Mac',
  windows: 'Windows',
  linux: 'Linux',
  chromeos: 'ChromeOS',
};

export const platformLabel = (platform: string, t: TFunction) =>
  PLATFORM[platform] ?? t('stats.unknown');

/** Source key → label (known keys translated, `invite` etc. as they are). */
export const sourceLabel = (source: string, t: TFunction) =>
  t(`stats.source.${source}`, { defaultValue: source });

export const appLabel = (app: string, t: TFunction) =>
  t(`stats.app.${app}`, { defaultValue: app.charAt(0).toUpperCase() + app.slice(1) });

export const deviceLabel = (device: string, t: TFunction) =>
  t(`stats.device.${device}`, { defaultValue: device });
