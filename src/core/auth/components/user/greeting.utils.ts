import { Coffee, Moon, Sparkles, Sun, Sunrise, Sunset } from 'lucide-react';
import { useEffect, useState } from 'react';

export type GreetingSlot = 'night' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'late';

export const GREETING_SLOT_ICONS: Record<GreetingSlot, typeof Sun> = {
  night: Moon,
  morning: Sunrise,
  noon: Coffee,
  afternoon: Sun,
  evening: Sunset,
  late: Sparkles,
};

/** Daytime slot of an hour (0–23). */
export const getGreetingSlot = (hour: number): GreetingSlot => {
  if (hour < 5) return 'night';
  if (hour < 11) return 'morning';
  if (hour < 14) return 'noon';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'late';
};

/** Display name of a user: alias, otherwise the part before the @ of the e-mail. */
export const getUserDisplayName = (alias?: string | null, email?: string | null) =>
  alias?.trim() || email?.split('@')[0] || '';

const VARIANTS_PER_SLOT = 3;

/** Same variant during the whole day/slot – changes from day to day. */
export const pickGreetingVariant = (date: Date, slot: GreetingSlot) => {
  const day = Math.floor(date.getTime() / 86_400_000);
  const seed = [...slot].reduce((sum, char) => sum + char.charCodeAt(0), day);
  return seed % VARIANTS_PER_SLOT;
};

export const toGreetingDate = (value: unknown): Date | null => {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number' || typeof value === 'string') {
    const date = new Date(typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
};

export const formatRelativeTime = (date: Date, now: Date, locale: string) => {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(0, 'minute');
};

/** Current time, refreshed every minute (aligned to the full minute). */
export const useGreetingNow = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let interval: number | undefined;
    const timeout = window.setTimeout(
      () => {
        setNow(new Date());
        interval = window.setInterval(() => setNow(new Date()), 60_000);
      },
      60_000 - (Date.now() % 60_000)
    );
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);
  return now;
};

/** Daylight phase (6–18 h) or night, with progress 0…1 across the arc. */
export const getSkyPosition = (date: Date) => {
  const hours = date.getHours() + date.getMinutes() / 60;
  const day = hours >= 6 && hours < 18;
  const progress = day ? (hours - 6) / 12 : ((hours + 24 - 18) % 24) / 12;
  return { day, progress: Math.min(1, Math.max(0, progress)) };
};

/** Emoji per weekday, index = `Date.getDay()` (0 = Sunday). */
const WEEKDAY_EMOJIS = ['🛋️', '☕', '💪', '⛰️', '🚀', '🎉', '😎'] as const;

/** Fixed special days (`MM-DD`) – override the weekday emoji. */
const SPECIAL_DAY_EMOJIS: Record<string, string> = {
  '01-01': '🎆',
  '02-14': '❤️',
  '10-31': '🎃',
  '12-06': '🎅',
  '12-24': '🎄',
  '12-25': '🎄',
  '12-26': '🎄',
  '12-31': '🥂',
};

/** Emoji for the current day: special day (New Year, Halloween, Christmas …) or weekday. */
export const getDayEmoji = (date: Date): string => {
  const key = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return SPECIAL_DAY_EMOJIS[key] ?? WEEKDAY_EMOJIS[date.getDay()];
};

/** ISO 8601 calendar week (1–53), Monday = first day of the week. */
export const getIsoWeek = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
};

/** Share of the day that has passed, 0…1 (00:00 → 24:00). */
export const getDayProgress = (date: Date): number =>
  (date.getHours() * 60 + date.getMinutes()) / (24 * 60);

/** Nationwide public holidays in Germany (state holidays are not included). */
export type HolidayKey =
  | 'newYear'
  | 'goodFriday'
  | 'easterMonday'
  | 'labourDay'
  | 'ascension'
  | 'whitMonday'
  | 'germanUnity'
  | 'christmas'
  | 'boxingDay';

export interface IHoliday {
  key: HolidayKey;
  /** Local midnight of the holiday. */
  date: Date;
}

/** Easter Sunday (Gregorian calendar, anonymous algorithm). */
const getEasterSunday = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};

/** All nationwide German holidays of a year, sorted by date. */
export const getHolidays = (year: number): IHoliday[] => {
  const easter = getEasterSunday(year);
  const fromEaster = (days: number) =>
    new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + days);
  const holidays: IHoliday[] = [
    { key: 'newYear', date: new Date(year, 0, 1) },
    { key: 'goodFriday', date: fromEaster(-2) },
    { key: 'easterMonday', date: fromEaster(1) },
    { key: 'labourDay', date: new Date(year, 4, 1) },
    { key: 'ascension', date: fromEaster(39) },
    { key: 'whitMonday', date: fromEaster(50) },
    { key: 'germanUnity', date: new Date(year, 9, 3) },
    { key: 'christmas', date: new Date(year, 11, 25) },
    { key: 'boxingDay', date: new Date(year, 11, 26) },
  ];
  return holidays.sort((x, y) => x.date.getTime() - y.date.getTime());
};

/** Next holiday from today on (today counts) and the number of calendar days until it. */
export const getNextHoliday = (now: Date): IHoliday & { days: number } => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const year = today.getFullYear();
  const next = [...getHolidays(year), ...getHolidays(year + 1)].find(
    holiday => holiday.date.getTime() >= today.getTime()
  ) as IHoliday;
  // Round → days with a DST switch (23 h / 25 h) still count as one day.
  const days = Math.round((next.date.getTime() - today.getTime()) / 86_400_000);
  return { ...next, days };
};
