import React from 'react';
import { useTranslation } from 'react-i18next';

import { ChoiceField } from './BlockFields';
import { type PageBlock, SITE_PAGE_BLOCK_BACKGROUNDS } from './types';

const OPTIONS = ['default', ...SITE_PAGE_BLOCK_BACKGROUNDS] as const;
type Option = (typeof OPTIONS)[number];

/** Background band of one block: page background, soft grey or inverted (not for the banner). */
export const BlockBackgroundField: React.FC<{
  block: PageBlock;
  onChange: (block: PageBlock) => void;
  disabled?: boolean;
}> = ({ block, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  if (block.type === 'hero') return null;
  const set = (next: Option) => {
    const copy = { ...block };
    delete copy.background;
    onChange(next === 'default' ? copy : { ...copy, background: next });
  };
  return (
    <div>
      <ChoiceField
        label={t('blocks.background.label')}
        value={(block.background ?? 'default') as Option}
        options={OPTIONS}
        onChange={set}
        text={value => t(`blocks.background.${value}`)}
        disabled={disabled}
      />
      <p className="mt-1 text-caption text-muted-foreground">{t('blocks.background.hint')}</p>
    </div>
  );
};
