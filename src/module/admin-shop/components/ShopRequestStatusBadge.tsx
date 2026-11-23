import { cn } from '@ui/lib/utils';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ShopRequestStatus } from '../types/request';

/** Stage of a request: new is filled black, won is soft, lost and the rest are outlined. */
export const ShopRequestStatusBadge: React.FC<{
  status: ShopRequestStatus;
  className?: string;
}> = ({ status, className }) => {
  const { t } = useTranslation('admin-shop');
  return (
    <Badge
      variant={status === 'new' ? 'default' : status === 'won' ? 'secondary' : 'outline'}
      className={cn(
        status !== 'new' && 'border-border/50',
        status === 'lost' && 'text-muted-foreground',
        className
      )}
    >
      {t(`crm.status.${status}`)}
    </Badge>
  );
};
