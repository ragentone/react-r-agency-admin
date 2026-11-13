import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/shad-cn/components/table.tsx';
import { ChevronRight, Lock } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IAdminUser } from '../types';
import { AdminAvatar } from './AdminAvatar';
import { AdminUserBadges } from './AdminUserBadges';
import { RoleChip } from './RoleChip';

const MAX_CHIPS = 3;

/** From `md`: users as a table (user · roles · status). The whole row opens the role drawer. */
export const AdminUsersTable: React.FC<{
  users: IAdminUser[];
  onOpen: (user: IAdminUser) => void;
}> = ({ users, onOpen }) => {
  const { t } = useTranslation('admin');
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="px-4 text-caption">{t('users.col.user')}</TableHead>
            <TableHead className="text-caption">{t('users.col.roles')}</TableHead>
            <TableHead className="text-caption">{t('users.col.status')}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => {
            const more = user.roles.length - MAX_CHIPS;
            return (
              <TableRow
                key={user.id}
                onClick={() => onOpen(user)}
                className="cursor-pointer border-border/50"
              >
                <TableCell className="px-4 py-3">
                  <button
                    type="button"
                    aria-label={t('users.open', { user: user.alias })}
                    onClick={event => {
                      event.stopPropagation();
                      onOpen(user);
                    }}
                    className="flex items-center gap-3 rounded-md text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <AdminAvatar user={user} className="size-9" />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-body font-bold">{user.alias}</span>
                        {user.locked && (
                          <Lock className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        )}
                      </span>
                      <span className="block max-w-64 truncate text-caption text-muted-foreground">
                        {user.email}
                      </span>
                    </span>
                  </button>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1">
                    {user.roles.slice(0, MAX_CHIPS).map(role => (
                      <RoleChip key={role} role={role} size="sm" />
                    ))}
                    {more > 0 && (
                      <span className="text-micro font-semibold text-muted-foreground tabular-nums">
                        +{more}
                      </span>
                    )}
                    {user.roles.length === 0 && (
                      <span className="text-micro text-muted-foreground">{t('role.empty')}</span>
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <AdminUserBadges user={user} />
                </TableCell>
                <TableCell className="pr-4">
                  <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
