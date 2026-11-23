import { useGraphQl, useGraphQlGetter } from '@core/mesh';
import { useCallback, useState } from 'react';

import {
  ShopRequestNoteCreateMutation,
  ShopRequestNoteDeleteMutation,
  ShopRequestNoteListQuery,
} from '../graphql/request.note';
import type { IShopRequestNote } from '../types/request';

type GraphQlClient = ReturnType<typeof useGraphQl>;
type QueryDocument = Parameters<GraphQlClient['query']>[0]['query'];
type MutationDocument = Parameters<GraphQlClient['mutate']>[0]['mutation'];

interface IPayload {
  success?: boolean;
  notes?: unknown;
}

/** Internal notes of the customer behind a request (every mutation returns the fresh list). */
export const useShopRequestNotes = () => {
  const getGraphql = useGraphQlGetter();
  const [notes, setNotes] = useState<IShopRequestNote[]>([]);
  const [saving, setSaving] = useState(false);

  const apply = useCallback((payload?: IPayload | null): boolean => {
    if (!payload?.success) return false;
    setNotes((payload.notes as IShopRequestNote[]) ?? []);
    return true;
  }, []);

  const load = useCallback(
    async (requestId: string) => {
      try {
        const response = (await getGraphql().query({
          query: ShopRequestNoteListQuery as QueryDocument,
          variables: { id: requestId },
          fetchPolicy: 'no-cache',
        })) as { data?: { shopRequestNoteList?: IPayload | null } };
        if (!apply(response.data?.shopRequestNoteList)) setNotes([]);
      } catch {
        setNotes([]);
      }
    },

    [apply, getGraphql]
  );

  const add = useCallback(
    async (requestId: string, message: string): Promise<boolean> => {
      setSaving(true);
      try {
        const response = (await getGraphql().mutate({
          mutation: ShopRequestNoteCreateMutation as MutationDocument,
          variables: { id: requestId, message },
        })) as { data?: { shopRequestNoteCreate?: IPayload | null } };
        return apply(response.data?.shopRequestNoteCreate);
      } catch {
        return false;
      } finally {
        setSaving(false);
      }
    },

    [apply, getGraphql]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = (await getGraphql().mutate({
          mutation: ShopRequestNoteDeleteMutation as MutationDocument,
          variables: { id },
        })) as { data?: { shopRequestNoteDelete?: IPayload | null } };
        return apply(response.data?.shopRequestNoteDelete);
      } catch {
        return false;
      }
    },

    [apply, getGraphql]
  );

  return { notes, saving, load, add, remove };
};
