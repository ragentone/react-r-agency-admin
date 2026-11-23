import { LazyHtmlEditor as HtmlEditor } from '@core/editor/html/lazy.html-editor.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  SHOP_ITEM_DESCRIPTION_MAX,
  SHOP_ITEM_DURATION_MAX,
  SHOP_ITEM_IMAGES_MAX,
  SHOP_ITEM_TITLE_MAX,
} from '../const';
import { useShopItemMutate } from '../hooks';
import type { IShopItem, IShopItemImage, ShopItemKind, ShopItemPriceType } from '../types';
import { ShopCategoryPicker } from './ShopCategoryPicker';
import { ShopFileField } from './ShopFileField';
import { ShopKindFilter } from './ShopKindFilter';

interface IProps {
  shopId: string;
  /** `null` = new item. */
  item: IShopItem | null;
  /** After a successful save. */
  onDone: () => void;
}

const PRICE_TYPES: ShopItemPriceType[] = ['fixed', 'from', 'hourly', 'onRequest'];

/** Create / edit a service or product, with up to 6 images. */
export const ShopItemForm = ({ shopId, item, onDone }: IProps) => {
  const { t } = useTranslation('admin-shop');
  const { save, saving } = useShopItemMutate();
  const [kind, setKind] = useState<ShopItemKind>(item?.kind ?? 'service');
  const [categoryId, setCategoryId] = useState<string | null>(item?.categoryId ?? null);
  const [title, setTitle] = useState(item?.title ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [priceType, setPriceType] = useState<ShopItemPriceType>(item?.priceType ?? 'fixed');
  const [amount, setAmount] = useState(item?.amountCents ? String(item.amountCents / 100) : '');
  const [duration, setDuration] = useState(item?.duration ?? '');
  const [removed, setRemoved] = useState<string[]>([]);
  // Ids of the stored images in the wanted order (first = cover).
  const [order, setOrder] = useState<string[]>((item?.images ?? []).map(image => image.id));
  const [files, setFiles] = useState<File[]>([]);
  const kept = order
    .map(id => item?.images.find(image => image.id === id))
    .filter((image): image is IShopItemImage => !!image && !removed.includes(image.id));
  const move = (index: number, by: number) =>
    setOrder(ids => {
      const next = ids.filter(id => !removed.includes(id));
      const target = index + by;
      if (target < 0 || target >= next.length) return ids;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  const free = SHOP_ITEM_IMAGES_MAX - kept.length - files.length;

  const submit = async () => {
    if (description.length > SHOP_ITEM_DESCRIPTION_MAX) {
      return toast.error(t('item.descriptionTooLong'));
    }
    if (!title.trim()) return toast.error(t('item.titleRequired'));
    const cents =
      priceType === 'onRequest' ? null : Math.round(Number(amount.replace(',', '.')) * 100);
    if (priceType !== 'onRequest' && (!Number.isFinite(cents) || (cents ?? 0) <= 0)) {
      return toast.error(t('item.amountRequired'));
    }
    const result = await save(
      shopId,
      item,
      {
        kind,
        categoryId,
        title,
        description,
        priceType,
        amountCents: cents,
        duration,
        status: 'active',
      },
      files,
      removed,
      kept.map(image => image.id)
    );
    if (result.ok) {
      onDone();
    } else {
      toast.error(t(result.reason === 'shop_item_limit' ? 'item.limit' : 'item.error'));
    }
  };

  return (
    <div>
      <div className="space-y-4 p-3">
        {!item && <ShopKindFilter value={kind} onChange={v => v && setKind(v)} withAll={false} />}
        <ShopCategoryPicker shopId={shopId} value={categoryId} onChange={setCategoryId} />
        <Input
          placeholder={t('item.title')}
          value={title}
          maxLength={SHOP_ITEM_TITLE_MAX}
          className="border-border/50"
          onChange={e => setTitle(e.target.value)}
        />
        <HtmlEditor
          id="shop-item-description"
          value={description}
          onChange={setDescription}
          placeholder={t('item.description')}
          headingLevels={[2, 3, 4]}
          features={{
            preset: 'basic',
            emoji: false,
            highlight: true,
            code: true,
            codeBlock: true,
            textAlign: true,
            horizontalRule: true,
          }}
          minHeight={200}
          stickyToolbar
          className="rounded-xl"
        />
        <div className="flex flex-wrap gap-2">
          {PRICE_TYPES.map(type => (
            <Button
              key={type}
              size="sm"
              pill
              variant={priceType === type ? 'default' : 'outline'}
              onClick={() => setPriceType(type)}
            >
              {t(`item.priceType.${type}`)}
            </Button>
          ))}
        </div>
        {priceType !== 'onRequest' && (
          <Input
            inputMode="decimal"
            placeholder={t('item.amount')}
            value={amount}
            className="border-border/50"
            onChange={e => setAmount(e.target.value)}
          />
        )}
        {kind === 'service' && (
          <Input
            placeholder={t('item.duration')}
            value={duration}
            maxLength={SHOP_ITEM_DURATION_MAX}
            className="border-border/50"
            onChange={e => setDuration(e.target.value)}
          />
        )}
        {kept.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {kept.map((image, index) => (
              <Thumb
                key={image.id}
                src={image.url}
                cover={index === 0}
                coverLabel={t('item.cover')}
                onLeft={index > 0 ? () => move(index, -1) : undefined}
                onRight={index < kept.length - 1 ? () => move(index, 1) : undefined}
                onRemove={() => setRemoved(r => [...r, image.id])}
              />
            ))}
          </div>
        )}
        {free > 0 || files.length > 0 ? (
          <ShopFileField
            files={files}
            max={SHOP_ITEM_IMAGES_MAX - kept.length}
            aspectRatio={4 / 3}
            title={t('item.imagesPick')}
            hint={t('item.imagesHint', { count: SHOP_ITEM_IMAGES_MAX })}
            onChange={setFiles}
          />
        ) : null}
      </div>
      <div className="sticky bottom-0 border-t border-border/50 bg-background p-3">
        <Button className="w-full" size="lg" disabled={saving} onClick={() => void submit()}>
          {t('form.save')}
        </Button>
      </div>
    </div>
  );
};

interface IThumbProps {
  src: string;
  cover: boolean;
  coverLabel: string;
  onLeft?: () => void;
  onRight?: () => void;
  onRemove: () => void;
}

/** Stored image: cover badge, move left / right, remove. */
const Thumb = ({ src, cover, coverLabel, onLeft, onRight, onRemove }: IThumbProps) => (
  <div className="relative aspect-square overflow-hidden rounded-lg border border-border/50">
    <img src={src} alt="" className="size-full object-cover" />
    {cover && (
      <span className="absolute left-1 top-1 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">
        {coverLabel}
      </span>
    )}
    <Button
      size="icon-xs"
      variant="secondary"
      className="absolute right-1 top-1"
      onClick={onRemove}
      aria-label="remove"
    >
      <X className="size-3" />
    </Button>
    <div className="absolute inset-x-1 bottom-1 flex justify-between">
      <Button
        size="icon-xs"
        variant="secondary"
        disabled={!onLeft}
        onClick={onLeft}
        aria-label="left"
      >
        <ChevronLeft className="size-3" />
      </Button>
      <Button
        size="icon-xs"
        variant="secondary"
        disabled={!onRight}
        onClick={onRight}
        aria-label="right"
      >
        <ChevronRight className="size-3" />
      </Button>
    </div>
  </div>
);
