import React from 'react';
import { useTranslation } from 'react-i18next';

import { ItemsField, TextAreaField, TextField } from './BlockFields';
import { CropImageField } from './CropImageField';
import { AltField } from './MediaBlockEditors';
import { emptyMilestone, type ITimelineBlockData, SITE_PAGE_TIMELINE_MAX } from './types';

interface IProps {
  data: ITimelineBlockData;
  onChange: (data: ITimelineBlockData) => void;
  disabled?: boolean;
}

/** Entries top to bottom; an optional image per entry (select → compress → crop 16:9 → upload). */
export const TimelineBlockEditor: React.FC<IProps> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  return (
    <>
      <TextField
        label={t('blocks.field.heading')}
        value={data.title}
        onChange={title => onChange({ ...data, title })}
        max={150}
        disabled={disabled}
      />
      <ItemsField
        label={t('blocks.timeline.items')}
        items={data.items}
        onChange={items => onChange({ ...data, items })}
        create={emptyMilestone}
        max={SITE_PAGE_TIMELINE_MAX}
        title={item =>
          [item.date, item.title].filter(Boolean).join(' · ') || t('blocks.timeline.item')
        }
        addLabel={t('blocks.timeline.add')}
        disabled={disabled}
        render={(item, update) => (
          <>
            <TextField
              label={t('blocks.timeline.date')}
              hint={t('blocks.timeline.dateHint')}
              value={item.date}
              onChange={date => update({ ...item, date })}
              max={40}
              placeholder="März 2025"
              disabled={disabled}
            />
            <TextField
              label={t('blocks.field.title')}
              value={item.title}
              onChange={title => update({ ...item, title })}
              max={120}
              disabled={disabled}
            />
            <TextAreaField
              label={t('blocks.field.text')}
              value={item.text}
              onChange={text => update({ ...item, text })}
              max={500}
              disabled={disabled}
            />
            <CropImageField
              label={t('blocks.field.imageOptional')}
              value={item.imageUrl}
              onChange={imageUrl => update({ ...item, imageUrl })}
              ratio="16/9"
              aspect="aspect-video"
              disabled={disabled}
            />
            {item.imageUrl && (
              <AltField
                value={item.alt}
                onChange={alt => update({ ...item, alt })}
                disabled={disabled}
              />
            )}
          </>
        )}
      />
    </>
  );
};
