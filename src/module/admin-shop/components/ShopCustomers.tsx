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

import type { IShopCustomer } from '../types/request';
import { formatCents } from '../utils/request-crm';
import { formatRequestDate } from '../utils/request-view';

export interface IShopCustomersProps {
  customers: IShopCustomer[];
  language: string;
  onOpen: (key: string) => void;
}

/** Customer list: one row per person with request count, last contact and won value. */
export const ShopCustomers: React.FC<IShopCustomersProps> = ({ customers, language, onOpen }) => {
  const { t } = useTranslation('admin-shop');

  return (
    <div className="flex flex-col gap-3">
      {customers.map(customer => (
        <Item key={customer.key} asChild variant="outline" size="sm" className="border-border/50">
          <button
            type="button"
            className="w-full cursor-pointer items-start text-left transition-colors hover:bg-muted/50"
            onClick={() => onOpen(customer.key)}
          >
            <ItemMedia
              className={cn(
                'size-10 rounded-full border border-border/50 bg-muted text-body font-bold',
                'text-muted-foreground'
              )}
            >
              {customer.name.charAt(0).toUpperCase()}
            </ItemMedia>
            <ItemContent className="min-w-0 gap-0.5">
              <ItemTitle className="break-words">{customer.name}</ItemTitle>
              <ItemDescription className="line-clamp-1 break-words">
                {customer.email ?? t('customers.member')}
              </ItemDescription>
              <p className="text-caption text-muted-foreground">
                {t('customers.requests', { count: customer.requests.length })}
                {' · '}
                {formatRequestDate(customer.lastAt, language)}
              </p>
            </ItemContent>
            {customer.wonCents > 0 && (
              <ItemActions>
                <span className="text-caption font-bold">
                  {formatCents(customer.wonCents, language)}
                </span>
              </ItemActions>
            )}
          </button>
        </Item>
      ))}
    </div>
  );
};
