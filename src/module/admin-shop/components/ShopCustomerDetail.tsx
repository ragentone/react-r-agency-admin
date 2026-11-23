import { cn } from '@ui/lib/utils';
import { AppDrawer } from '@ui/patterns/drawer/AppDrawer.tsx';
import { buttonVariants } from '@ui/shad-cn/components/button.tsx';
import { Mail } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IShopCustomer } from '../types/request';
import { formatCents } from '../utils/request-crm';
import { ShopRequestItem } from './ShopRequestItem';
import { ShopRequestNotes } from './ShopRequestNotes';

export interface IShopCustomerDetailProps {
  /** Customer to show, `null` closes the drawer. */
  customer: IShopCustomer | null;
  language: string;
  onOpenChange: (open: boolean) => void;
  /** Opens one of the customer's requests. */
  onOpenRequest: (id: string) => void;
}

/** Customer card: figures, contact, all requests and the internal notes. */
export const ShopCustomerDetail: React.FC<IShopCustomerDetailProps> = ({
  customer,
  language,
  onOpenChange,
  onOpenRequest,
}) => {
  const { t } = useTranslation('admin-shop');
  const titles = Object.fromEntries(
    (customer?.requests ?? []).map(request => [request.id, request.itemTitle])
  );
  const stats = customer
    ? [
        { label: t('customers.requestsLabel'), value: String(customer.requests.length) },
        { label: t('customers.won'), value: formatCents(customer.wonCents, language) },
        { label: t('customers.openValue'), value: formatCents(customer.openCents, language) },
      ]
    : [];

  return (
    <AppDrawer
      open={customer !== null}
      onOpenChange={open => {
        if (!open) onOpenChange(false);
      }}
      direction="right"
      size="full"
      title={customer?.name ?? ''}
      bodyKey={customer?.key}
      footer={
        customer?.email ? (
          <a
            href={`mailto:${customer.email}`}
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full border-border/50')}
          >
            <Mail className="size-4" aria-hidden="true" />
            {t('crm.reply')}
          </a>
        ) : undefined
      }
    >
      {customer && (
        <div className="space-y-6">
          <dl className="grid grid-cols-3 gap-2">
            {stats.map(stat => (
              <div key={stat.label} className="rounded-xl border border-border/50 p-3">
                <dt className="text-caption text-muted-foreground">{stat.label}</dt>
                <dd className="text-body font-bold break-words">{stat.value}</dd>
              </div>
            ))}
          </dl>

          <section className="space-y-3">
            <h3 className="text-body font-bold">{t('customers.history')}</h3>
            <div className="flex flex-col gap-3">
              {customer.requests.map(request => (
                <ShopRequestItem
                  key={request.id}
                  request={request}
                  language={language}
                  onOpen={onOpenRequest}
                />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-body font-bold">{t('crm.notes.title')}</h3>
            <ShopRequestNotes
              requestId={customer.requests[0].id}
              language={language}
              titles={titles}
            />
          </section>
        </div>
      )}
    </AppDrawer>
  );
};
