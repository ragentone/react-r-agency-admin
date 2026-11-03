export type PluginStatus = 'draft' | 'installed' | 'active' | 'inactive';

/** One row of `adminPluginList` (runtime `shared/plugin`). */
export interface IPluginListItem {
  pluginId: string;
  name: string;
  version: string;
  minAppVersion: string;
  status: PluginStatus;
  /** Created as development template in the admin (stays set after activation). */
  development: boolean;
}

export interface IPluginListResult {
  success: boolean;
  error?: string | null;
  plugins?: IPluginListItem[] | null;
}

/** Result of `adminPluginUpload`. `error` is a code, `errors` the details found by the backend. */
export interface IPluginUploadResult {
  success: boolean;
  error?: string | null;
  errors?: string[] | null;
  plugin?: { id: string; name: string; version: string } | null;
}

/** Upload error codes the backend can return (translation keys `plugins.errors.<code>`). */
export const PLUGIN_UPLOAD_ERROR_CODES = [
  'no_file',
  'not_zip',
  'too_large',
  'zip_unreadable',
  'package_invalid',
  'manifest_missing',
  'manifest_invalid',
  'version_not_newer',
  'not_authorized',
] as const;

/** Upload limit – same as the backend (`PLUGIN_UPLOAD_MAX_BYTES`). */
export const PLUGIN_UPLOAD_MAX_MB = 20;

/** Result of `adminPluginSetStatus`. */
export interface IPluginStatusResult {
  success: boolean;
  error?: string | null;
  plugin?: { pluginId: string; version: string; status: PluginStatus } | null;
}

/** Result of `adminPluginRemove`. */
export interface IPluginDeployResult {
  success: boolean;
  error?: string | null;
  errors?: string[] | null;
  plugin?: { pluginId: string; version: string; status: PluginStatus } | null;
  synced?: boolean | null;
}

export interface IPluginDownloadResult {
  success: boolean;
  error?: string | null;
  filename?: string | null;
  /** Base64 of the ZIP. */
  data?: string | null;
}

export interface IPluginFileItem {
  path: string;
  size: number;
}

export interface IPluginFilesResult {
  success: boolean;
  error?: string | null;
  files?: IPluginFileItem[] | null;
}

export interface IPluginFileReadResult {
  success: boolean;
  error?: string | null;
  path?: string | null;
  content?: string | null;
}

export interface IPluginFileWriteResult {
  success: boolean;
  error?: string | null;
  errors?: string[] | null;
}

export interface IPluginRemoveResult {
  success: boolean;
  error?: string | null;
}

/** Slots a plugin may declare (same list as the backend `PLUGIN_SLOTS`). */
export const PLUGIN_SLOT_OPTIONS = [
  'home.widget',
  'menu',
  'settings',
  'admin.tab',
  'feed.renderer',
  'notification',
  'chat.action',
] as const;

/** Result of `adminPluginCreateDraft`. */
export interface IPluginCreateResult {
  success: boolean;
  error?: string | null;
  errors?: string[] | null;
  plugin?: { pluginId: string; version: string; status: PluginStatus } | null;
}
