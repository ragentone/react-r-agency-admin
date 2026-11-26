import React from 'react';
import { useTranslation } from 'react-i18next';

import { formatFileSize } from '../hooks/use.admin.page.file';
import { ItemsField, TextAreaField, TextField } from './BlockFields';
import { FileField } from './FileField';
import { PlaceField } from './PlaceField';
import {
  emptyDownload,
  type ISitePageBlockDataMap,
  SITE_PAGE_DOWNLOADS_MAX,
  type SitePageBlockType,
} from './types';

type EditorProps<T extends SitePageBlockType> = {
  data: ISitePageBlockDataMap[T];
  onChange: (data: ISitePageBlockDataMap[T]) => void;
  disabled?: boolean;
};

export const ContactEditor: React.FC<EditorProps<'contact'>> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set =
    <K extends keyof typeof data>(key: K) =>
    (value: (typeof data)[K]) =>
      onChange({ ...data, [key]: value });
  return (
    <>
      <TextField
        label={t('blocks.field.heading')}
        value={data.title}
        onChange={set('title')}
        max={150}
        disabled={disabled}
      />
      <TextField
        label={t('blocks.contact.phone')}
        value={data.phone}
        onChange={set('phone')}
        max={40}
        placeholder="+49 30 123456"
        disabled={disabled}
      />
      <TextField
        label={t('blocks.contact.email')}
        value={data.email}
        onChange={set('email')}
        max={120}
        placeholder="info@example.de"
        disabled={disabled}
      />
      <PlaceField
        label={t('blocks.contact.address')}
        value={data.address}
        onChange={set('address')}
        max={300}
        hint={t('blocks.contact.addressHint')}
        disabled={disabled}
      />
      <TextAreaField
        label={t('blocks.contact.hours')}
        value={data.hours}
        onChange={set('hours')}
        max={500}
        hint={t('blocks.contact.hoursHint')}
        disabled={disabled}
      />
    </>
  );
};

export const DownloadsEditor: React.FC<EditorProps<'downloads'>> = ({
  data,
  onChange,
  disabled,
}) => {
  const { t, i18n } = useTranslation('admin');
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
        label={t('blocks.downloads.items')}
        items={data.items}
        onChange={items => onChange({ ...data, items })}
        create={emptyDownload}
        max={SITE_PAGE_DOWNLOADS_MAX}
        title={item => item.label || t('blocks.downloads.item')}
        addLabel={t('blocks.downloads.add')}
        disabled={disabled}
        render={(item, update) => (
          <>
            <FileField
              label={t('blocks.downloads.file')}
              value={item.url}
              onChange={url => update({ ...item, url })}
              // Name (only if still empty) and size from the picked file.
              onUploaded={(url, file) =>
                update({
                  ...item,
                  url,
                  label: item.label || file.name.replace(/\.[^.]+$/, '').slice(0, 120),
                  size: formatFileSize(file.size, i18n.language),
                })
              }
              disabled={disabled}
            />
            <TextField
              label={t('blocks.downloads.label')}
              value={item.label}
              onChange={label => update({ ...item, label })}
              max={120}
              disabled={disabled}
            />
            <div className="grid grid-cols-[7rem_1fr] gap-3">
              <TextField
                label={t('blocks.downloads.size')}
                value={item.size}
                onChange={size => update({ ...item, size })}
                max={20}
                placeholder="1,2 MB"
                disabled={disabled}
              />
              <TextField
                label={t('blocks.downloads.note')}
                value={item.note}
                onChange={note => update({ ...item, note })}
                max={150}
                disabled={disabled}
              />
            </div>
          </>
        )}
      />
    </>
  );
};
