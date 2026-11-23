import { ShopGetQuery } from '../graphql';
import type { IShop } from '../types';
import { type ShopQueryDoc as Doc, useShopQuery } from './use.shop.query';

/** The one shop (`null` while it is not set up yet). */
export const useShop = () =>
  useShopQuery<IShop | null>(
    async client => {
      const res = (await client.query({
        query: ShopGetQuery as Doc,
        fetchPolicy: 'no-cache',
      })) as { data?: { shopGet?: { success?: boolean; shops?: IShop[] } } };
      return res.data?.shopGet?.shops?.[0] ?? null;
    },
    'shop',
    null
  );
