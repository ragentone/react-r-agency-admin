import { useGraphQlGetter } from '@core/mesh';
import { useState } from 'react';

import {
  ShopCategoryDeleteMutation,
  ShopCategoryListQuery,
  ShopCategorySaveMutation,
} from '../graphql';
import type { IShopCategory } from '../types';
import { type ShopMutationDoc, type ShopQueryDoc, useShopQuery } from './use.shop.query';

/** Categories of the shop (with item counts). */
export const useShopCategories = (shopId: string) =>
  useShopQuery<IShopCategory[]>(
    async client => {
      const res = (await client.query({
        query: ShopCategoryListQuery as ShopQueryDoc,
        variables: { shopId },
        fetchPolicy: 'no-cache',
      })) as { data?: { shopCategoryList?: { success?: boolean; items?: IShopCategory[] } } };
      return res.data?.shopCategoryList?.items ?? [];
    },
    shopId,
    []
  );

/** Create / rename / delete a category; resolves `true` on success. */
export const useShopCategoryMutate = () => {
  const getGraphql = useGraphQlGetter();
  const [saving, setSaving] = useState(false);

  const run = async (
    mutation: ShopMutationDoc,
    variables: Record<string, unknown>,
    key: string
  ) => {
    setSaving(true);
    try {
      const res = (await getGraphql().mutate({ mutation, variables })) as {
        data?: Record<string, { success?: boolean } | null>;
      };
      return !!res.data?.[key]?.success;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    save: (shopId: string, id: string | null, name: string) =>
      run(ShopCategorySaveMutation as ShopMutationDoc, { shopId, id, name }, 'shopCategorySave'),
    remove: (id: string) =>
      run(ShopCategoryDeleteMutation as ShopMutationDoc, { id }, 'shopCategoryDelete'),
  };
};
