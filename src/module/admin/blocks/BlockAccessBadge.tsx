import { EyeOff } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PageBlock } from './types';

/** Small hint in the block list: not everybody sees this block. */
export const BlockAccessBadge: React.FC<{ block: PageBlock }> = ({ block }) => {
  const { t } = useTranslation('admin');
  const access = block.access;
  if (!access || access.visibility === 'all') return null;
  const label =
    access.visibility === 'authenticated' && access.roles.length
      ? t('blocks.access.badgeRoles', { count: access.roles.length })
      : t(`blocks.access.${access.visibility}`);
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-foreground/[0.07] px-2 py-0.5 font-semibold text-foreground">
      <EyeOff className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
};
