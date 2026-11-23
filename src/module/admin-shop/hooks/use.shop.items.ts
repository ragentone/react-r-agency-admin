import { ShopItemListQuery, ShopItemLoadQuery } from '../graphql';
import type { IShopItem, ShopItemKind } from '../types';
import { type ShopQueryDoc as Doc, useShopQuery } from './use.shop.query';

/** Items of one shop or – without `shopId` – the feed over all shops. */
export const useShopItems = (shopId: string | null, kind: ShopItemKind | null, search = '') =>
  useShopQuery<IShopItem[]>(
    async client => {
      const res = (await client.query({
        query: ShopItemListQuery as Doc,
        variables: { shopId, kind, search: search || null, page: 0 },
        fetchPolicy: 'no-cache',
      })) as { data?: { shopItemList?: { success?: boolean; items?: IShopItem[] } } };
      return res.data?.shopItemList?.success ? (res.data.shopItemList.items ?? []) : [];
    },
    `${shopId}:${kind}:${search}`,
    []
  );

/** One item with its shop (name, logo). */
export const useShopItem = (id: string | null) =>
  useShopQuery<IShopItem | null>(
    async client => {
      if (!id) return null;
      const res = (await client.query({
        query: ShopItemLoadQuery as Doc,
        variables: { id },
        fetchPolicy: 'no-cache',
      })) as { data?: { shopItemLoad?: { success?: boolean; items?: IShopItem[] } } };
      return res.data?.shopItemLoad?.items?.[0] ?? null;
    },
    id ?? 'new',
    null
  );
