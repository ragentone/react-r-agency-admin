import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AdminNoAccess } from '../../admin/components/AdminNoAccess';
import { ADMIN_SCROLL, ADMIN_WIDTH } from '../../admin/ui/AdminPage';
import { ShopEmpty } from '../components/ShopEmpty';
import { ShopItemForm } from '../components/ShopItemForm';
import { ADMIN_SHOP_ROLES, ADMIN_SHOP_ROUTE } from '../const';
import { useShop, useShopItem } from '../hooks';

const Editor = ({ itemId }: { itemId: string | null }) => {
  const { t } = useTranslation('admin-shop');
  const navigate = useNavigate();
  const { data: shop, loading: shopLoading } = useShop();
  const { data: item, loading: itemLoading } = useShopItem(itemId);
  const back = () => void navigate({ to: ADMIN_SHOP_ROUTE as '/' });

  if (shopLoading || (itemId && itemLoading)) return <Skeleton className="h-64 rounded-xl" />;
  if (!shop || (itemId && !item)) return <ShopEmpty title={t('items.error')} />;
  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-background">
      <ShopItemForm key={item?.id ?? 'new'} shopId={shop.id} item={item} onDone={back} />
    </div>
  );
};

/** `/admin/shop/items/new` and `/admin/shop/items/:itemId`: edit one item on its own route. */
export const PageAdminShopItem: React.FC = () => {
  const { t } = useTranslation('admin-shop');
  const navigate = useNavigate();
  const { itemId } = useParams({ strict: false }) as { itemId?: string };
  const id = itemId && itemId !== 'new' ? itemId : null;
  return (
    <RoutePage
      width={ADMIN_WIDTH.base}
      scrollable={true}
      classes={{ scroll: ADMIN_SCROLL }}
      header={{
        title: t(id ? 'item.editTitle' : 'item.newTitle'),
        leading: (
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={t('item.back')}
            onClick={() => void navigate({ to: ADMIN_SHOP_ROUTE as '/' })}
          >
            <ArrowLeft className="size-5" />
          </Button>
        ),
      }}
    >
      <RoleGate roles={ADMIN_SHOP_ROLES} fallback={<AdminNoAccess />}>
        <Editor itemId={id} />
      </RoleGate>
    </RoutePage>
  );
};
