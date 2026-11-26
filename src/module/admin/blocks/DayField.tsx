import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { AnimatedCalendarStandalone } from '@ui/shad-cn/components/calender';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/shad-cn/components/popover';
import { CalendarIcon, X } from 'lucide-react';
import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LABEL = 'mb-1.5 block text-caption font-medium text-foreground';
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

const parse = (value: string): Date | undefined => {
  const m = ISO_DAY.exec(value);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : undefined;
};

const toIso = (date: Date): string =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, i) => String(part).padStart(i ? 2 : 4, '0'))
    .join('-');

interface IProps {
  label: string;
  hint?: string;
  /** `YYYY-MM-DD`; older free text ("März 2025") shows as empty until a day is picked. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/** Date picker (shadcn calendar in a popover) – stores the day as `YYYY-MM-DD`, no time zone. */
export const DayField: React.FC<IProps> = ({ label, hint, value, onChange, disabled }) => {
  const { t, i18n } = useTranslation('admin');
  const id = useId();
  const [open, setOpen] = useState(false);
  const date = parse(value);
  const legacy = Boolean(value) && !date;
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant="outline"
              size="lg"
              fullWidth
              disabled={disabled}
              className="justify-start font-normal"
            >
              <CalendarIcon className="size-4 shrink-0" aria-hidden />
              <span className={cn('truncate', !date && 'text-muted-foreground')}>
                {date
                  ? new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(date)
                  : t('blocks.timeline.datePlaceholder')}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto rounded-xl border-border/50 p-0">
            <AnimatedCalendarStandalone
              mode="single"
              value={date}
              onChange={(next: Date | undefined) => {
                onChange(next ? toIso(next) : '');
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={disabled}
            aria-label={t('blocks.timeline.dateClear')}
            className="grid size-11 shrink-0 place-items-center rounded-xl hover:bg-foreground/10"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {legacy && (
        <p className="mt-1 text-caption text-muted-foreground">
          {t('blocks.timeline.dateLegacy', { value })}
        </p>
      )}
      {hint && <p className="mt-1 text-caption text-muted-foreground">{hint}</p>}
    </div>
  );
};
