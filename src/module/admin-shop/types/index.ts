export type ShopItemKind = 'service' | 'product';
export type ShopItemPriceType = 'fixed' | 'from' | 'hourly' | 'onRequest';
export type ShopItemStatus = 'active' | 'hidden';

export interface IShopContact {
  email?: string;
  phone?: string;
}

export interface IShop {
  id: string;
  name: string;
  description: string;
  contact: IShopContact;
  logoUrl: string | null;
  bannerUrl: string | null;
  published: boolean;
  canManage: boolean;
  itemCount: number;
  createdAt: string;
}

export interface IShopItemImage {
  id: string;
  url: string;
}

export interface IShopItem {
  id: string;
  shopId: string;
  kind: ShopItemKind;
  title: string;
  description: string;
  priceType: ShopItemPriceType;
  amountCents: number | null;
  duration: string;
  images: IShopItemImage[];
  status: ShopItemStatus;
  createdAt: string;
  shopName?: string;
  shopLogoUrl?: string | null;
}
