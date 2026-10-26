import { cn } from '@ui/lib/utils';
import { useTranslation } from 'react-i18next';

import type { DateTimePickerProps } from '../types';
import { clampDate, defaultHourCycle, defaultWeekStart, roundToStep, startOfDay } from '../utils';
import { DateTimeCalendar } from './DateTimeCalendar';
import { DateTimeTime } from './DateTimeTime';

export function DateTimePicker({
  value,
  onChange,
  mode = 'datetime',
  min,
  max,
  minuteStep = 5,
  weekStartsOn,
  hourCycle,
  locale,
  showToday = true,
  defaultViewDate,
  className,
}: DateTimePickerProps) {
  const { t, i18n } = useTranslation('editor');
  const lang = locale ?? i18n.resolvedLanguage ?? i18n.language ?? 'de';
  const base = value ?? roundToStep(new Date(), minuteStep);
  const showDate = mode !== 'time';
  const showTime = mode !== 'date';

  const emit = (date: Date) => onChange(clampDate(date, min, max));

  const selectDay = (day: Date) =>
    emit(
      new Date(day.getFullYear(), day.getMonth(), day.getDate(), base.getHours(), base.getMinutes())
    );

  const selectNow = () => {
    const now = roundToStep(new Date(), minuteStep);
    if (mode === 'date')
      emit(new Date(startOfDay(now).setHours(base.getHours(), base.getMinutes())));
    else if (mode === 'time')
      emit(new Date(new Date(base).setHours(now.getHours(), now.getMinutes(), 0, 0)));
    else emit(now);
  };

  return (
    <div
      data-html-editor-ui=""
      className={cn('flex flex-col gap-2 text-popover-foreground', className)}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        {showDate && (
          <DateTimeCalendar
            value={value ?? null}
            defaultViewDate={defaultViewDate}
            onSelect={selectDay}
            locale={lang}
            weekStartsOn={weekStartsOn ?? defaultWeekStart(lang)}
            min={min}
            max={max}
          />
        )}
        {showDate && showTime && <div className="h-px bg-border sm:h-auto sm:w-px" />}
        {showTime && (
          <DateTimeTime
            value={base}
            onChange={emit}
            locale={lang}
            hourCycle={hourCycle ?? defaultHourCycle(lang)}
            minuteStep={minuteStep}
            // Stacked on phones: shorter columns below the calendar.
            height={showDate ? 'var(--datetime-time-height)' : '12rem'}
            className="[--datetime-time-height:10rem] sm:[--datetime-time-height:17.75rem]"
          />
        )}
      </div>
      {showToday && (
        <button
          type="button"
          onClick={selectNow}
          className="self-start rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none pointer-coarse:py-2"
        >
          {mode === 'date' ? t('datetime.today') : t('datetime.now')}
        </button>
      )}
    </div>
  );
}
