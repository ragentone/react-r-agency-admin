import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IAdminUser } from '../types';

const Badge: React.FC<{ tone?: 'default' | 'warn'; children: React.ReactNode }> = ({
  tone = 'default',
  children,
}) => (
  <span
    className={
      tone === 'warn'
        ? 'inline-flex h-5 items-center rounded-full bg-destructive/10 px-2 text-[11px] font-semibold text-destructive'
        : 'inline-flex h-5 items-center rounded-full bg-foreground/[0.07] px-2 text-[11px] font-semibold text-muted-foreground'
    }
  >
    {children}
  </span>
);

/** "You", super user, blocked, inactive. */
export const AdminUserBadges: React.FC<{ user: IAdminUser }> = ({ user }) => {
  const { t } = useTranslation('admin');
  if (!user.self && !user.superUser && !user.blocked && user.active) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {user.self && <Badge>{t('badge.self')}</Badge>}
      {user.superUser && <Badge>{t('badge.superUser')}</Badge>}
      {user.blocked && <Badge tone="warn">{t('badge.blocked')}</Badge>}
      {!user.active && <Badge tone="warn">{t('badge.inactive')}</Badge>}
    </span>
  );
};
