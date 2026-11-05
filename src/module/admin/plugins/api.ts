import { parse } from 'graphql';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type {
  IPluginAdoptResult,
  IPluginConfigGetResult,
  IPluginConfigSetResult,
  IPluginCreateResult,
  IPluginScopeResult,
  PluginScope,
  IPluginDeployResult,
  IPluginDownloadResult,
  IPluginFileReadResult,
  IPluginFilesResult,
  IPluginFileWriteResult,
  IPluginListResult,
  IPluginPurgeResult,
  IPluginRemoveResult,
  IPluginStatusResult,
  IPluginUnknownResult,
  IPluginUploadResult,
} from './types';
import type { PluginBump } from './version';

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

const SetScopeMutation = parse(`
  mutation AdminPluginSetScope($pluginId: String!, $scope: [String]!) {
    adminPluginSetScope(pluginId: $pluginId, scope: $scope) { success error errors scope }
  }
`);

const CreateDraftMutation = parse(`
  mutation AdminPluginCreateDraft($name: String!, $scope: [String]) {
    adminPluginCreateDraft(name: $name, scope: $scope) { success error errors plugin }
  }
`);

const DeployDevMutation = parse(`
  mutation AdminPluginDeployDev($pluginId: String!, $bump: String!) {
    adminPluginDeployDev(pluginId: $pluginId, bump: $bump) { success error errors plugin }
  }
`);

const BuildDevMutation = parse(`
  mutation AdminPluginBuildDev($pluginId: String!, $reinstall: Boolean) {
    adminPluginBuildDev(pluginId: $pluginId, reinstall: $reinstall) { success error errors synced }
  }
`);

const InstallDevMutation = parse(`
  mutation AdminPluginInstallDev($pluginId: String!) {
    adminPluginInstallDev(pluginId: $pluginId) { success error errors }
  }
`);

const DownloadQuery = parse(`
  query AdminPluginDownload($pluginId: String!) {
    adminPluginDownload(pluginId: $pluginId) { success error filename data }
  }
`);

const FilesQuery = parse(`
  query AdminPluginFiles($pluginId: String!) {
    adminPluginFiles(pluginId: $pluginId) { success error files }
  }
`);
const FileReadQuery = parse(`
  query AdminPluginFileRead($pluginId: String!, $path: String!) {
    adminPluginFileRead(pluginId: $pluginId, path: $path) { success error path content }
  }
`);
const FileWriteMutation = parse(`
  mutation AdminPluginFileWrite($pluginId: String!, $path: String!, $content: String!) {
    adminPluginFileWrite(pluginId: $pluginId, path: $path, content: $content) { success error errors }
  }
`);

const UnknownQuery = parse(`
  query AdminPluginUnknown {
    adminPluginUnknown { success error plugins }
  }
`);
const AdoptMutation = parse(`
  mutation AdminPluginAdopt($pluginId: String!) {
    adminPluginAdopt(pluginId: $pluginId) { success error errors plugin }
  }
`);
const RemoveUnknownMutation = parse(`
  mutation AdminPluginRemoveUnknown($pluginId: String!) {
    adminPluginRemoveUnknown(pluginId: $pluginId) { success error }
  }
`);

const PurgeDataMutation = parse(`
  mutation AdminPluginPurgeData($pluginId: String!) {
    adminPluginPurgeData(pluginId: $pluginId) { success error deleted }
  }
`);

