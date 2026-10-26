/**
 * Interfaces for UserConfig GraphQL Query
 */

export interface IUserConfigSettings {
  public?: boolean | null;
  searchable?: boolean | null;
  showFullName?: boolean | null;
  showEmail?: boolean | null;
}

export type IUserMetaSettings = IUserConfigSettings;

export interface IUserMetaData {
  id?: string | null;
  alias?: string | null;
  avatarUrl?: string | null;
  teaserUrl?: string | null;
  lastLogin?: string | number | Date | null | unknown;
  email?: string | null;
  role?: string | string[] | unknown;
  superUser?: boolean | null;
  userType?: string | null;
  settings?: IUserConfigSettings | null;
}

export type IUserConfigMeta = IUserMetaData;
export type IUserMateData = IUserMetaData;
export type IUserMate = IUserMetaData;
export type IUserMeta = IUserMetaData;

export interface IUserLoadConfig {
  authorized?: boolean | null;
  refreshToken?: string | null;
  userId?: string | null;
  meta?: IUserMetaData | null;
}

export type IUserConfigReturn = IUserLoadConfig;

export interface IUserConfigResponse {
  userLoadConfig?: IUserLoadConfig | null;
}

export type IUserConfigQuery = IUserConfigResponse;
