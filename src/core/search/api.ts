import { parse } from 'graphql';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type { ISearchBundle, ISearchResult } from './types';

/* Parsed instead of codegen `graphql()` – works before codegen has seen the operations. */
const SearchConfigQuery = parse(`
  query SearchConfig {
    searchConfig {
      config {
        bundles { alias label active sortOrder }
      }
    }
  }
`);

const SearchQuery = parse(`
  query Search($searchTerm: String!, $options: searchOptions!, $active: JSON!) {
    search(searchTerm: $searchTerm, options: $options, active: $active) {
      total
      hrtime
      isEmpty
      groupsTotal
      groups
    }
  }
`);

type Client = ReturnType<ReturnType<typeof getMeshClient>['graphql']>;
type QueryDoc = Parameters<Client['query']>[0]['query'];

const query = async <T>(doc: unknown, variables?: Record<string, unknown>) =>
  (await getMeshClient()
    .graphql()
    .query({ query: doc as QueryDoc, variables, fetchPolicy: 'no-cache' })) as { data?: T };

/** Backend `shared/search` (actions/search). */
export const SearchApi = {
  /** Bundles the viewer may search in (auth-only bundles only when signed in). */
  async config(): Promise<ISearchBundle[]> {
    const { data } = await query<{
      searchConfig?: { config?: { bundles?: ISearchBundle[] } };
    }>(SearchConfigQuery);
    return [...(data?.searchConfig?.config?.bundles ?? [])]
      .filter(Boolean)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async search(term: string, active: string[], limit: number, page = 1): Promise<ISearchResult> {
    const { data } = await query<{ search?: Partial<ISearchResult> }>(SearchQuery, {
      searchTerm: term,
      active,
      options: { page, limit },
    });
    const result = data?.search;
    const groups = (result?.groups ?? []).filter(group => group?.items?.length);
    return {
      groups,
      total: groups.reduce((sum, group) => sum + group.items.length, 0),
      hrtime: result?.hrtime ?? '0',
      isEmpty: groups.length === 0,
    };
  },
};
