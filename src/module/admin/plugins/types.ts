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

export interface IPluginPurgeResult {
  success: boolean;
  error?: string | null;
  /** Number of deleted rows. */
  deleted?: number | null;
}

export interface IPluginRemoveResult {
  success: boolean;
  error?: string | null;
}

/** Result of `adminPluginCreateDraft`. The plugin is not registered yet; it shows under "Development". */
export interface IPluginCreateResult {
  success: boolean;
  error?: string | null;
  errors?: string[] | null;
  plugin?: { pluginId: string; version: string; status?: PluginStatus } | null;
}

/** One plugin folder in `plugins/` that the registry does not know (`adminPluginUnknown`). */
export interface IPluginUnknownItem {
  pluginId: string;
  name: string;
  /** Newest version folder, null if there is none. */
  version: string | null;
  versions: string[];
  /** Reason the folder cannot be installed (`manifest_invalid`, `bundle_missing`, …), null if it can. */
  error: string | null;
  errors: string[];
  /** A development project exists in `plugin-dev/`. */
  development: boolean;
}

export interface IPluginUnknownResult {
  success: boolean;
  error?: string | null;
  plugins?: IPluginUnknownItem[] | null;
}

/** Result of `adminPluginAdopt`. */
export interface IPluginAdoptResult {
  success: boolean;
  error?: string | null;
  errors?: string[] | null;
  plugin?: { pluginId: string; version: string; status: PluginStatus } | null;
}


/** Value of one configuration field. */
export type PluginConfigPrimitive = string | number | boolean;

/** Configuration values of one scope, keyed by field key. */
export type PluginConfigValues = Record<string, PluginConfigPrimitive>;

/** Plain text, or one text per language (mirror of runtime `PluginConfigText`). */
export type PluginConfigText = string | Partial<Record<'de' | 'en' | 'ru', string>>;

/** Field of a plugin configuration (mirror of runtime `shared/plugin/plugin.config.schema.ts`). */
export interface IPluginConfigField {
  key: string;
  type: 'string' | 'text' | 'number' | 'boolean' | 'select';
  label?: PluginConfigText;
  help?: PluginConfigText;
  required?: boolean;
  public?: boolean;
  roles?: string[];
  showIf?: { key: string; equals: PluginConfigPrimitive };
  default?: PluginConfigPrimitive;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  options?: string[];
}

/** Problem with one value. `code` is translated (`plugins.config.errors.<code>`), `key` is empty for the whole form. */
export interface IPluginConfigError {
  key: string;
  code: string;
  params?: Record<string, string | number> | null;
}

/** Result of `adminPluginConfigGet`. */
export interface IPluginConfigGetResult {
  success: boolean;
  error?: string | null;
  fields?: IPluginConfigField[] | null;
  values?: PluginConfigValues | null;
}

/** Result of `adminPluginConfigSet`. `errors` only with `validation_failed`. */
export interface IPluginConfigSetResult {
  success: boolean;
  error?: string | null;
  values?: PluginConfigValues | null;
  errors?: IPluginConfigError[] | null;
}

