import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@ui/lib/utils';
import { AppDrawer } from '@ui/patterns/drawer';
import { AnimatedCalendarStandalone } from '@ui/shad-cn/components/calender';
import { Button } from '@ui/shad-cn/components/button';

export interface DatePickerProps {
  value?: Date;
  onChange?: (value: Date | undefined) => void;
  /** Titel des Drawers mit dem Kalender. Vom Aufrufer übersetzt. */
  title: string;
  /** Text im Auslöser, solange kein Datum gewählt ist. Vom Aufrufer übersetzt. */
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const formatDate = (date: Date) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);

/**
 * Datumsauswahl: Auslöser-Button plus Kalender im Drawer (Design-Anweisung 7.2, nie Popover auf dem Handy).
 */
export function DatePicker({ value, onChange, title, placeholder, disabled, minDate, maxDate, className }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        fullWidth
        disabled={disabled}
        className={cn('justify-start font-normal', className)}
        onClick={() => setOpen(true)}
      >
        <CalendarIcon className="size-4 shrink-0" aria-hidden />
        <span className={cn('truncate', !value && 'text-muted-foreground')}>
          {value ? formatDate(value) : placeholder}
        </span>
      </Button>
      <AppDrawer open={open} onOpenChange={setOpen} title={title} size="auto">
        <AnimatedCalendarStandalone
          mode="single"
          value={value}
          minDate={minDate}
          maxDate={maxDate}
          onChange={(next: Date | undefined) => {
            onChange?.(next);
            setOpen(false);
          }}
        />
      </AppDrawer>
    </>
  );
}
