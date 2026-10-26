import { DateTimePicker, formatDateTime } from '@core/editor/datetime';
import { cn } from '@ui/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/shad-cn/components/popover.tsx';
import { useIsMobile } from '@ui/shad-cn/hooks/use-mobile';
import { CalendarDays, ChevronDown, Clock, X } from 'lucide-react';
import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type DateTimeSelectorMode, getAge, toDate, toISODateString } from './utils';

/**
 * How the calendar opens from 768px on (phones always use the bottom sheet):
 * - `popover`: anchored below the field (default).
 * - `drawer`: side panel from the right, full height.
 */
export type DateTimeSelectorPresentation = 'popover' | 'drawer';

export interface IDateTimeSelectorProps {
  /** Date, 'YYYY-MM-DD' or ISO string. `null`/'' = empty. */
  value?: Date | string | null;
  /** Called when a value is chosen (and with `null` on "Clear"). */
  onChange?: (value: Date | null) => void;
  mode?: DateTimeSelectorMode;
  /** Desktop: `popover` (default) or `drawer` from the right. Phones: always bottom sheet. */
  presentation?: DateTimeSelectorPresentation;
  min?: Date | string | null;
  max?: Date | string | null;
  /** Month the calendar opens on when there is no value yet (e.g. 1.1.2000 for birthdays). */
  defaultViewDate?: Date | string;
  /** Minute steps in the time column. Default: 5 */
  minuteStep?: number;
  /** Shows "35 Jahre" next to the value – for birthdays. */
  showAge?: boolean;
  clearable?: boolean;
  /** "Today"/"Now" shortcut inside the picker. Default: true */
  showToday?: boolean;
  placeholder?: string;
  /** Heading inside the sheet/popover. */
  title?: string;
  disabled?: boolean;
  invalid?: boolean;
  /** Defaults to the current i18n language. */
  locale?: string;
  id?: string;
  /** Renders a hidden input ('YYYY-MM-DD' / ISO) for native form posts. */
  name?: string;
  className?: string;
  onOpenChange?: (open: boolean) => void;
  /** Fired when the picker closes – e.g. for Formik `setFieldTouched`. */
  onBlur?: () => void;
}

/**
 * Mobile first form field around the editor's `DateTimePicker` (same calendar + time columns).
 * Phones: swipeable bottom sheet. ≥768px: popover or drawer from the right (`presentation`).
 * `date`: tapping a day selects and closes. `time` / `datetime`: confirm with "Done".
 */
