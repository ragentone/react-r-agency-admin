import { parse } from 'graphql';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type { PluginBump } from './version';
import type {
  IPluginCreateResult,
  IPluginDeployResult,
  IPluginDownloadResult,
  IPluginListResult,
  IPluginRemoveResult,
  IPluginStatusResult,
  IPluginUploadResult,
} from './types';

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

const RemoveMutation = parse(`
  mutation AdminPluginRemove($pluginId: String!) {
    adminPluginRemove(pluginId: $pluginId) { success error }
  }
`);

const CreateDraftMutation = parse(`
  mutation AdminPluginCreateDraft($name: String!, $slots: [String]) {
    adminPluginCreateDraft(name: $name, slots: $slots) { success error errors plugin }
  }
`);

const DeployDevMutation = parse(`
  mutation AdminPluginDeployDev($pluginId: String!, $bump: String!) {
    adminPluginDeployDev(pluginId: $pluginId, bump: $bump) { success error errors plugin }
  }
`);

const DownloadQuery = parse(`
  query AdminPluginDownload($pluginId: String!) {
    adminPluginDownload(pluginId: $pluginId) { success error filename data }
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

  createDraft: async (input: { name: string; slots: string[] }): Promise<IPluginCreateResult> => {
    try {
      const response = (await client().mutate({
        mutation: CreateDraftMutation as never,
        variables: input,
      })) as { data?: { adminPluginCreateDraft?: IPluginCreateResult } };
      return response.data?.adminPluginCreateDraft ?? { success: false, error: 'unknown' };
    } catch (error) {
      console.warn('[admin-plugins]', (error as Error)?.message);
      return { success: false, error: 'unknown' };
    }
  },

  /** Development only: build, install the new version and activate it on this server. */
  deployDev: async (pluginId: string, bump: PluginBump): Promise<IPluginDeployResult> => {
    try {
      const response = (await client().mutate({
        mutation: DeployDevMutation as never,
        variables: { pluginId, bump },
      })) as { data?: { adminPluginDeployDev?: IPluginDeployResult } };
      return response.data?.adminPluginDeployDev ?? { success: false, error: 'unknown' };
    } catch (error) {
      console.warn('[admin-plugins]', (error as Error)?.message);
      return { success: false, error: 'unknown' };
    }
  },

  /** The installed version as ZIP (base64). */
  download: async (pluginId: string): Promise<IPluginDownloadResult> => {
    try {
      const response = (await client().query({
        query: DownloadQuery as never,
        variables: { pluginId },
        fetchPolicy: 'no-cache',
      })) as { data?: { adminPluginDownload?: IPluginDownloadResult } };
      return response.data?.adminPluginDownload ?? { success: false, error: 'unknown' };
    } catch (error) {
      console.warn('[admin-plugins]', (error as Error)?.message);
      return { success: false, error: 'unknown' };
    }
  },

  remove: async (pluginId: string): Promise<IPluginRemoveResult> => {
    try {
      const response = (await client().mutate({
        mutation: RemoveMutation as never,
        variables: { pluginId },
      })) as { data?: { adminPluginRemove?: IPluginRemoveResult } };
      return response.data?.adminPluginRemove ?? { success: false, error: 'unknown' };
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
