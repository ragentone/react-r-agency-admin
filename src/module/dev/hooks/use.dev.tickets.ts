import { useGraphQl, useGraphQlGetter } from '@core/mesh';
import { useCallback, useState } from 'react';

import {
  DeveloperTicketAcceptMutation,
  DeveloperTicketListQuery,
  DeveloperTicketRejectMutation,
} from '../graphql';
import type { ITicket } from '../types';

type GraphQlClient = ReturnType<typeof useGraphQl>;
type QueryDocument = Parameters<GraphQlClient['query']>[0]['query'];
type MutationDocument = Parameters<GraphQlClient['mutate']>[0]['mutation'];

/** Devs: all tickets + accept (creates a todo) / reject. */
export const useDevTickets = () => {
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
        query: DeveloperTicketListQuery as QueryDocument,
        variables: {},
        fetchPolicy: 'no-cache',
      })) as { data?: { developerTicketList?: { success?: boolean; tickets?: ITicket[] } } };
      const result = response.data?.developerTicketList;
      if (!result?.success) throw new Error('developerTicketList failed');
      setTickets(result.tickets ?? []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [getGraphql]);

  /** Replaces the reviewed ticket (keeps the author, the mutation doesn't send it). */
  const merge = (next: ITicket) =>
    setTickets(prev => prev.map(item => (item.id === next.id ? { ...item, ...next } : item)));

  const accept = useCallback(
    async (id: string, note: string, isPublic: boolean): Promise<boolean> => {
      setSaving(true);
      try {
        const response = (await getGraphql().mutate({
          mutation: DeveloperTicketAcceptMutation as MutationDocument,
          variables: { id, note: note || null, public: isPublic },
        })) as { data?: { developerTicketAccept?: { success?: boolean; ticket?: ITicket } } };
        const ticket = response.data?.developerTicketAccept?.ticket;
        if (!response.data?.developerTicketAccept?.success || !ticket) return false;
        merge(ticket);
        return true;
      } catch {
        return false;
      } finally {
        setSaving(false);
      }
    },
    [getGraphql]
  );

  const reject = useCallback(
    async (id: string, note: string): Promise<boolean> => {
      setSaving(true);
      try {
        const response = (await getGraphql().mutate({
          mutation: DeveloperTicketRejectMutation as MutationDocument,
          variables: { id, note },
        })) as { data?: { developerTicketReject?: { success?: boolean; ticket?: ITicket } } };
        const ticket = response.data?.developerTicketReject?.ticket;
        if (!response.data?.developerTicketReject?.success || !ticket) return false;
        merge(ticket);
        return true;
      } catch {
        return false;
      } finally {
        setSaving(false);
      }
    },
    [getGraphql]
  );

  const pending = tickets.filter(ticket => ticket.status === 'pending').length;

  return { tickets, pending, loading, loaded, saving, error, load, accept, reject };
};
