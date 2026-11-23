import { cn } from '@ui/lib/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SHOP_REQUEST_STATUSES, type ShopRequestStatus } from '../types/request';

export interface IShopRequestStageProps {
  value: ShopRequestStatus;
  onChange: (status: ShopRequestStatus) => void;
}

/** Pills to move a request through the pipeline; the current stage is filled black. */
export const ShopRequestStage: React.FC<IShopRequestStageProps> = ({ value, onChange }) => {
  const { t } = useTranslation('admin-shop');

  return (
    <div role="group" aria-label={t('crm.stage')} className="flex flex-wrap gap-2">
      {SHOP_REQUEST_STATUSES.map(status => (
        <button
          key={status}
          type="button"
          aria-pressed={value === status}
          onClick={() => value !== status && onChange(status)}
          className={cn(
            'min-h-9 cursor-pointer rounded-full border px-4 text-caption font-bold transition-colors',
            value === status
              ? 'border-foreground bg-foreground text-background'
              : 'border-border/50 bg-background text-foreground hover:bg-muted'
          )}
        >
          {t(`crm.status.${status}`)}
        </button>
      ))}
    </div>
  );
};
