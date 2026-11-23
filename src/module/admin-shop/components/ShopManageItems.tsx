import { useNavigate } from '@tanstack/react-router';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ADMIN_SHOP_ITEM_NEW_ROUTE } from '../const';
import { useShopItemMutate, useShopItems } from '../hooks';
import type { IShopItem } from '../types';
import { formatShopAmount } from '../utils/price';
import { ShopConfirmDialog } from './ShopConfirmDialog';
import { ShopEmpty } from './ShopEmpty';

/** Owner list of items with add / edit / delete. */
export const ShopManageItems = ({ shopId }: { shopId: string }) => {
  const { t, i18n } = useTranslation('admin-shop');
  const { data, loading, reload } = useShopItems(shopId, null);
  const { remove } = useShopItemMutate();
  const navigate = useNavigate();
  const edit = (id: string) =>
    void navigate({ to: '/admin/shop/items/$itemId' as '/', params: { itemId: id } as never });
  const [deleting, setDeleting] = useState<IShopItem | null>(null);

  const confirmDelete = async () => {
    if (!deleting) return;
    const result = await remove(deleting.id);
    setDeleting(null);
    if (result.ok) reload();
    else toast.error(t('item.error'));
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border/50 p-3">
        <h2 className="font-bold">{t('manage.items')}</h2>
        <Button size="sm" onClick={() => void navigate({ to: ADMIN_SHOP_ITEM_NEW_ROUTE as '/' })}>
          <Plus className="size-4" aria-hidden="true" />
          {t('manage.add')}
        </Button>
      </div>
      {!loading && data.length === 0 && <ShopEmpty title={t('manage.empty')} />}
      {data.map(item => (
        <div key={item.id} className="flex items-center gap-3 border-b border-border/50 p-3">
          <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
            {item.images[0] && (
              <img src={item.images[0].url} alt="" className="size-full object-cover" />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold">{item.title}</span>
            <span className="text-xs text-muted-foreground">
              {t(`kind.${item.kind}`)} ·{' '}
              {formatShopAmount(item.amountCents, i18n.language) ?? t('price.onRequest')}
            </span>
          </div>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={t('manage.edit')}
            onClick={() => edit(item.id)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={t('confirm.delete')}
            onClick={() => setDeleting(item)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <ShopConfirmDialog
        open={deleting !== null}
        title={t('confirm.itemTitle')}
        description={t('confirm.itemText', { title: deleting?.title ?? '' })}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};
