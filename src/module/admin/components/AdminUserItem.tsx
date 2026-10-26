import { ChevronRight, Lock } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IAdminUser } from '../types';
import { AdminAvatar } from './AdminAvatar';
import { AdminUserBadges } from './AdminUserBadges';
import { RoleChip } from './RoleChip';

const MAX_CHIPS = 3;

/** Row of the user list – tap opens the role drawer. */
export const AdminUserItem: React.FC<{ user: IAdminUser; onOpen: (user: IAdminUser) => void }> = ({
  user,
  onOpen,
}) => {
  const { t } = useTranslation('admin');
  const more = user.roles.length - MAX_CHIPS;
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(user)}
        aria-label={t('users.open', { user: user.alias })}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03] active:bg-foreground/[0.06]"
      >
        <AdminAvatar user={user} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-body font-bold text-foreground">{user.alias}</span>
            {user.locked && (
              <Lock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
          </span>
          <span className="block truncate text-caption text-muted-foreground">{user.email}</span>
          <span className="mt-1.5 flex flex-wrap items-center gap-1">
            <AdminUserBadges user={user} />
            {user.roles.slice(0, MAX_CHIPS).map(role => (
              <RoleChip key={role} role={role} size="sm" />
            ))}
            {more > 0 && (
              <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">
                +{more}
              </span>
            )}
            {user.roles.length === 0 && (
              <span className="text-[11px] text-muted-foreground">{t('role.empty')}</span>
            )}
          </span>
        </span>
        <ChevronRight className="mt-3 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
    </li>
  );
};
