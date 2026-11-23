import React from 'react';
import { useTranslation } from 'react-i18next';

import { formatCents } from '../utils/request-crm';

export interface IShopRequestStatsProps {
  openCents: number;
  wonCents: number;
  language: string;
}

/** Two figures above the pipeline: value still open and value won. */
export const ShopRequestStats: React.FC<IShopRequestStatsProps> = ({
  openCents,
  wonCents,
  language,
}) => {
  const { t } = useTranslation('admin-shop');
  const items = [
    { label: t('crm.stats.open'), cents: openCents },
    { label: t('crm.stats.won'), cents: wonCents },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3">
      {items.map(item => (
        <div key={item.label} className="rounded-xl border border-border/50 p-3">
          <dt className="text-caption text-muted-foreground">{item.label}</dt>
          <dd className="text-title font-bold">{formatCents(item.cents, language)}</dd>
        </div>
      ))}
    </dl>
  );
};
