export type UserGender = 'male' | 'female' | 'unknown';

export interface IUserDetails {
  firstname?: string | null;
  lastname?: string | null;
}

export interface IUserDescription {
  html?: string | null;
}

export interface IUserSettings {
  public: boolean;
  searchable: boolean;
  showEmail: boolean;
  showFullName: boolean;
}

export interface IUserAccount {
  id: string;
  alias: string;
  email: string;
  userType: string;
  avatarUrl?: string | null;
  details?: IUserDetails | null;
  gender?: UserGender | string | null;
  birthday?: string | null;
  age?: number | null;
  description?: IUserDescription | null;
  superUser?: boolean | null;
  settings?: IUserSettings | null;
  lastLogin?: Date | string | null;
}

export interface IAccountFormValues {
  id: string;
  alias: string;
  email: string;
  firstname: string;
  lastname: string;
  gender: UserGender | string;
  birthday: string;
  description: string;
  public: boolean;
  searchable: boolean;
  showEmail: boolean;
  showFullName: boolean;
}

export interface IAccountUpdateData {
  id: string;
  alias: string;
  gender: string;
  birthday?: string | null;
  details?: IUserDetails | null;
  description?: {
    html?: string | null;
  } | null;
  settings?: {
    public?: boolean;
    searchable?: boolean;
    showEmail?: boolean;
    showFullName?: boolean;
  } | null;
}

export type AccountUpdateData = IAccountUpdateData;
export type UserDetails = IUserDetails;
export type UserDescription = IUserDescription;
export type UserSettings = IUserSettings;
export type UserAccount = IUserAccount;
export type AccountFormValues = IAccountFormValues;
