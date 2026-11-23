import { cn } from '@ui/lib/utils';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@ui/shad-cn/components/item.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IShopRequest } from '../types/request';
import { formatCents, requestName } from '../utils/request-crm';
import { formatRequestDate } from '../utils/request-view';
import { ShopRequestStatusBadge } from './ShopRequestStatusBadge';

export interface IShopRequestItemProps {
  request: IShopRequest;
  language: string;
  onOpen: (id: string) => void;
  /** Requester's own list: the service is the title (no sender). */
  own?: boolean;
}

/** One inbox row: sender, date, service, message preview, stage and job value. */
export const ShopRequestItem: React.FC<IShopRequestItemProps> = ({
  request,
  language,
  onOpen,
  own = false,
}) => {
  const { t } = useTranslation('admin-shop');
  const name = requestName(request, t('crm.member'));
  const isNew = request.status === 'new';

  return (
    <Item asChild variant="outline" size="sm" className="border-border/50">
      <button
        type="button"
        className="w-full cursor-pointer items-start text-left transition-colors hover:bg-muted/50"
        onClick={() => onOpen(request.id)}
      >
        <ItemMedia
          className={cn(
            'size-10 rounded-full border border-border/50 text-body font-bold',
            isNew ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
          )}
        >
          {(own ? request.itemTitle : name).charAt(0).toUpperCase()}
        </ItemMedia>
        <ItemContent className="min-w-0 gap-0.5">
          <div className="flex items-baseline justify-between gap-2">
            <ItemTitle className={cn('min-w-0 break-words', isNew ? 'font-bold' : 'font-medium')}>
              {own ? request.itemTitle : name}
            </ItemTitle>
            <span className="shrink-0 text-caption text-muted-foreground">
              {formatRequestDate(request.createdAt, language)}
            </span>
          </div>
          {!own && (
            <ItemDescription className="line-clamp-1 break-words">
              {request.itemTitle}
            </ItemDescription>
          )}
          <p
            className={cn(
              'line-clamp-2 text-caption break-words',
              isNew ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {request.message}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <ShopRequestStatusBadge status={request.status} />
            {!own && request.valueCents !== null && (
              <span className="text-caption font-bold">
                {formatCents(request.valueCents, language)}
              </span>
            )}
          </div>
        </ItemContent>
        {isNew && (
          <ItemActions>
            <span
              className="size-2.5 rounded-full bg-foreground"
              role="img"
              aria-label={t('crm.status.new')}
            />
          </ItemActions>
        )}
      </button>
    </Item>
  );
};
