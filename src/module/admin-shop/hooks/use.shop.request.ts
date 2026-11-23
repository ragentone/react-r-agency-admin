import { useGraphQl, useGraphQlGetter } from '@core/mesh';
import { useCallback, useState } from 'react';

import {
  ShopRequestDeleteMutation,
  ShopRequestListQuery,
  ShopRequestStatusMutation,
  ShopRequestValueMutation,
} from '../graphql/request';
import type { IShopRequest, ShopRequestStatus } from '../types/request';

type GraphQlClient = ReturnType<typeof useGraphQl>;
type QueryDocument = Parameters<GraphQlClient['query']>[0]['query'];
type MutationDocument = Parameters<GraphQlClient['mutate']>[0]['mutation'];

interface IRequestPayload {
  success?: boolean | null;
  requests?: unknown;
  errors?: { name?: string; message?: string }[] | null;
}

/** Requests of a shop for the owner and moderators, with status changes. */
export const useShopInbox = () => {
  const getGraphql = useGraphQlGetter();
  const [requests, setRequests] = useState<IShopRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (shopId: string) => {
      setLoading(true);
      try {
        const response = (await getGraphql().query({
          query: ShopRequestListQuery as QueryDocument,
          variables: { id: shopId },
          fetchPolicy: 'no-cache',
        })) as { data?: { shopRequestList?: IRequestPayload | null } };
        const result = response.data?.shopRequestList;
        setRequests(result?.success ? ((result.requests as IShopRequest[]) ?? []) : []);
      } catch {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    },
    [getGraphql]
  );

  const setStatus = useCallback(
    async (shopId: string, id: string, status: ShopRequestStatus): Promise<boolean> => {
      try {
        const response = (await getGraphql().mutate({
          mutation: ShopRequestStatusMutation as MutationDocument,
          variables: { id, status },
        })) as { data?: { shopRequestStatus?: IRequestPayload | null } };
        if (!response.data?.shopRequestStatus?.success) return false;
        await load(shopId);
        return true;
      } catch {
        return false;
      }
    },
    [getGraphql, load]
  );

  /** Sets or clears the job value (cents) and reloads the list. Returns `true` on success. */
  const setValue = useCallback(
    async (shopId: string, id: string, valueCents: number | null): Promise<boolean> => {
      try {
        const response = (await getGraphql().mutate({
          mutation: ShopRequestValueMutation as MutationDocument,
          variables: { id, valueCents },
        })) as { data?: { shopRequestValue?: IRequestPayload | null } };
        if (!response.data?.shopRequestValue?.success) return false;
        await load(shopId);
        return true;
      } catch {
        return false;
      }
    },
    [getGraphql, load]
  );

  /** Deletes a request and reloads the list. Returns `true` on success. */
  const remove = useCallback(
    async (shopId: string, id: string): Promise<boolean> => {
      try {
        const response = (await getGraphql().mutate({
          mutation: ShopRequestDeleteMutation as MutationDocument,
          variables: { id },
        })) as { data?: { shopRequestDelete?: IRequestPayload | null } };
        if (!response.data?.shopRequestDelete?.success) return false;
        await load(shopId);
        return true;
      } catch {
        return false;
      }
    },
    [getGraphql, load]
  );

  return { requests, loading, load, setStatus, setValue, remove };
};
