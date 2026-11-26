import React from 'react';
import { useTranslation } from 'react-i18next';

import { DateTimeField, TextAreaField, TextField, ToggleField, UrlField } from './BlockFields';
import { PlaceField } from './PlaceField';
import type { IEventBlockData } from './types';

interface IProps {
  data: IEventBlockData;
  onChange: (data: IEventBlockData) => void;
  disabled?: boolean;
}

const HOUR = 3600000;

/** Date with place – the .ics file for the calendar is built in the visitor's browser. */
export const EventBlockEditor: React.FC<IProps> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set =
    <K extends keyof IEventBlockData>(key: K) =>
    (value: IEventBlockData[K]) =>
      onChange({ ...data, [key]: value });
  const start = new Date(data.start);
  const end = new Date(data.end);
  const hasEnd = Boolean(data.end);
  const endBeforeStart = hasEnd && end <= start;
  return (
    <>
      <TextField
        label={t('blocks.field.title')}
        value={data.title}
        onChange={set('title')}
        max={150}
        disabled={disabled}
      />
      <DateTimeField
        label={t('blocks.event.start')}
        value={data.start}
        onChange={set('start')}
        disabled={disabled}
      />
      <ToggleField
        label={t('blocks.event.allDay')}
        hint={t('blocks.event.allDayHint')}
        value={data.allDay}
        onChange={set('allDay')}
        disabled={disabled}
      />
      <ToggleField
        label={t('blocks.event.hasEnd')}
        value={hasEnd}
        onChange={value =>
          set('end')(
            value && !Number.isNaN(start.getTime())
              ? new Date(start.getTime() + 2 * HOUR).toISOString()
              : ''
          )
        }
        disabled={disabled}
      />
      {hasEnd && (
        <div>
          <DateTimeField
            label={t('blocks.event.end')}
            value={data.end}
            onChange={set('end')}
            disabled={disabled}
          />
          {endBeforeStart && (
            <p className="mt-1 text-caption text-destructive">{t('blocks.event.endInvalid')}</p>
          )}
        </div>
      )}
      <PlaceField
        label={t('blocks.event.location')}
        hint={t('blocks.event.locationHint')}
        value={data.location}
        onChange={set('location')}
        max={200}
        disabled={disabled}
      />
      <TextAreaField
        label={t('blocks.field.text')}
        value={data.text}
        onChange={set('text')}
        max={500}
        disabled={disabled}
      />
      <TextField
        label={t('blocks.field.buttonLabel')}
        value={data.buttonLabel}
        onChange={set('buttonLabel')}
        max={60}
        disabled={disabled}
      />
      <UrlField
        label={t('blocks.field.buttonUrl')}
        value={data.buttonUrl}
        onChange={set('buttonUrl')}
        disabled={disabled}
      />
    </>
  );
};
