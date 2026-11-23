import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SHOP_CATEGORY_NAME_MAX } from '../const';
import { useShopCategories, useShopCategoryMutate } from '../hooks';
import type { IShopCategory } from '../types';
import { ShopConfirmDialog } from './ShopConfirmDialog';
import { ShopEmpty } from './ShopEmpty';

/** Categories of the shop: add, rename, delete (items stay without category). */
export const ShopCategories = ({ shopId }: { shopId: string }) => {
  const { t } = useTranslation('admin-shop');
  const { data, loading, reload } = useShopCategories(shopId);
  const { save, remove, saving } = useShopCategoryMutate();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState<IShopCategory | null>(null);

  const submit = async (id: string | null, value: string) => {
    if (!value.trim()) return;
    if (await save(shopId, id, value)) {
      setName('');
      setEditing(null);
      reload();
    } else toast.error(t('category.error'));
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const ok = await remove(deleting.id);
    setDeleting(null);
    if (ok) reload();
    else toast.error(t('category.error'));
  };

  return (
    <div>
      <div className="flex gap-2 border-b border-border/50 p-3">
        <Input
          value={name}
          maxLength={SHOP_CATEGORY_NAME_MAX}
          placeholder={t('category.name')}
          className="border-border/50"
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && void submit(null, name)}
        />
        <Button disabled={saving || !name.trim()} onClick={() => void submit(null, name)}>
          <Plus className="size-4" aria-hidden="true" />
          {t('manage.add')}
        </Button>
      </div>
      {!loading && data.length === 0 && <ShopEmpty title={t('category.empty')} />}
      {data.map(category => (
        <div key={category.id} className="flex items-center gap-2 border-b border-border/50 p-3">
          {editing?.id === category.id ? (
            <>
              <Input
                autoFocus
                value={editing.name}
                maxLength={SHOP_CATEGORY_NAME_MAX}
                className="border-border/50"
                onChange={e => setEditing({ id: category.id, name: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && void submit(category.id, editing.name)}
              />
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={t('form.save')}
                onClick={() => void submit(category.id, editing.name)}
              >
                <Check className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={t('confirm.cancel')}
                onClick={() => setEditing(null)}
              >
                <X className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{category.name}</span>
              <span className="text-xs text-muted-foreground">{category.itemCount}</span>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={t('manage.edit')}
                onClick={() => setEditing({ id: category.id, name: category.name })}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={t('confirm.delete')}
                onClick={() => setDeleting(category)}
              >
                <Trash2 className="size-4" />
              </Button>
            </>
          )}
        </div>
      ))}
      <ShopConfirmDialog
        open={deleting !== null}
        title={t('confirm.categoryTitle')}
        description={t('confirm.categoryText', { name: deleting?.name ?? '' })}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};
