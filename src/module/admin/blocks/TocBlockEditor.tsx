import React from 'react';
import { useTranslation } from 'react-i18next';

import { TextField, ToggleField } from './BlockFields';
import type { ITocBlockData } from './types';

export const TocEditor: React.FC<{
  data: ITocBlockData;
  onChange: (data: ITocBlockData) => void;
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
        placeholder={t('blocks.toc.titlePlaceholder')}
        disabled={disabled}
      />
      <ToggleField
        label={t('blocks.toc.numbered')}
        value={data.numbered}
        onChange={numbered => onChange({ ...data, numbered })}
        disabled={disabled}
      />
      <p className="text-caption text-muted-foreground">{t('blocks.toc.hint')}</p>
    </>
  );
};
