import { cn } from '@ui/lib/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SHOP_REQUEST_STATUSES, type ShopRequestStatus } from '../types/request';

export type ShopRequestFilterValue = 'all' | ShopRequestStatus;

const FILTERS: ShopRequestFilterValue[] = ['all', ...SHOP_REQUEST_STATUSES];

export interface IShopRequestFilterProps {
  value: ShopRequestFilterValue;
  counts: Record<ShopRequestFilterValue, number>;
  onChange: (value: ShopRequestFilterValue) => void;
}

/** Pill row to filter the pipeline by stage, with counts. */
export const ShopRequestFilter: React.FC<IShopRequestFilterProps> = ({
  value,
  counts,
  onChange,
}) => {
  const { t } = useTranslation('admin-shop');

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
      {FILTERS.map(filter => (
        <button
          key={filter}
          type="button"
          aria-pressed={value === filter}
          onClick={() => onChange(filter)}
          className={cn(
            'min-h-9 shrink-0 cursor-pointer rounded-full border px-4 text-caption font-bold transition-colors',
            value === filter
              ? 'border-foreground bg-foreground text-background'
              : 'border-border/50 bg-background text-foreground hover:bg-muted'
          )}
        >
          {filter === 'all' ? t('crm.filterAll') : t(`crm.status.${filter}`)}
          <span className="ml-1.5 font-normal opacity-70">{counts[filter]}</span>
        </button>
      ))}
    </div>
  );
};