const ConfigGetQuery = parse(`
  query AdminPluginConfigGet($pluginId: String!) {
    adminPluginConfigGet(pluginId: $pluginId) { success error fields values }
  }
`);
const ConfigSetMutation = parse(`
  mutation AdminPluginConfigSet($pluginId: String!, $values: String!) {
    adminPluginConfigSet(pluginId: $pluginId, values: $values) { success error values errors }
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

  setScope: async (pluginId: string, scope: PluginScope[]): Promise<IPluginScopeResult> => {
    try {
      const response = (await client().mutate({
        mutation: SetScopeMutation as never,
        variables: { pluginId, scope },
      })) as { data?: { adminPluginSetScope?: IPluginScopeResult } };
      return response.data?.adminPluginSetScope ?? { success: false, error: 'unknown' };
    } catch (error) {
      console.warn('[admin-plugins]', (error as Error)?.message);
      return { success: false, error: 'unknown' };
    }
  },

  createDraft: async (input: { name: string; scope: Array<'frontend' | 'admin'> }): Promise<IPluginCreateResult> => {
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

  /** Runs `npm run build` in the development project. Changes no version. */
  buildDev: async (pluginId: string, reinstall = false): Promise<IPluginDeployResult> => {
    try {
      const response = (await client().mutate({
        mutation: BuildDevMutation as never,
        variables: { pluginId, reinstall },
      })) as { data?: { adminPluginBuildDev?: IPluginDeployResult } };
      return response.data?.adminPluginBuildDev ?? { success: false, error: 'unknown' };
    } catch (error) {
      console.warn('[admin-plugins]', (error as Error)?.message);
      return { success: false, error: 'unknown' };
    }
  },

  /** Starts `npm install` in the development project. Runs in the background; the result comes as admin notice. */
  installDev: async (pluginId: string): Promise<IPluginDeployResult> => {
    try {
      const response = (await client().mutate({
        mutation: InstallDevMutation as never,
        variables: { pluginId },
      })) as { data?: { adminPluginInstallDev?: IPluginDeployResult } };
      return response.data?.adminPluginInstallDev ?? { success: false, error: 'unknown' };
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

  /** Editable files of a development project. */
  files: async (pluginId: string): Promise<IPluginFilesResult> => {
    try {
      const response = (await client().query({
        query: FilesQuery as never,
        variables: { pluginId },
        fetchPolicy: 'no-cache',
      })) as { data?: { adminPluginFiles?: IPluginFilesResult } };
      return response.data?.adminPluginFiles ?? { success: false, error: 'unknown' };
    } catch (error) {
      console.warn('[admin-plugins]', (error as Error)?.message);
      return { success: false, error: 'unknown' };
    }
  },

  readFile: async (pluginId: string, path: string): Promise<IPluginFileReadResult> => {
    try {
      const response = (await client().query({
        query: FileReadQuery as never,
        variables: { pluginId, path },
        fetchPolicy: 'no-cache',
      })) as { data?: { adminPluginFileRead?: IPluginFileReadResult } };
      return response.data?.adminPluginFileRead ?? { success: false, error: 'unknown' };
    } catch (error) {
      console.warn('[admin-plugins]', (error as Error)?.message);
      return { success: false, error: 'unknown' };
    }
  },

  writeFile: async (pluginId: string, path: string, content: string): Promise<IPluginFileWriteResult> => {
    try {
      const response = (await client().mutate({
        mutation: FileWriteMutation as never,
        variables: { pluginId, path, content },
      })) as { data?: { adminPluginFileWrite?: IPluginFileWriteResult } };
      return response.data?.adminPluginFileWrite ?? { success: false, error: 'unknown' };
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

  /** Plugin folders on disk that are not registered yet. */
  unknown: async (): Promise<IPluginUnknownResult> => {
    try {
      const response = (await client().query({
        query: UnknownQuery as never,
        fetchPolicy: 'no-cache',
      })) as { data?: { adminPluginUnknown?: IPluginUnknownResult } };
      return response.data?.adminPluginUnknown ?? { success: false, error: 'unknown' };
    } catch (error) {
      console.warn('[admin-plugins]', (error as Error)?.message);
      return { success: false, error: 'unknown' };
    }
  },

  /** Registers an unknown folder as installed. */
  adopt: async (pluginId: string): Promise<IPluginAdoptResult> => {
    try {
      const response = (await client().mutate({
        mutation: AdoptMutation as never,
        variables: { pluginId },
      })) as { data?: { adminPluginAdopt?: IPluginAdoptResult } };
      return response.data?.adminPluginAdopt ?? { success: false, error: 'unknown' };
    } catch (error) {
      console.warn('[admin-plugins]', (error as Error)?.message);
      return { success: false, error: 'unknown' };
    }
  },

  /** Deletes the files of an unknown folder. The registry is not touched. */
  removeUnknown: async (pluginId: string): Promise<IPluginRemoveResult> => {
    try {
      const response = (await client().mutate({
        mutation: RemoveUnknownMutation as never,
        variables: { pluginId },
      })) as { data?: { adminPluginRemoveUnknown?: IPluginRemoveResult } };
      return response.data?.adminPluginRemoveUnknown ?? { success: false, error: 'unknown' };
    } catch (error) {
      console.warn('[admin-plugins]', (error as Error)?.message);
      return { success: false, error: 'unknown' };
    }
  },
  /** Deletes all stored data of a plugin. Works after removal too. Errors: `invalid_plugin_id`, `still_active`. */
  purgeData: async (pluginId: string): Promise<IPluginPurgeResult> => {
    try {
      const response = (await client().mutate({
        mutation: PurgeDataMutation as never,
        variables: { pluginId },
      })) as { data?: { adminPluginPurgeData?: IPluginPurgeResult } };
      return response.data?.adminPluginPurgeData ?? { success: false, error: 'unknown' };
    } catch (error) {
      console.warn('[admin-plugins]', (error as Error)?.message);
      return { success: false, error: 'unknown' };
    }
  },
  /** Configuration schema and global values. Errors: `invalid_plugin_id`, `not_found`. */
  configGet: async (pluginId: string): Promise<IPluginConfigGetResult> => {
    try {
      const response = (await client().query({
        query: ConfigGetQuery as never,
        variables: { pluginId },
        fetchPolicy: 'no-cache',
      })) as { data?: { adminPluginConfigGet?: IPluginConfigGetResult } };
      return response.data?.adminPluginConfigGet ?? { success: false, error: 'unknown' };
    } catch (error) {
      console.warn('[admin-plugins]', (error as Error)?.message);
      return { success: false, error: 'unknown' };
    }
  },
  /** Stores the global values. Errors: `no_config`, `invalid_values`, `validation_failed` (+ `errors`). */
  configSet: async (pluginId: string, values: unknown): Promise<IPluginConfigSetResult> => {
    try {
      const response = (await client().mutate({
        mutation: ConfigSetMutation as never,
        variables: { pluginId, values: JSON.stringify(values) },
      })) as { data?: { adminPluginConfigSet?: IPluginConfigSetResult } };
      return response.data?.adminPluginConfigSet ?? { success: false, error: 'unknown' };
    } catch (error) {
      console.warn('[admin-plugins]', (error as Error)?.message);
      return { success: false, error: 'unknown' };
    }
  },
};
