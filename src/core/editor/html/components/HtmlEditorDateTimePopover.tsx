import type { Editor } from '@tiptap/react';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { CalendarClockIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type DateTimeMode,
  DateTimePicker,
  formatDateTime,
  parseIsoValue,
  roundToStep,
  toIsoValue,
} from '../../datetime';
import { ResponsivePopover } from '../../shared';
import type { HtmlEditorDateTimeOptions } from '../types';
import { HtmlEditorToolbarButton } from './HtmlEditorToolbarButton';

const ALL_MODES: DateTimeMode[] = ['date', 'time', 'datetime'];

interface HtmlEditorDateTimePopoverProps {
  editor: Editor;
  /** A `<time>` element is selected – the picker edits it instead of inserting. */
  active: boolean;
  disabled?: boolean;
  options?: HtmlEditorDateTimeOptions;
}

export function HtmlEditorDateTimePopover({
  editor,
  active,
  disabled,
  options = {},
}: HtmlEditorDateTimePopoverProps) {
  const { t, i18n } = useTranslation('editor');
  const locale = i18n.resolvedLanguage ?? i18n.language ?? 'de';
  const {
    modes = ALL_MODES,
    defaultMode,
    dateStyle,
    timeStyle,
    minuteStep = 5,
    ...pickerOptions
  } = options;
  const initialMode = defaultMode ?? (modes.includes('datetime') ? 'datetime' : modes[0]);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DateTimeMode>(initialMode);
  const [date, setDate] = useState<Date>(() => roundToStep(new Date(), minuteStep));

  const onOpenChange = (next: boolean) => {
    if (next) {
      const parsed = active ? parseIsoValue(editor.getAttributes('dateTime').datetime) : null;
      setMode(parsed && modes.includes(parsed.mode) ? parsed.mode : initialMode);
      setDate(parsed?.date ?? roundToStep(new Date(), minuteStep));
    }
    setOpen(next);
  };

  const text = formatDateTime(date, mode, locale, {
    dateStyle,
    timeStyle,
    hourCycle: pickerOptions.hourCycle,
  });

  const apply = () => {
    const attrs = { datetime: toIsoValue(date, mode), text };
    if (active) {
      editor.chain().focus().updateAttributes('dateTime', attrs).run();
    } else {
      editor
        .chain()
        .focus()
        .insertContent([
          { type: 'dateTime', attrs },
          { type: 'text', text: ' ' },
        ])
        .run();
    }
    setOpen(false);
  };

  const label = t(active ? 'html.dateTime.edit' : 'html.toolbar.dateTime');

  return (
    <ResponsivePopover
      open={open}
      onOpenChange={onOpenChange}
      title={label}
      popoverClassName="flex w-auto flex-col gap-3 p-3"
      sheetClassName="flex flex-col gap-3"
      trigger={
        <HtmlEditorToolbarButton label={label} active={active || open} disabled={disabled}>
          <CalendarClockIcon />
        </HtmlEditorToolbarButton>
      }
    >
      {({ sheet }) => (
        <>
          {modes.length > 1 && (
            <div role="tablist" className="flex rounded-md bg-muted p-0.5">
              {modes.map(value => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={mode === value}
                  onClick={() => setMode(value)}
                  className={cn(
                    'flex-1 rounded-[calc(var(--radius)-4px)] px-2 py-1 text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors pointer-coarse:py-2',
                    'focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none',
                    mode === value && 'bg-background text-foreground shadow-xs'
                  )}
                >
                  {t(`html.dateTime.modes.${value}`)}
                </button>
              ))}
            </div>
          )}

          <DateTimePicker
            {...pickerOptions}
            minuteStep={minuteStep}
            mode={mode}
            value={date}
            onChange={setDate}
            locale={locale}
            className={sheet ? 'items-center' : undefined}
          />

          <div className="flex items-center gap-3 border-t border-border/50 pt-3">
            <span className="min-w-0 flex-1 truncate text-sm" title={text}>
              {text}
            </span>
            <Button
              type="button"
              size="sm"
              onClick={apply}
              className="shrink-0 pointer-coarse:h-11"
            >
              {t(active ? 'html.dateTime.update' : 'html.dateTime.insert')}
            </Button>
          </div>
        </>
      )}
    </ResponsivePopover>
  );
}
