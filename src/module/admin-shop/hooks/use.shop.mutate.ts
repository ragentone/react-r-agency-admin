import { useGraphQlGetter } from '@core/mesh';
import { useCallback, useState } from 'react';

import { ShopItemDeleteMutation, ShopItemSaveMutation, ShopSaveMutation } from '../graphql';
import type { IShopContact, IShopItem, ShopItemKind, ShopItemPriceType } from '../types';
import type { ShopMutationDoc } from './use.shop.query';

export interface IShopFormValues {
  name: string;
  description: string;
  contact: IShopContact;
  published: boolean;
}

export interface IShopItemFormValues {
  kind: ShopItemKind;
  categoryId: string | null;
  title: string;
  description: string;
  priceType: ShopItemPriceType;
  amountCents: number | null;
  duration: string;
  status: 'active' | 'hidden';
}

export interface IShopMutateResult {
  ok: boolean;
  /** Server error message, e.g. `shop_limit`, `shop_item_limit`, `shop_images_max`. */
  reason: string | null;
  /** Id of the saved shop (shop save only). */
  id?: string;
}

type GqlError = { message?: string };

/** Wraps one mutation: `ok` on success, `reason` = server error message otherwise. */
const useMutate = () => {
  const getGraphql = useGraphQlGetter();
  const [saving, setSaving] = useState(false);

  const run = useCallback(
    async (
      mutation: ShopMutationDoc,
      variables: Record<string, unknown>,
      field: string
    ): Promise<IShopMutateResult> => {
      setSaving(true);
      try {
        const res = (await getGraphql().mutate({ mutation, variables })) as {
          data?: Record<string, { success?: boolean; shops?: { id: string }[] } | null>;
        };
        const payload = res.data?.[field];
        return { ok: !!payload?.success, reason: null, id: payload?.shops?.[0]?.id };
      } catch (error) {
        const first = (error as { graphQLErrors?: GqlError[] }).graphQLErrors?.[0];
        return { ok: false, reason: first?.message ?? (error as Error).message ?? null };
      } finally {
        setSaving(false);
      }
    },
    [getGraphql]
  );

  return { run, saving };
};

/** Sets up or edits the one shop. */
export const useShopMutate = () => {
  const { run, saving } = useMutate();
  const save = (values: IShopFormValues, logo: File | null, banner: File | null) =>
    run(
      ShopSaveMutation as ShopMutationDoc,
      { values, logoFile: logo ? [logo] : null, bannerFile: banner ? [banner] : null },
      'shopSave'
    );
  return { save, saving };
};

/** Create / edit / delete an item with images. */
export const useShopItemMutate = () => {
  const { run, saving } = useMutate();
  const save = (
    shopId: string,
    item: IShopItem | null,
    values: IShopItemFormValues,
    files: File[],
    removeImageIds: string[],
    imageOrder: string[]
  ) =>
    run(
      ShopItemSaveMutation as ShopMutationDoc,
      {
        shopId,
        id: item?.id ?? null,
        values,
        imageFiles: files.length ? files : null,
        removeImageIds: removeImageIds.length ? removeImageIds : null,
        imageOrder,
      },
      'shopItemSave'
    );
  const remove = (id: string) =>
    run(ShopItemDeleteMutation as ShopMutationDoc, { id }, 'shopItemDelete');
  return { save, remove, saving };
};
