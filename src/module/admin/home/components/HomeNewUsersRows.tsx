import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/shad-cn/components/table.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IStatsNewUser } from '../../stats/types';
import { formatAgo } from '../../stats/utils';

interface IProps {
  users: IStatsNewUser[];
  locale: string;
  onUser: (userId: string) => void;
}

const Initial: React.FC<{ alias?: string | null }> = ({ alias }) => (
  <span
    aria-hidden="true"
    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-caption font-bold"
  >
    {(alias ?? '?').trim().charAt(0).toUpperCase()}
  </span>
);

const Unconfirmed: React.FC = () => {
  const { t } = useTranslation('admin');
  return (
    <span className="shrink-0 rounded-md border border-border/50 px-1.5 py-0.5 text-micro font-semibold text-muted-foreground">
      {t('home.newUsers.unconfirmed')}
    </span>
  );
};

/** Mobile (< md): one tappable row per new user. Under 16 only a line without personal data. */
export const HomeNewUsersList: React.FC<IProps> = ({ users, locale, onUser }) => {
  const { t } = useTranslation('admin');
  return (
    <ul className="divide-y divide-border/50 md:hidden">
      {users.map((user, index) => {
        const time = formatAgo(user.registeredAt, locale);
        if (user.minor || !user.id) {
          return (
            <li
              key={`minor-${index}`}
              className="flex min-h-14 items-center gap-3 px-4 py-3 text-caption text-muted-foreground"
            >
              <span className="min-w-0 flex-1 truncate">{t('home.newUsers.minor')}</span>
              <span className="shrink-0">{time}</span>
            </li>
          );
        }
        return (
          <li key={user.id}>
            <button
              type="button"
              onClick={() => onUser(user.id as string)}
              className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Initial alias={user.alias} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body font-bold">{user.alias}</span>
                <span className="block truncate text-caption text-muted-foreground">
                  {user.email}
                </span>
              </span>
              {!user.confirmed && <Unconfirmed />}
              <span className="shrink-0 text-caption text-muted-foreground">{time}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

/** From `md`: the same data as a table (user · e-mail · status · registered). */
export const HomeNewUsersTable: React.FC<IProps> = ({ users, locale, onUser }) => {
  const { t } = useTranslation('admin');
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="px-4 text-caption">{t('home.newUsers.col.user')}</TableHead>
            <TableHead className="text-caption">{t('home.newUsers.col.email')}</TableHead>
            <TableHead className="text-caption">{t('home.newUsers.col.status')}</TableHead>
            <TableHead className="px-4 text-right text-caption">
              {t('home.newUsers.col.date')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => {
            const time = formatAgo(user.registeredAt, locale);
            const open = user.minor || !user.id ? undefined : () => onUser(user.id as string);
            return (
              <TableRow
                key={user.id ?? `minor-${index}`}
                onClick={open}
                className={`border-border/50 ${open ? 'cursor-pointer' : ''}`}
              >
                <TableCell className="px-4 py-3">
                  {open ? (
                    <span className="flex items-center gap-3">
                      <Initial alias={user.alias} />
                      <span className="font-bold">{user.alias}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{t('home.newUsers.minor')}</span>
                  )}
                </TableCell>
                <TableCell className="max-w-64 truncate text-muted-foreground">
                  {open ? user.email : '–'}
                </TableCell>
                <TableCell>{open && !user.confirmed ? <Unconfirmed /> : null}</TableCell>
                <TableCell className="px-4 text-right text-muted-foreground">{time}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
