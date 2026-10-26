import type { DateTimeHourCycle, DateTimeMode, WeekDay } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

export const addDays = (d: Date, days: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + days, d.getHours(), d.getMinutes());

/** Adds months, clamping the day (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(d: Date, months: number): Date {
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1, d.getHours(), d.getMinutes());
  target.setDate(Math.min(d.getDate(), daysInMonth(target.getFullYear(), target.getMonth())));
  return target;
}

export const isSameDay = (a?: Date | null, b?: Date | null) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Day comparison ignoring the time: <0, 0, >0. */
export const compareDay = (a: Date, b: Date) => startOfDay(a).getTime() - startOfDay(b).getTime();

export function isDayDisabled(day: Date, min?: Date, max?: Date): boolean {
  return (!!min && compareDay(day, min) < 0) || (!!max && compareDay(day, max) > 0);
}

export function clampDate(date: Date, min?: Date, max?: Date): Date {
  if (min && date < min) return new Date(min);
  if (max && date > max) return new Date(max);
  return date;
}

export const startOfWeek = (d: Date, weekStartsOn: WeekDay) =>
  addDays(startOfDay(d), -((d.getDay() - weekStartsOn + 7) % 7));

/** 6 weeks (42 days) covering the given month. */
export function monthGrid(year: number, month: number, weekStartsOn: WeekDay): Date[] {
  const first = startOfWeek(new Date(year, month, 1), weekStartsOn);
  return Array.from({ length: 42 }, (_, i) => addDays(first, i));
}

export function roundToStep(date: Date, step: number): Date {
  const result = new Date(date);
  result.setSeconds(0, 0);
  result.setMinutes(Math.round(result.getMinutes() / step) * step);
  return result;
}

export function defaultWeekStart(locale: string): WeekDay {
  try {
    const intl = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const firstDay = intl.getWeekInfo?.().firstDay ?? intl.weekInfo?.firstDay;
    if (firstDay) return (firstDay % 7) as WeekDay;
  } catch {
    // unknown locale
  }
  return /^en(-US|-CA)?$/i.test(locale) ? 0 : 1;
}

export function defaultHourCycle(locale: string): DateTimeHourCycle {
  try {
    const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle;
    return cycle === 'h11' || cycle === 'h12' ? 'h12' : 'h23';
  } catch {
    return 'h23';
  }
}

/** Machine-readable value for `<time datetime>` (local time, no zone). */
export function toIsoValue(date: Date, mode: DateTimeMode): string {
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (mode === 'date') return day;
  if (mode === 'time') return time;
  return `${day}T${time}`;
}

/** Parses `YYYY-MM-DD`, `HH:mm` or `YYYY-MM-DDTHH:mm[:ss][zone]`. */
export function parseIsoValue(value?: string | null): { date: Date; mode: DateTimeMode } | null {
  if (!value) return null;
  const v = value.trim();

  let m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return { date: new Date(+m[1], +m[2] - 1, +m[3]), mode: 'date' };

  m = v.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
  if (m) {
    const date = startOfDay(new Date());
    date.setHours(+m[1], +m[2]);
    return { date, mode: 'time' };
  }

  m = v.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/);
  if (m) return { date: new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]), mode: 'datetime' };

  const date = new Date(v); // with time zone
  return Number.isNaN(date.getTime()) ? null : { date, mode: 'datetime' };
}

export interface FormatDateTimeOptions {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'medium' | 'short';
  hourCycle?: DateTimeHourCycle;
}

export function formatDateTime(
  date: Date,
  mode: DateTimeMode,
  locale: string,
  { dateStyle = 'long', timeStyle = 'short', hourCycle }: FormatDateTimeOptions = {}
): string {
  const hour12 = hourCycle ? hourCycle === 'h12' : undefined;
  const options: Intl.DateTimeFormatOptions =
    mode === 'date'
      ? { dateStyle }
      : mode === 'time'
        ? { timeStyle, hour12 }
        : { dateStyle, timeStyle, hour12 };
  return new Intl.DateTimeFormat(locale, options).format(date);
}
