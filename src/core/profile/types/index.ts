/** Relation between the viewer and the profile owner (backend `IUserRelationData`). */
export type UserRelationStatus = 'pending' | 'accepted' | 'rejected' | 'blocked' | null;

export interface IUserProfileRelation {
  relationId?: string | null;
  requestBy?: string | null;
  sourceId?: string | null;
  targetId?: string | null;
  status?: UserRelationStatus | string | null;
}

/** What the viewer may see (backend `IUserProfileParams`). */
export interface IUserProfileParams {
  canView: boolean;
  /** Own profile (backend spelling "isOwen"). */
  isOwen: boolean;
  notExists: boolean;
  isPublic: boolean;
}

/** Public profile data (backend `IUserProfile`). */
export interface IUserProfile {
  userId: string;
  avatarUrl?: string | null;
  teaserUrl?: string | null;
  alias: string;
  /** Only set when the user shows the e-mail. */
  email?: string | null;
  /** Only set when the user shows the full name. */
  fullName?: string | null;
  online?: boolean | null;
  createdAt?: string | null;
  userType?: string | null;
  gender?: string | null;
  birthday?: string | null;
  lastLogin?: string | null;
  /** HTML – sanitized before rendering. */
  description?: string | null;
}

export interface IUserProfileLoadResult {
  success?: boolean | null;
  userId?: string | null;
  profile?: IUserProfile | null;
  params?: IUserProfileParams | null;
  relation?: IUserProfileRelation | null;
}

export interface IUserProfileQueryResult {
  userProfileLoad?: IUserProfileLoadResult | null;
}

/**
 * Display state of the profile page:
 * - `loading`: first load
 * - `ready`: profile visible
 * - `private`: exists, but the viewer may not see it
 * - `notFound`: user doesn't exist / was deleted
 * - `error`: request failed
 */
export type ProfileViewState = 'loading' | 'ready' | 'private' | 'notFound' | 'error';

/** Payload of the `page-profile` CMS container. */
export interface IProfileCmsPayload {
  userId: string | null;
  profile: IUserProfile | null;
  params: IUserProfileParams | null;
}

export interface ICmsProfileButtonsPayload {
  profile?: IUserProfile;
  onLeave?: () => void;
}
