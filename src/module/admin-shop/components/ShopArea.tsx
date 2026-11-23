import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminPage } from '../../admin/ui/AdminPage';
import { useShop } from '../hooks';
import { ShopEmpty } from './ShopEmpty';
import { ShopForm } from './ShopForm';
import { ShopInbox } from './ShopInbox';
import { ShopManageItems } from './ShopManageItems';

type Tab = 'inbox' | 'items' | 'settings';
const TABS: Tab[] = ['inbox', 'items', 'settings'];

/** Requests (CRM), offers and settings of the one shop. Before the first save only settings. */
export const ShopArea: React.FC = () => {
  const { t } = useTranslation('admin-shop');
  const { data: shop, loading, error, reload } = useShop();
  const [tab, setTab] = useState<Tab>('inbox');

  if (loading && !shop) {
    return (
      <AdminPage>
        <Skeleton className="h-64 rounded-xl" />
      </AdminPage>
    );
  }
  if (error) {
    return (
      <AdminPage>
        <ShopEmpty title={t('items.error')} />
      </AdminPage>
    );
  }

  const active: Tab = shop ? tab : 'settings';

  return (
    <AdminPage>
      <div className="overflow-hidden rounded-xl border border-border/50 bg-background">
        <div className="flex gap-2 border-b border-border/50 p-3">
          {TABS.map(value => (
            <Button
              key={value}
              size="sm"
              pill
              disabled={!shop && value !== 'settings'}
              variant={active === value ? 'default' : 'outline'}
              onClick={() => setTab(value)}
            >
              {t(`manage.tab.${value}`)}
            </Button>
          ))}
        </div>
        {!shop && <p className="p-4 text-sm text-muted-foreground">{t('manage.setup')}</p>}
        {shop && active === 'inbox' && (
          <div className="p-3">
            <ShopInbox shopId={shop.id} />
          </div>
        )}
        {shop && active === 'items' && <ShopManageItems shopId={shop.id} />}
        {active === 'settings' && <ShopForm key={shop?.id ?? 'new'} shop={shop} onSaved={reload} />}
      </div>
    </AdminPage>
  );
};