export const DateTimeSelector: React.FC<IDateTimeSelectorProps> = ({
  value,
  onChange,
  mode = 'date',
  presentation = 'popover',
  min,
  max,
  defaultViewDate,
  minuteStep = 5,
  showAge = false,
  clearable = false,
  showToday = true,
  placeholder,
  title,
  disabled = false,
  invalid = false,
  locale: localeProp,
  id,
  name,
  className,
  onOpenChange,
  onBlur,
}) => {
  const { t, i18n } = useTranslation('base');
  const locale = localeProp || i18n.resolvedLanguage || i18n.language || 'en';
  const isMobile = useIsMobile();
  const sheet = isMobile;
  const sideDrawer = !isMobile && presentation === 'drawer';
  const autoId = useId();
  const triggerId = id ?? `dts-${autoId}`;

  const selected = toDate(value);
  const minDate = toDate(min) ?? undefined;
  const maxDate = toDate(max) ?? undefined;
  const viewDate = toDate(defaultViewDate) ?? undefined;
  const instant = mode === 'date';

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date | null>(null);

  const setOpenState = (next: boolean) => {
    if (next) setDraft(selected);
    setOpen(next);
    onOpenChange?.(next);
    if (!next) onBlur?.();
  };

  const emit = (date: Date | null) => {
    onChange?.(
      date && mode === 'date' ? new Date(date.getFullYear(), date.getMonth(), date.getDate()) : date
    );
    setOpenState(false);
  };

  const handlePick = (date: Date) => {
    if (instant) emit(date);
    else setDraft(date);
  };

  // ---- Texts --------------------------------------------------------------
  const displayValue = selected ? formatDateTime(selected, mode, locale) : null;
  const age = showAge && selected && mode !== 'time' ? getAge(selected) : null;
  const preview = draft ?? selected;
  const previewAge = showAge && preview && mode !== 'time' ? getAge(preview) : null;
  const heading = title ?? t(`dateTimeSelector.placeholder.${mode}`);
  const Icon = mode === 'time' ? Clock : CalendarDays;
  const hiddenValue = selected
    ? mode === 'date'
      ? toISODateString(selected)
      : selected.toISOString()
    : '';

  // ---- Panel (shared by sheet and popover) -------------------------------
  const secondaryButton =
    'h-11 shrink-0 sm:flex-1 rounded-full border border-border/50 text-body font-bold text-foreground transition-colors hover:bg-foreground/[0.05]';

  const panel = (
    <div className="flex flex-col">
      <div className="px-4 pb-3 text-center">
        <p
          className={cn(
            'text-title leading-6 font-bold tabular-nums',
            preview ? 'text-foreground' : 'text-muted-foreground'
          )}
          aria-live="polite"
        >
          {preview ? formatDateTime(preview, mode, locale) : heading}
        </p>
        {previewAge !== null && (
          <p className="text-caption text-muted-foreground">
            {t('dateTimeSelector.age', { count: previewAge })}
          </p>
        )}
      </div>

      <div className="flex justify-center border-y border-border/50 px-3 py-3">
        <DateTimePicker
          value={draft}
          onChange={handlePick}
          mode={mode}
          min={minDate}
          max={maxDate}
          defaultViewDate={viewDate}
          minuteStep={minuteStep}
          locale={locale}
          showToday={showToday}
        />
      </div>

      <div className="flex flex-col gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row-reverse">
        {!instant && (
          <button
            type="button"
            onClick={() => emit(draft)}
            disabled={!draft}
            className="h-11 shrink-0 sm:flex-1 rounded-full bg-foreground text-body font-bold text-background transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-40"
          >
            {t('dateTimeSelector.done')}
          </button>
        )}
        {clearable && selected && (
          <button type="button" onClick={() => emit(null)} className={secondaryButton}>
            {t('dateTimeSelector.clear')}
          </button>
        )}
        <button type="button" onClick={() => setOpenState(false)} className={secondaryButton}>
          {t('dateTimeSelector.cancel')}
        </button>
      </div>
    </div>
  );

  // ---- Trigger ------------------------------------------------------------
  const trigger = (
    <button
      type="button"
      id={triggerId}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      aria-haspopup="dialog"
      aria-expanded={open}
      // Popover opens itself through PopoverTrigger – sheet / side drawer open here.
      onClick={sheet || sideDrawer ? () => setOpenState(true) : undefined}
      className={cn(
        'group flex h-12 w-full items-center gap-3 rounded-xl border border-input bg-transparent px-3.5 text-left text-base transition-colors outline-none',
        'hover:border-foreground/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        open && 'border-foreground/40',
        className
      )}
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className={cn('min-w-0 flex-1 truncate', !displayValue && 'text-muted-foreground')}>
        {displayValue ?? placeholder ?? t(`dateTimeSelector.placeholder.${mode}`)}
      </span>
      {age !== null && (
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {t('dateTimeSelector.age', { count: age })}
        </span>
      )}
      <ChevronDown
        className={cn(
          'size-4 shrink-0 text-muted-foreground transition-transform',
          open && 'rotate-180'
        )}
        aria-hidden="true"
      />
    </button>
  );

  return (
    <>
      {name && <input type="hidden" name={name} value={hiddenValue} />}

      {sideDrawer ? (
        <>
          {trigger}
          <Drawer open={open} onOpenChange={next => setOpenState(next)} swipeDirection="right">
            <DrawerContent className="[--drawer-content-width:26rem]">
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
                  <DrawerTitle className="min-w-0 flex-1 truncate text-body font-bold text-foreground">
                    {heading}
                  </DrawerTitle>
                  <DrawerDescription className="sr-only">{heading}</DrawerDescription>
                  <button
                    type="button"
                    onClick={() => setOpenState(false)}
                    aria-label={t('dateTimeSelector.cancel')}
                    className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pt-4">
                  {panel}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </>
      ) : sheet ? (
        <>
          {trigger}
          <Drawer open={open} onOpenChange={next => setOpenState(next)} showSwipeHandle>
            <DrawerContent>
              <div className="px-4 pt-2 pb-1 text-center">
                <DrawerTitle className="text-caption font-medium text-muted-foreground">
                  {heading}
                </DrawerTitle>
                <DrawerDescription className="sr-only">{heading}</DrawerDescription>
              </div>
              <div className="min-h-0 overflow-y-auto overscroll-contain">{panel}</div>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <Popover open={open} onOpenChange={setOpenState}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={8}
            className={cn('w-auto max-w-[calc(100vw-2rem)] rounded-2xl p-0 pt-4', {
              'w-64': mode === 'time',
            })}
            aria-label={heading}
          >
            {panel}
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};
