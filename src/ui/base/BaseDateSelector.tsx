import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/shad-cn/components/select.tsx';
import { X } from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/** Days of a month (`month` 1–12) – leap years included (Feb 29 only in leap years). */
export const daysInMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

/** `YYYY-MM-DD` → parts, `null` for empty / invalid values. */
const parse = (value: string | null | undefined) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
};

const pad = (value: number) => String(value).padStart(2, '0');

export interface IBaseDateSelectorProps {
  /** `YYYY-MM-DD` or empty. */
  value: string | null | undefined;
  /** Complete date as `YYYY-MM-DD`, `null` while incomplete / cleared. */
  onChange: (value: string | null) => void;
  /** Default: 100 years back. */
  minYear?: number;
  /** Default: current year. */
  maxYear?: number;
  disabled?: boolean;
  invalid?: boolean;
  /** Shows an X button that clears the date. */
  clearable?: boolean;
  /** Portal target of the lists (default: the surrounding drawer / dialog, else body). */
  container?: HTMLElement | null;
  id?: string;
  className?: string;
}

/**
 * Date selector with three shadcn selects (year · month · day). The day list always fits the
 * chosen month (28/29 days in February depending on the leap year, 30/31 otherwise); a day
 * that no longer exists is moved to the last day of the month. Mobile friendly: big triggers,
 * native-like scrolling lists.
 */
export const BaseDateSelector: React.FC<IBaseDateSelectorProps> = ({
  value,
  onChange,
  minYear,
  maxYear,
  disabled,
  invalid,
  clearable,
  container,
  id,
  className,
}) => {
  const { t, i18n } = useTranslation('base');
  const parsed = parse(value);
  // Parts chosen so far – a date is only reported once all three are set.
  const [draft, setDraft] = useState<{ year?: number; month?: number; day?: number }>(parsed ?? {});
  // Last value seen ('' and null both mean "no date" – an incomplete draft must survive that).
  const [lastValue, setLastValue] = useState<string | null>(value || null);
  if ((value || null) !== lastValue) {
    // Changed from outside (reset / clear) → follow it.
    setLastValue(value || null);
    setDraft(parse(value) ?? {});
  }
  // Inside a drawer the list must be portaled into the drawer (its focus trap / pointer lock).
  const root = useRef<HTMLDivElement>(null);
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  const onOpenChange = (open: boolean) => {
    if (!open) return;
    setPortal(
      container ??
        root.current?.closest<HTMLElement>('[data-slot="drawer-popup"], [role="dialog"]') ??
        null
    );
  };

  const now = new Date().getFullYear();
  const max = maxYear ?? now;
  const min = minYear ?? max - 100;
  const years = useMemo(
    () => Array.from({ length: Math.max(0, max - min + 1) }, (_, index) => max - index),
    [min, max]
  );
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) =>
        new Date(Date.UTC(2024, index, 1)).toLocaleDateString(i18n.language, {
          month: 'long',
          timeZone: 'UTC',
        })
      ),
    [i18n.language]
  );
  // Without a year, February offers 29 days (corrected as soon as the year is known).
  const dayCount = draft.month ? daysInMonth(draft.year ?? 2024, draft.month) : 31;

  const update = (next: { year?: number; month?: number; day?: number }) => {
    const merged = { ...draft, ...next };
    if (merged.month && merged.day) {
      merged.day = Math.min(merged.day, daysInMonth(merged.year ?? 2024, merged.month));
    }
    setDraft(merged);
    const complete =
      merged.year && merged.month && merged.day
        ? `${merged.year}-${pad(merged.month)}-${pad(merged.day)}`
        : null;
    setLastValue(complete);
    onChange(complete);
  };

  const trigger = 'h-11 w-full min-w-0 rounded-lg text-base md:text-base';

  return (
    <div
      ref={root}
      id={id}
      role="group"
      aria-invalid={invalid || undefined}
      className={cn('flex items-center gap-2', className)}
    >
      <div className="grid min-w-0 flex-1 grid-cols-[1fr_1.4fr_1fr] gap-2">
        <Select
          value={draft.year ? String(draft.year) : ''}
          onValueChange={year => update({ year: Number(year) })}
          disabled={disabled}
          onOpenChange={onOpenChange}
        >
          <SelectTrigger
            className={trigger}
            aria-label={t('dateSelector.year')}
            aria-invalid={invalid}
          >
            <SelectValue placeholder={t('dateSelector.year')} />
          </SelectTrigger>
          <SelectContent container={portal} className="max-h-72">
            {years.map(year => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={draft.month ? String(draft.month) : ''}
          onValueChange={month => update({ month: Number(month) })}
          disabled={disabled}
          onOpenChange={onOpenChange}
        >
          <SelectTrigger
            className={trigger}
            aria-label={t('dateSelector.month')}
            aria-invalid={invalid}
          >
            <SelectValue placeholder={t('dateSelector.month')} />
          </SelectTrigger>
          <SelectContent container={portal} className="max-h-72">
            {months.map((name, index) => (
              <SelectItem key={name} value={String(index + 1)}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={draft.day ? String(draft.day) : ''}
          onValueChange={day => update({ day: Number(day) })}
          disabled={disabled}
          onOpenChange={onOpenChange}
        >
          <SelectTrigger
            className={trigger}
            aria-label={t('dateSelector.day')}
            aria-invalid={invalid}
          >
            <SelectValue placeholder={t('dateSelector.day')} />
          </SelectTrigger>
          <SelectContent container={portal} className="max-h-72">
            {Array.from({ length: dayCount }, (_, index) => index + 1).map(day => (
              <SelectItem key={day} value={String(day)}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {clearable && (draft.year || draft.month || draft.day) && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xl"
          pill
          disabled={disabled}
          aria-label={t('dateTimeSelector.clear')}
          onClick={() => update({ year: undefined, month: undefined, day: undefined })}
        >
          <X />
        </Button>
      )}
    </div>
  );
};
