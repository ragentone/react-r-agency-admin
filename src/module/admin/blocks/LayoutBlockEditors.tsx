import React from 'react';
import { useTranslation } from 'react-i18next';

import { TextEditor } from './BlockEditors.shared';
import { DateTimeField, ItemsField, TextAreaField, TextField, UrlField } from './BlockFields';
import {
  emptyStat,
  emptyStep,
  emptyTab,
  type ISitePageBlockDataMap,
  SITE_PAGE_STATS_MAX,
  SITE_PAGE_STEPS_MAX,
  SITE_PAGE_TABS_MAX,
  type SitePageBlockType,
} from './types';

type EditorProps<T extends SitePageBlockType> = {
  data: ISitePageBlockDataMap[T];
  onChange: (data: ISitePageBlockDataMap[T]) => void;
  disabled?: boolean;
};

const fieldSetter = <T extends object>(data: T, onChange: (data: T) => void) =>
  function set<K extends keyof T>(key: K) {
    return (value: T[K]) => onChange({ ...data, [key]: value });
  };

export const StatsEditor: React.FC<EditorProps<'stats'>> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set = fieldSetter(data, onChange);
  return (
    <>
      <TextField
        label={t('blocks.field.heading')}
        value={data.title}
        onChange={set('title')}
        max={150}
        disabled={disabled}
      />
      <ItemsField
        label={t('blocks.stats.items')}
        items={data.items}
        onChange={set('items')}
        create={emptyStat}
        max={SITE_PAGE_STATS_MAX}
        title={item => [item.value, item.label].filter(Boolean).join(' ') || t('blocks.stats.item')}
        addLabel={t('blocks.stats.add')}
        disabled={disabled}
        render={(item, update) => (
          <div className="grid grid-cols-[7rem_1fr] gap-3">
            <TextField
              label={t('blocks.stats.value')}
              value={item.value}
              onChange={value => update({ ...item, value })}
              max={20}
              placeholder="1.200"
              disabled={disabled}
            />
            <TextField
              label={t('blocks.stats.label')}
              value={item.label}
              onChange={label => update({ ...item, label })}
              max={80}
              disabled={disabled}
            />
          </div>
        )}
      />
    </>
  );
};

export const StepsEditor: React.FC<EditorProps<'steps'>> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set = fieldSetter(data, onChange);
  return (
    <>
      <TextField
        label={t('blocks.field.heading')}
        value={data.title}
        onChange={set('title')}
        max={150}
        disabled={disabled}
      />
      <ItemsField
        label={t('blocks.steps.items')}
        items={data.items}
        onChange={set('items')}
        create={emptyStep}
        max={SITE_PAGE_STEPS_MAX}
        title={item => item.title || t('blocks.steps.item')}
        addLabel={t('blocks.steps.add')}
        disabled={disabled}
        render={(item, update) => (
          <>
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
          </>
        )}
      />
    </>
  );
};

export const TabsEditor: React.FC<EditorProps<'tabs'>> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set = fieldSetter(data, onChange);
  return (
    <>
      <TextField
        label={t('blocks.field.heading')}
        value={data.title}
        onChange={set('title')}
        max={150}
        disabled={disabled}
      />
      <ItemsField
        label={t('blocks.tabs.items')}
        items={data.items}
        onChange={set('items')}
        create={emptyTab}
        max={SITE_PAGE_TABS_MAX}
        title={item => item.label || t('blocks.tabs.item')}
        addLabel={t('blocks.tabs.add')}
        disabled={disabled}
        render={(item, update) => (
          <>
            <TextField
              label={t('blocks.tabs.label')}
              value={item.label}
              onChange={label => update({ ...item, label })}
              max={40}
              disabled={disabled}
            />
            <TextEditor
              data={{ html: item.html }}
              onChange={({ html }) => update({ ...item, html })}
              disabled={disabled}
            />
          </>
        )}
      />
    </>
  );
};

export const CountdownEditor: React.FC<EditorProps<'countdown'>> = ({
  data,
  onChange,
  disabled,
}) => {
  const { t } = useTranslation('admin');
  const set = fieldSetter(data, onChange);
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
        label={t('blocks.countdown.target')}
        hint={t('blocks.countdown.targetHint')}
        value={data.target}
        onChange={set('target')}
        disabled={disabled}
      />
      <TextField
        label={t('blocks.countdown.doneText')}
        hint={t('blocks.countdown.doneHint')}
        value={data.doneText}
        onChange={set('doneText')}
        max={200}
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
