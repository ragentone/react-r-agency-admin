import { useGraphQl, useGraphQlGetter } from '@core/mesh';
import { useCallback, useState } from 'react';

import {
  DeveloperRoadmapListQuery,
  DeveloperTicketCreateMutation,
  DeveloperTicketMineQuery,
} from '../graphql';
import type { IRoadmapItem, ITicket, ITicketValues } from '../types';

type GraphQlClient = ReturnType<typeof useGraphQl>;
type QueryDocument = Parameters<GraphQlClient['query']>[0]['query'];
type MutationDocument = Parameters<GraphQlClient['mutate']>[0]['mutation'];

const toError = (err: unknown) => (err instanceof Error ? err : new Error(String(err)));

/** Public roadmap (everyone). */
export const useRoadmap = () => {
  const getGraphql = useGraphQlGetter();
  const [items, setItems] = useState<IRoadmapItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = (await getGraphql().query({
        query: DeveloperRoadmapListQuery as QueryDocument,
        fetchPolicy: 'no-cache',
      })) as { data?: { developerRoadmapList?: { success?: boolean; items?: IRoadmapItem[] } } };
      const result = response.data?.developerRoadmapList;
      if (!result?.success) throw new Error('developerRoadmapList failed');
      setItems(result.items ?? []);
    } catch (err) {
      setError(toError(err));
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [getGraphql]);

  return { items, loading, loaded, error, load };
};

/** Own tickets + create (signed-in users). */
export const useMyTickets = () => {
  const getGraphql = useGraphQlGetter();
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = (await getGraphql().query({
        query: DeveloperTicketMineQuery as QueryDocument,
        fetchPolicy: 'no-cache',
      })) as { data?: { developerTicketMine?: { success?: boolean; tickets?: ITicket[] } } };
      const result = response.data?.developerTicketMine;
      if (!result?.success) throw new Error('developerTicketMine failed');
      setTickets(result.tickets ?? []);
    } catch (err) {
      setError(toError(err));
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [getGraphql]);

  const create = useCallback(
    async (values: ITicketValues): Promise<ITicket | null> => {
      setSaving(true);
      try {
        const response = (await getGraphql().mutate({
          mutation: DeveloperTicketCreateMutation as MutationDocument,
          variables: { values },
        })) as { data?: { developerTicketCreate?: { success?: boolean; ticket?: ITicket } } };
        const ticket = response.data?.developerTicketCreate?.ticket;
        if (!response.data?.developerTicketCreate?.success || !ticket) return null;
        setTickets(prev => [ticket, ...prev]);
        return ticket;
      } catch {
        return null;
      } finally {
        setSaving(false);
      }
    },
    [getGraphql]
  );

  const pending = tickets.filter(ticket => ticket.status === 'pending').length;

  return { tickets, pending, loading, loaded, saving, error, load, create };
};
