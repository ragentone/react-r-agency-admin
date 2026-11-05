import { Badge } from '@ui/shad-cn/components/badge.tsx';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@ui/shad-cn/components/item.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { DbUsageStatus, IDbUsageTable } from '../types';

const BADGE: Record<DbUsageStatus, 'destructive' | 'secondary' | 'outline'> = {
  unknown: 'destructive',
  'plugin-orphan': 'destructive',
  storage: 'secondary',
  'in-use': 'outline',
};

/** One row per table, candidates first (the list is already sorted by the runtime). */
export const DatabaseTableList: React.FC<{ tables: IDbUsageTable[] }> = ({ tables }) => {
  const { t, i18n } = useTranslation('admin');
  if (!tables.length) {
    return (
      <p className="py-8 text-center text-caption text-muted-foreground">
        {t('system.database.empty')}
      </p>
    );
  }
  return (
    <ul className="flex flex-col" aria-label={t('system.database.listLabel')}>
      {tables.map(table => (
        <li key={table.name} className="border-b border-border/50">
          <Item className="rounded-none px-1 py-3">
            <ItemContent className="min-w-0">
              <ItemTitle className="break-all font-bold">{table.name}</ItemTitle>
              <ItemDescription>
                {t('system.database.rows', { count: formatRows(table.rows, i18n.language) })}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Badge variant={BADGE[table.status]}>
                {t(`system.database.status.${table.status}`)}
              </Badge>
            </ItemActions>
          </Item>
        </li>
      ))}
    </ul>
  );
};

const formatRows = (rows: number, locale: string) => new Intl.NumberFormat(locale).format(rows);
