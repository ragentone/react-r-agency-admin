import React from 'react';
import { useTranslation } from 'react-i18next';

import { ChoiceField } from './BlockFields';
import { isFullWidthBlock } from './layout';
import { type PageBlock, SITE_PAGE_BLOCK_WIDTHS, type SitePageBlockWidth } from './types';

const OPTIONS = ['auto', ...SITE_PAGE_BLOCK_WIDTHS] as const;
type Option = (typeof OPTIONS)[number];

/** Width of one block on the page: type default, reading column, wide or full page width. */
export const BlockWidthField: React.FC<{
  block: PageBlock;
  onChange: (block: PageBlock) => void;
  disabled?: boolean;
}> = ({ block, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set = (next: Option) => {
    const copy = { ...block };
    delete copy.width;
    onChange(next === 'auto' ? copy : { ...copy, width: next as SitePageBlockWidth });
  };
  return (
    <div>
      <ChoiceField
        label={t('blocks.width.label')}
        value={(block.width ?? 'auto') as Option}
        options={OPTIONS}
        onChange={set}
        text={value => t(`blocks.width.${value}`)}
        disabled={disabled}
      />
      <p className="mt-1 text-caption text-muted-foreground">
        {isFullWidthBlock(block) ? t('blocks.width.hintFull') : t('blocks.width.hint')}
      </p>
    </div>
  );
};
