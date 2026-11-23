import { useGraphQl, useGraphQlGetter } from '@core/mesh';
import { useCallback, useEffect, useState } from 'react';

import {
  ShopRequestMineQuery,
  ShopRequestReplyCreateMutation,
  ShopRequestReplyListQuery,
} from '../graphql/request.reply';
import type { IShopRequest, IShopRequestReply } from '../types/request';

type GraphQlClient = ReturnType<typeof useGraphQl>;
type QueryDocument = Parameters<GraphQlClient['query']>[0]['query'];
type MutationDocument = Parameters<GraphQlClient['mutate']>[0]['mutation'];

interface IPayload {
  success?: boolean;
  replies?: unknown;
  requests?: unknown;
}

/** Conversation of one request: load the replies and add a new one. */
export const useShopRequestReplies = () => {
  const getGraphql = useGraphQlGetter();
  const [replies, setReplies] = useState<IShopRequestReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const load = useCallback(
    async (requestId: string) => {
      setLoading(true);
      try {
        const response = (await getGraphql().query({
          query: ShopRequestReplyListQuery as QueryDocument,
          variables: { id: requestId },
          fetchPolicy: 'no-cache',
        })) as { data?: { shopRequestReplyList?: IPayload | null } };
        const result = response.data?.shopRequestReplyList;
        setReplies(result?.success ? ((result.replies as IShopRequestReply[]) ?? []) : []);
      } catch {
        setReplies([]);
      } finally {
        setLoading(false);
      }
    },
    [getGraphql]
  );

  /** Sends a reply and reloads the thread. Returns `true` on success. */
  const send = useCallback(
    async (requestId: string, message: string): Promise<boolean> => {
      setSending(true);
      try {
        const response = (await getGraphql().mutate({
          mutation: ShopRequestReplyCreateMutation as MutationDocument,
          variables: { id: requestId, message },
        })) as { data?: { shopRequestReplyCreate?: IPayload | null } };
        if (!response.data?.shopRequestReplyCreate?.success) return false;
        await load(requestId);
        return true;
      } catch {
        return false;
      } finally {
        setSending(false);
      }
    },
    [getGraphql, load]
  );

  return { replies, loading, sending, load, send };
};

/** Conversation of the request with this id (`null`: none); loads whenever the id changes. */
export const useShopRequestThread = (requestId: string | null, enabled = true) => {
  const thread = useShopRequestReplies();
  const { load } = thread;
  useEffect(() => {
    if (requestId && enabled) void load(requestId);
  }, [enabled, load, requestId]);
  return thread;
};

/** Own requests of the signed-in user (all pages). */
export const useShopMyRequests = () => {
  const getGraphql = useGraphQlGetter();
  const [requests, setRequests] = useState<IShopRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = (await getGraphql().query({
        query: ShopRequestMineQuery as QueryDocument,
        fetchPolicy: 'no-cache',
      })) as { data?: { shopRequestMine?: IPayload | null } };
      const result = response.data?.shopRequestMine;
      setRequests(result?.success ? ((result.requests as IShopRequest[]) ?? []) : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [getGraphql]);

  return { requests, loading, load };
};
