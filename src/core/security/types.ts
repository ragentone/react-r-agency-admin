/** Mirrors runtime shared/auth/types. */
export type AuthError =
  | 'not_authorized'
  | 'not_found'
  | 'invalid'
  | 'invalid_code'
  | 'invalid_password'
  | 'expired'
  | 'rate_limited'
  | 'exists'
  | 'alias_exists'
  | 'weak_password'
  | 'pwned_password'
  | 'banned'
  | 'blocked'
  | 'not_active'
  | 'not_confirmed'
  | 'sudo_required'
  | 'totp_required'
  | 'limit_reached'
  | 'consent_required'
  | 'code_required'
  | 'admin_required'
  | 'unknown';

export interface IAuthResult {
  success: boolean;
  error?: AuthError | null;
  field?: string | null;
  retryAfter?: number | null;
}

export type AuthMethod =
  'password' | 'code' | 'passkey' | 'register' | 'reset' | 'google' | 'legacy';

export type AuthPlatform =
  | 'iphone'
  | 'ipad'
  | 'android'
  | 'android_tablet'
  | 'mac'
  | 'windows'
  | 'linux'
  | 'chromeos'
  | 'unknown';

export interface IAuthLoginResult extends IAuthResult {
  step?: 'done' | 'totp' | 'register' | 'reset' | null;
  ticket?: string | null;
  authToken?: string | null;
  userId?: string | null;

  meta?: any;
  deletionPending?: string | null;
  bannedUntil?: string | null;
  banReason?: string | null;
}

export interface IAuthMethods {
  password: boolean;
  passkey: boolean;
  code: boolean;
  google: boolean;
}

export interface IAuthIdentifyResult extends IAuthResult {
  exists?: boolean | null;
  email?: string | null;
  methods?: IAuthMethods | null;
}

export interface IAuthOptionsResult extends IAuthResult {
  challengeId?: string | null;
  options?: Record<string, unknown> | null;
}

export interface IAuthSession {
  id: string;
  current: boolean;
  platform: AuthPlatform;
  browser: string;
  standalone: boolean;
  method: AuthMethod;
  ip: string | null;
  createdAt: string;
  lastActiveAt: string;
  online: boolean;
}

export interface IAuthSessionsResult extends IAuthResult {
  sessions?: IAuthSession[] | null;
  count?: number | null;
}

export interface IAuthPasskey {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
  backedUp: boolean;
}

export interface IAuthPasskeysResult extends IAuthResult {
  passkeys?: IAuthPasskey[] | null;
  passkey?: IAuthPasskey | null;
}

export interface IAuthSecurity {
  email: string;
  alias: string;
  userType: string;
  hasPassword: boolean;
  totpEnabled: boolean;
  recoveryLeft: number;
  passkeys: IAuthPasskey[];
  deleteAt: string | null;
  sudoUntil: string | null;
  sessions: number;
}

export interface IAuthSecurityResult extends IAuthResult {
  security?: IAuthSecurity | null;
}

export interface IAuthInviteResult extends IAuthResult {
  token?: string | null;
  expiresAt?: string | null;
  uses?: number | null;
}

export interface IAuthBan {
  banned: boolean;
  bannedUntil: string | null;
  banReason: string | null;
  bannedBy: string | null;
}

export interface IAuthBanResult extends IAuthResult {
  ban?: IAuthBan | null;
}

export interface IAuthRegisterValues {
  alias: string;
  birthday: string;
  password?: string | null;
  parentConsent?: boolean;
  invite?: string | null;
}

export interface IAuthSudoValues {
  password?: string;
  code?: string;
  totp?: string;
  challengeId?: string;
  credential?: unknown;
}
