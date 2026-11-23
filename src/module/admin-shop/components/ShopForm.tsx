import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { Textarea } from '@ui/shad-cn/components/textarea.tsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SHOP_DESCRIPTION_MAX, SHOP_NAME_MAX } from '../const';
import { useShopMutate } from '../hooks';
import type { IShop } from '../types';
import { ShopFileField } from './ShopFileField';

interface IProps {
  /** `null` = create a new shop. */
  shop: IShop | null;
  onSaved: () => void;
}

/** Shop settings form – used as tab in the manage page and as page for a new shop. */
export const ShopForm = ({ shop, onSaved }: IProps) => {
  const { t } = useTranslation('admin-shop');
  const { save, saving } = useShopMutate();
  const [name, setName] = useState(shop?.name ?? '');
  const [description, setDescription] = useState(shop?.description ?? '');
  const [email, setEmail] = useState(shop?.contact.email ?? '');
  const [phone, setPhone] = useState(shop?.contact.phone ?? '');
  const [published, setPublished] = useState(shop?.published ?? true);
  const [logo, setLogo] = useState<File[]>([]);
  const [banner, setBanner] = useState<File[]>([]);

  const submit = async () => {
    if (!name.trim()) return toast.error(t('form.nameRequired'));
    const result = await save(
      { name, description, contact: { email, phone }, published },
      logo[0] ?? null,
      banner[0] ?? null
    );
    if (result.ok) {
      toast.success(t('form.saved'));
      setLogo([]);
      setBanner([]);
      onSaved();
    } else {
      toast.error(result.reason === 'shop_limit' ? t('form.limit') : t('form.error'));
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Input
        placeholder={t('form.name')}
        value={name}
        maxLength={SHOP_NAME_MAX}
        className="border-border/50"
        onChange={e => setName(e.target.value)}
      />
      <Textarea
        placeholder={t('form.description')}
        value={description}
        rows={4}
        maxLength={SHOP_DESCRIPTION_MAX}
        className="border-border/50"
        onChange={e => setDescription(e.target.value)}
      />
      <Input
        type="email"
        placeholder={t('form.email')}
        value={email}
        className="border-border/50"
        onChange={e => setEmail(e.target.value)}
      />
      <Input
        type="tel"
        placeholder={t('form.phone')}
        value={phone}
        className="border-border/50"
        onChange={e => setPhone(e.target.value)}
      />
      <div className="space-y-1">
        <span className="text-caption text-muted-foreground">{t('form.banner')}</span>
        {shop?.bannerUrl && banner.length === 0 && (
          <img
            src={shop.bannerUrl}
            alt=""
            className="aspect-3/1 w-full rounded-xl border border-border/50 object-cover"
          />
        )}
        <ShopFileField
          files={banner}
          max={1}
          aspectRatio={3}
          title={t('form.bannerPick')}
          onChange={setBanner}
        />
      </div>
      <div className="space-y-1">
        <span className="text-caption text-muted-foreground">{t('form.logo')}</span>
        {shop?.logoUrl && logo.length === 0 && (
          <Avatar className="size-20 border border-border/50">
            <AvatarImage src={shop.logoUrl} />
            <AvatarFallback>{shop.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
        )}
        <ShopFileField
          files={logo}
          max={1}
          aspectRatio={1}
          shape="circle"
          title={t('form.logoPick')}
          onChange={setLogo}
        />
      </div>
      <label className="flex items-center justify-between gap-3 text-body">
        {t('form.published')}
        <Switch checked={published} onCheckedChange={setPublished} />
      </label>
      <div className="flex gap-2 pt-2">
        <Button className="flex-1" size="lg" disabled={saving} onClick={() => void submit()}>
          {t('form.save')}
        </Button>
      </div>
    </div>
  );
};
