import { cn } from '@ui/lib/utils';
import { type KeyboardEvent, useLayoutEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { DateTimeHourCycle } from '../types';

export interface DateTimeTimeProps {
  value: Date;
  onChange: (date: Date) => void;
  locale: string;
  hourCycle: DateTimeHourCycle;
  minuteStep?: number;
  className?: string;
  /** Column height (CSS). */
  height?: string;
}

interface ColumnOption {
  value: number;
  label: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

function TimeColumn({
  label,
  options,
  selected,
  onSelect,
  height,
}: {
  label: string;
  options: ColumnOption[];
  selected: number;
  onSelect: (value: number) => void;
  height: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Keep the selected entry centered without scrolling the page/popover.
  useLayoutEffect(() => {
    const column = ref.current;
    const item = column?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!column || !item) return;
    column.scrollTo({
      top: item.offsetTop - column.clientHeight / 2 + item.offsetHeight / 2,
      behavior: column.dataset.ready ? 'smooth' : 'auto',
    });
    column.dataset.ready = 'true';
  }, [selected]);

  const onKeyDown = (event: KeyboardEvent) => {
    const index = options.findIndex(o => o.value === selected);
    const delta = { ArrowUp: -1, ArrowDown: 1 }[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    const next = options[(index + delta + options.length) % options.length];
    onSelect(next.value);
    requestAnimationFrame(() =>
      ref.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus()
    );
  };

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="relative flex w-14 shrink-0 flex-col gap-0.5 overflow-y-auto overscroll-contain px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ height }}
    >
      {options.map(option => {
        const isSelected = option.value === selected;
        return (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(option.value)}
            className={cn(
              'flex h-8 shrink-0 items-center justify-center rounded-md text-sm tabular-nums transition-colors hover:bg-accent',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none pointer-coarse:h-10',
              isSelected && 'bg-primary font-medium text-primary-foreground hover:bg-primary/90'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Scrollable hour / minute (/ AM-PM) columns. */
export function DateTimeTime({
  value,
  onChange,
  locale,
  hourCycle,
  minuteStep = 5,
  className,
  height = '17.75rem',
}: DateTimeTimeProps) {
  const { t } = useTranslation('editor');
  const hours = value.getHours();
  const minutes = value.getMinutes();
  const h12 = hourCycle === 'h12';
  const pm = hours >= 12;

  const periods = useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true });
    const period = (h: number) =>
      format.formatToParts(new Date(2000, 0, 1, h)).find(p => p.type === 'dayPeriod')?.value ??
      (h < 12 ? 'AM' : 'PM');
    return [
      { value: 0, label: period(9) },
      { value: 1, label: period(21) },
    ];
  }, [locale]);

  const hourOptions: ColumnOption[] = h12
    ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(h => ({ value: h % 12, label: String(h) }))
    : Array.from({ length: 24 }, (_, h) => ({ value: h, label: pad(h) }));

  const minuteValues = new Set<number>();
  for (let m = 0; m < 60; m += Math.max(1, minuteStep)) minuteValues.add(m);
  minuteValues.add(minutes); // keep an off-step value selectable
  const minuteOptions = [...minuteValues]
    .sort((a, b) => a - b)
    .map(m => ({ value: m, label: pad(m) }));

  const set = (h: number, m: number) => {
    const next = new Date(value);
    next.setHours(h, m, 0, 0);
    onChange(next);
  };

  return (
    <div className={cn('flex justify-center gap-1', className)}>
      <TimeColumn
        label={t('datetime.hours')}
        options={hourOptions}
        selected={h12 ? hours % 12 : hours}
        onSelect={h => set(h12 ? h + (pm ? 12 : 0) : h, minutes)}
        height={height}
      />
      <TimeColumn
        label={t('datetime.minutes')}
        options={minuteOptions}
        selected={minutes}
        onSelect={m => set(hours, m)}
        height={height}
      />
      {h12 && (
        <TimeColumn
          label={t('datetime.period')}
          options={periods}
          selected={pm ? 1 : 0}
          onSelect={p => set((hours % 12) + (p ? 12 : 0), minutes)}
          height={height}
        />
      )}
    </div>
  );
}
