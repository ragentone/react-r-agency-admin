import React from 'react';
import { useTranslation } from 'react-i18next';

import { RoleListField } from '../components/RoleListField';
import { ChoiceField } from './BlockFields';
import {
  type IBlockAccess,
  type PageBlock,
  SITE_PAGE_BLOCK_VISIBILITIES,
  type SitePageBlockVisibility,
} from './types';

/** Who sees this block – stored as `block.access` (missing = everybody). */
export const BlockAccessField: React.FC<{
  block: PageBlock;
  onChange: (block: PageBlock) => void;
  disabled?: boolean;
}> = ({ block, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const visibility = block.access?.visibility ?? 'all';
  const roles = block.access?.roles ?? [];

  const set = (next: SitePageBlockVisibility, nextRoles: string[]) => {
    const copy = { ...block };
    delete copy.access;
    const access: IBlockAccess | undefined =
      next === 'all' ? undefined : { visibility: next, roles: next === 'guests' ? [] : nextRoles };
    onChange(access ? { ...copy, access } : copy);
  };

  return (
    <div className="space-y-3 border-t border-border/50 pt-4">
      <ChoiceField
        label={t('blocks.access.title')}
        value={visibility}
        options={SITE_PAGE_BLOCK_VISIBILITIES}
        onChange={next => set(next, roles)}
        text={value => t(`blocks.access.${value}`)}
        disabled={disabled}
      />
      <p className="-mt-1.5 text-caption text-muted-foreground">
        {t(`blocks.access.${visibility}Hint`)}
      </p>
      {visibility === 'authenticated' && (
        <RoleListField
          roles={roles}
          onChange={next => set(visibility, next)}
          emptyText={t('blocks.access.rolesEmpty')}
          hint={t('blocks.access.rolesHint')}
          disabled={disabled}
        />
      )}
    </div>
  );
};
