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

import type { IDbEntity } from '../types';

/** One row per entity. A missing table is flagged in red with white text, as on the buttons. */
export const EntityList: React.FC<{ entities: IDbEntity[] }> = ({ entities }) => {
  const { t } = useTranslation('admin');
  if (!entities.length) {
    return (
      <p className="py-8 text-center text-caption text-muted-foreground">
        {t('system.entities.empty')}
      </p>
    );
  }
  return (
    <ul className="flex flex-col" aria-label={t('system.entities.listLabel')}>
      {entities.map(entity => (
        <li key={entity.entity} className="border-b border-border/50">
          <Item className="rounded-none px-1 py-3">
            <ItemContent className="min-w-0">
              <ItemTitle className="break-all font-bold">{entity.entity}</ItemTitle>
              <ItemDescription className="break-all">
                {entity.table} · {t('system.entities.columns', { count: entity.columns })} ·{' '}
                {t('system.entities.relations', { count: entity.relations })}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              {entity.rows === null ? (
                <Badge variant="destructive" className="text-white">
                  {t('system.entities.missing')}
                </Badge>
              ) : (
                <span className="text-body font-bold tabular-nums">
                  {t('system.entities.rows', { count: entity.rows })}
                </span>
              )}
            </ItemActions>
          </Item>
        </li>
      ))}
    </ul>
  );
};
