import { parse } from 'graphql';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type { IAdminDoc } from './types';

/* Parsed here instead of codegen `graphql()` (works before Vite saw the new operation). */
const DocsQuery = parse(`
  query AdminDocsList {
    adminSystemDocsList { success error docs }
  }
`);

interface IDocsResponse {
  data?: { adminSystemDocsList?: { success?: boolean; docs?: IAdminDoc[] | null } | null };
}

/** Admin only (`admin:user`, checked in the runtime `shared/system`). */
export const AdminDocsApi = {
  list: async (): Promise<{ success: boolean; docs: IAdminDoc[] }> => {
    try {
      const response = (await getMeshClient().graphql().query({
        query: DocsQuery as never,
        fetchPolicy: 'no-cache',
      })) as IDocsResponse;
      const result = response.data?.adminSystemDocsList;
      return { success: result?.success === true, docs: result?.docs ?? [] };
    } catch (error) {
      console.warn('[admin-docs]', (error as Error)?.message);
      return { success: false, docs: [] };
    }
  },
};
