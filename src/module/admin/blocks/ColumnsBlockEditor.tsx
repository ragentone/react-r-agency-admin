import React from 'react';
import { useTranslation } from 'react-i18next';

import { TextEditor } from './BlockEditors.shared';
import { ItemsField, TextField, ToggleField } from './BlockFields';
import { emptyColumn, type IColumnsBlockData, SITE_PAGE_COLUMNS_MAX } from './types';

export const ColumnsEditor: React.FC<{
  data: IColumnsBlockData;
  onChange: (data: IColumnsBlockData) => void;
  disabled?: boolean;
}> = ({ data, onChange, disabled }) => {
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
      <ToggleField
        label={t('blocks.columns.divider')}
        hint={t('blocks.columns.dividerHint')}
        value={data.divider}
        onChange={divider => onChange({ ...data, divider })}
        disabled={disabled}
      />
      <ItemsField
        label={t('blocks.columns.items')}
        items={data.items}
        onChange={items => onChange({ ...data, items })}
        create={emptyColumn}
        max={SITE_PAGE_COLUMNS_MAX}
        title={(_, index) => t('blocks.columns.item', { n: index + 1 })}
        addLabel={t('blocks.columns.add')}
        disabled={disabled}
        render={(item, update) => (
          <TextEditor
            data={{ html: item.html }}
            onChange={({ html }) => update({ ...item, html })}
            disabled={disabled}
          />
        )}
      />
      <p className="text-caption text-muted-foreground">{t('blocks.columns.hint')}</p>
    </>
  );
};
