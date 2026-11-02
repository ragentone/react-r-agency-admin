import { parse } from 'graphql';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type { IPluginListResult, IPluginStatusResult, IPluginUploadResult } from './types';

/* Parsed here instead of codegen `graphql()` (same as module/admin/system/api.ts). */
const ListQuery = parse(`
  query AdminPluginList($search: String) {
    adminPluginList(search: $search) { success error plugins }
  }
`);
const UploadMutation = parse(`
  mutation AdminPluginUpload($file: [Upload]!) {
    adminPluginUpload(file: $file) { success error errors plugin }
  }
`);

const SetStatusMutation = parse(`
  mutation AdminPluginSetStatus($pluginId: String!, $status: String!) {
    adminPluginSetStatus(pluginId: $pluginId, status: $status) { success error plugin }
  }
`);

const client = () => getMeshClient().graphql();

/** Admin only (`admin:user`, checked in the runtime `shared/plugin`). */
export const PluginApi = {
  list: async (search?: string): Promise<IPluginListResult> => {
    try {
      const response = (await client().query({
        query: ListQuery as never,
        variables: { search },
        fetchPolicy: 'no-cache',
      })) as { data?: { adminPluginList?: IPluginListResult } };
      return response.data?.adminPluginList ?? { success: false, error: 'unknown' };
    } catch (error) {
      console.warn('[admin-plugins]', (error as Error)?.message);
      return { success: false, error: 'unknown' };
    }
  },

  setStatus: async (
    pluginId: string,
    status: 'active' | 'inactive'
  ): Promise<IPluginStatusResult> => {
    try {
      const response = (await client().mutate({
        mutation: SetStatusMutation as never,
        variables: { pluginId, status },
      })) as { data?: { adminPluginSetStatus?: IPluginStatusResult } };
      return response.data?.adminPluginSetStatus ?? { success: false, error: 'unknown' };
    } catch (error) {
      console.warn('[admin-plugins]', (error as Error)?.message);
      return { success: false, error: 'unknown' };
    }
  },

  upload: async (file: File): Promise<IPluginUploadResult> => {
    try {
      const response = (await client().mutate({
        mutation: UploadMutation as never,
        variables: { file: [file] },
      })) as { data?: { adminPluginUpload?: IPluginUploadResult } };
      return response.data?.adminPluginUpload ?? { success: false, error: 'unknown' };
    } catch (error) {
      console.warn('[admin-plugins]', (error as Error)?.message);
      return { success: false, error: 'unknown' };
    }
  },
};
