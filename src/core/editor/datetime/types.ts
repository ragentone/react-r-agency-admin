export type DateTimeMode = 'date' | 'time' | 'datetime';

export type DateTimeHourCycle = 'h12' | 'h23';

/** 0 = Sunday … 6 = Saturday */
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DateTimePickerProps {
  value?: Date | null;
  onChange: (date: Date) => void;
  /** Default: 'datetime' */
  mode?: DateTimeMode;
  min?: Date;
  max?: Date;
  /** Minute steps in the time column. Default: 5 */
  minuteStep?: number;
  /** First day of the week. Default: from the locale (Monday for de/ru). */
  weekStartsOn?: WeekDay;
  /** 12h with AM/PM or 24h. Default: from the locale. */
  hourCycle?: DateTimeHourCycle;
  /** BCP 47 locale. Default: current i18n language. */
  locale?: string;
  /** Show the "Today"/"Now" shortcut. Default: true */
  showToday?: boolean;
  /** Month the calendar opens on while there is no value (e.g. 1.1.2000 for birthdays). */
  defaultViewDate?: Date;
  className?: string;
}
