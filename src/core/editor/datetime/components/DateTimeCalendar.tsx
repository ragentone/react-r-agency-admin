import { cn } from '@ui/lib/utils';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { WeekDay } from '../types';
import {
  addDays,
  addMonths,
  isDayDisabled,
  isSameDay,
  monthGrid,
  startOfDay,
  startOfWeek,
  toIsoValue,
} from '../utils';

type CalendarView = 'days' | 'months' | 'years';

export interface DateTimeCalendarProps {
  value: Date | null;
  /** Month shown initially while `value` is empty. */
  defaultViewDate?: Date;
  onSelect: (day: Date) => void;
  locale: string;
  weekStartsOn: WeekDay;
  min?: Date;
  max?: Date;
  className?: string;
}

const cellBase =
  'flex items-center justify-center rounded-md text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30';

export function DateTimeCalendar({
  value,
  defaultViewDate,
  onSelect,
  locale,
  weekStartsOn,
  min,
  max,
  className,
}: DateTimeCalendarProps) {
  const { t } = useTranslation('editor');
  const [view, setView] = useState<CalendarView>('days');
  const [cursor, setCursor] = useState(() => startOfDay(value ?? defaultViewDate ?? new Date()));
  const [syncedValue, setSyncedValue] = useState(value?.getTime());
  const gridRef = useRef<HTMLDivElement>(null);
  const focusAfterRender = useRef(false);
  const today = startOfDay(new Date());

  // Follow external changes ("Today" button, edited <time> element).
  if (value?.getTime() !== syncedValue) {
    setSyncedValue(value?.getTime());
    if (value) setCursor(startOfDay(value));
  }

  useEffect(() => {
    if (!focusAfterRender.current) return;
    focusAfterRender.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus();
  }, [cursor, view]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const days = useMemo(() => monthGrid(year, month, weekStartsOn), [year, month, weekStartsOn]);

  const weekdays = useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    return days.slice(0, 7).map(day => format.format(day).replace(/\.$/, ''));
  }, [days, locale]);

  const monthNames = useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { month: 'short' });
    return Array.from({ length: 12 }, (_, m) =>
      format.format(new Date(2000, m, 1)).replace(/\.$/, '')
    );
  }, [locale]);

  const title =
    view === 'days'
      ? new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(cursor)
      : view === 'months'
        ? String(year)
        : `${year - (year % 12)} – ${year - (year % 12) + 11}`;

  const moveCursor = (next: Date, focus = false) => {
    focusAfterRender.current = focus;
    setCursor(startOfDay(next));
  };

  const step = (direction: -1 | 1) => {
    if (view === 'days') moveCursor(addMonths(cursor, direction));
    else if (view === 'months') moveCursor(addMonths(cursor, direction * 12));
    else moveCursor(addMonths(cursor, direction * 144));
  };

  const cycleView = () =>
    setView(v => (v === 'days' ? 'months' : v === 'months' ? 'years' : 'days'));

  const onDaysKeyDown = (event: KeyboardEvent) => {
    const keys: Record<string, () => Date> = {
      ArrowLeft: () => addDays(cursor, -1),
      ArrowRight: () => addDays(cursor, 1),
      ArrowUp: () => addDays(cursor, -7),
      ArrowDown: () => addDays(cursor, 7),
      PageUp: () => addMonths(cursor, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(cursor, event.shiftKey ? 12 : 1),
      Home: () => startOfWeek(cursor, weekStartsOn),
      End: () => addDays(startOfWeek(cursor, weekStartsOn), 6),
    };
    if (keys[event.key]) {
      event.preventDefault();
      moveCursor(keys[event.key](), true);
    }
  };

  const onGridKeyDown = (event: KeyboardEvent, count: number, columns: number) => {
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns }[
      event.key
    ];
    if (delta === undefined) return;
    event.preventDefault();
    const buttons = Array.from(
      gridRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []
    );
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    buttons[Math.min(count - 1, Math.max(0, index + delta))]?.focus();
  };

  const navButton =
    'flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none pointer-coarse:size-10';

  return (
    <div className={cn('flex w-[17.5rem] max-w-full flex-col gap-1', className)}>
      <div className="flex items-center justify-between gap-1">
        <button
          type="button"
          className={navButton}
          onClick={() => step(-1)}
          aria-label={t('datetime.previous')}
        >
          <ChevronLeftIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={cycleView}
          aria-label={t(
            view === 'days'
              ? 'datetime.chooseMonth'
              : view === 'months'
                ? 'datetime.chooseYear'
                : 'datetime.chooseDay'
          )}
          className="flex h-8 items-center gap-1 rounded-md px-2 text-sm font-medium capitalize transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none pointer-coarse:h-10"
        >
          <span aria-live="polite">{title}</span>
          <ChevronDownIcon
            className={cn(
              'size-3.5 opacity-60 transition-transform',
              view !== 'days' && 'rotate-180'
            )}
          />
        </button>
        <button
          type="button"
          className={navButton}
          onClick={() => step(1)}
          aria-label={t('datetime.next')}
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </div>

      {view === 'days' && (
        <div role="grid" aria-label={title} onKeyDown={onDaysKeyDown}>
          <div role="row" className="grid grid-cols-7">
            {weekdays.map(day => (
              <span
                key={day}
                role="columnheader"
                className="flex h-7 items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </span>
            ))}
          </div>
          <div ref={gridRef} className="grid grid-cols-7 gap-y-0.5">
            {days.map(day => {
              const selected = isSameDay(day, value);
              const outside = day.getMonth() !== month;
              const isToday = isSameDay(day, today);
              return (
                <button
                  key={toIsoValue(day, 'date')}
                  type="button"
                  role="gridcell"
                  tabIndex={isSameDay(day, cursor) ? 0 : -1}
                  aria-selected={selected}
                  aria-current={isToday ? 'date' : undefined}
                  aria-label={new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(day)}
                  disabled={isDayDisabled(day, min, max)}
                  onClick={() => {
                    moveCursor(day);
                    onSelect(day);
                  }}
                  className={cn(
                    cellBase,
                    'mx-auto size-9 tabular-nums hover:bg-accent pointer-coarse:size-10',
                    outside && 'text-muted-foreground/60',
                    isToday &&
                      !selected &&
                      'font-semibold text-primary underline decoration-2 underline-offset-4',
                    selected && 'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === 'months' && (
        <div
          ref={gridRef}
          className="grid grid-cols-3 gap-1 py-1"
          onKeyDown={event => onGridKeyDown(event, 12, 3)}
        >
          {monthNames.map((name, m) => {
            const first = new Date(year, m, 1);
            const last = new Date(year, m + 1, 0);
            const disabled = isDayDisabled(last, min) || isDayDisabled(first, undefined, max);
            const selected = !!value && value.getFullYear() === year && value.getMonth() === m;
            return (
              <button
                key={m}
                type="button"
                tabIndex={m === month ? 0 : -1}
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => {
                  focusAfterRender.current = true;
                  setCursor(new Date(year, m, Math.min(cursor.getDate(), last.getDate())));
                  setView('days');
                }}
                className={cn(
                  cellBase,
                  'h-14 capitalize hover:bg-accent',
                  m === month && !selected && 'bg-accent/60',
                  selected && 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}

      {view === 'years' && (
        <div
          ref={gridRef}
          className="grid grid-cols-3 gap-1 py-1"
          onKeyDown={event => onGridKeyDown(event, 12, 3)}
        >
          {Array.from({ length: 12 }, (_, i) => year - (year % 12) + i).map(y => {
            const disabled = (!!min && y < min.getFullYear()) || (!!max && y > max.getFullYear());
            const selected = value?.getFullYear() === y;
            return (
              <button
                key={y}
                type="button"
                tabIndex={y === year ? 0 : -1}
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => {
                  focusAfterRender.current = true;
                  setCursor(addMonths(cursor, (y - year) * 12));
                  setView('months');
                }}
                className={cn(
                  cellBase,
                  'h-14 tabular-nums hover:bg-accent',
                  y === year && !selected && 'bg-accent/60',
                  selected && 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
