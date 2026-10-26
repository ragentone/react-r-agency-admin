import type {
  IAuthBanResult,
  IAuthIdentifyResult,
  IAuthInviteResult,
  IAuthLoginResult,
  IAuthOptionsResult,
  IAuthPasskeysResult,
  IAuthRegisterValues,
  IAuthResult,
  IAuthSecurityResult,
  IAuthSessionsResult,
  IAuthSudoValues,
} from '../types';
import { clientDevice } from '../utils/device';
import { authMutate as mutate, authQuery as query } from './client';
import * as G from './graphql';

type CodePurpose = 'login' | 'register' | 'reset';

/** Runtime `auth*` operations (usable outside React, e.g. notify actions). */
export const AuthApi = {
  // ---- sign-in flow ----
  identify: (identifier: string) =>
    query<IAuthIdentifyResult>(G.AuthIdentifyQuery, 'authIdentify', { identifier }),
  codeSend: (identifier: string, purpose: CodePurpose) =>
    mutate<IAuthResult>(G.AuthCodeSendMutation, 'authCodeSend', { identifier, purpose }),
  codeVerify: (identifier: string, purpose: CodePurpose, code: string) =>
    mutate<IAuthLoginResult>(G.AuthCodeVerifyMutation, 'authCodeVerify', {
      identifier,
      purpose,
      code,
      device: clientDevice(),
    }),
  password: (identifier: string, password: string) =>
    mutate<IAuthLoginResult>(G.AuthPasswordMutation, 'authPassword', {
      identifier,
      password,
      device: clientDevice(),
    }),
  register: (ticket: string, values: IAuthRegisterValues) =>
    mutate<IAuthLoginResult>(G.AuthRegisterMutation, 'authRegister', {
      ticket,
      values,
      device: clientDevice(),
    }),
  reset: (ticket: string, password: string) =>
    mutate<IAuthLoginResult>(G.AuthResetMutation, 'authReset', {
      ticket,
      password,
      device: clientDevice(),
    }),
  totp: (ticket: string, code: string) =>
    mutate<IAuthLoginResult>(G.AuthTotpMutation, 'authTotp', {
      ticket,
      code,
      device: clientDevice(),
    }),
  passkeyOptions: (identifier?: string | null) =>
    mutate<IAuthOptionsResult>(G.AuthPasskeyOptionsMutation, 'authPasskeyOptions', {
      identifier: identifier || null,
    }),
  passkeyLogin: (challengeId: string, credential: unknown) =>
    mutate<IAuthLoginResult>(G.AuthPasskeyLoginMutation, 'authPasskeyLogin', {
      challengeId,
      credential,
      device: clientDevice(),
    }),
  aliasCheck: (alias: string) =>
    query<IAuthResult & { available?: boolean; suggestions?: string[] }>(
      G.AuthAliasCheckQuery,
      'authAliasCheck',
      { alias }
    ),
  inviteInfo: (token: string) =>
    query<IAuthResult & { alias?: string; avatarUrl?: string | null }>(
      G.AuthInviteInfoQuery,
      'authInviteInfo',
      { token }
    ),

  // ---- signed in ----
  security: () => query<IAuthSecurityResult>(G.AuthSecurityQuery, 'authSecurity'),
  sessions: () => query<IAuthSessionsResult>(G.AuthSessionsQuery, 'authSessions'),
  sessionRevoke: (id: string) =>
    mutate<IAuthSessionsResult>(G.AuthSessionRevokeMutation, 'authSessionRevoke', { id }),
  sessionRevokeOthers: () =>
    mutate<IAuthSessionsResult>(G.AuthSessionRevokeOthersMutation, 'authSessionRevokeOthers'),
  sudoCodeSend: () => mutate<IAuthResult>(G.AuthSudoCodeSendMutation, 'authSudoCodeSend'),
  sudoPasskeyOptions: () =>
    mutate<IAuthOptionsResult>(G.AuthSudoPasskeyOptionsMutation, 'authSudoPasskeyOptions'),
  sudo: (values: IAuthSudoValues) =>
    mutate<IAuthResult & { sudoUntil?: string }>(G.AuthSudoMutation, 'authSudo', {
      values,
      device: clientDevice(),
    }),
  passkeyRegisterOptions: () =>
    mutate<IAuthOptionsResult>(G.AuthPasskeyRegisterOptionsMutation, 'authPasskeyRegisterOptions'),
  passkeyRegister: (challengeId: string, credential: unknown, name?: string | null) =>
    mutate<IAuthPasskeysResult>(G.AuthPasskeyRegisterMutation, 'authPasskeyRegister', {
      challengeId,
      credential,
      name: name || null,
      device: clientDevice(),
    }),
  passkeyRename: (id: string, name: string) =>
    mutate<IAuthPasskeysResult>(G.AuthPasskeyRenameMutation, 'authPasskeyRename', { id, name }),
  passkeyRemove: (id: string) =>
    mutate<IAuthPasskeysResult>(G.AuthPasskeyRemoveMutation, 'authPasskeyRemove', { id }),
  totpSetup: () =>
    mutate<IAuthResult & { secret?: string; uri?: string }>(
      G.AuthTotpSetupMutation,
      'authTotpSetup'
    ),
  totpEnable: (code: string) =>
    mutate<IAuthResult & { recoveryCodes?: string[] }>(G.AuthTotpEnableMutation, 'authTotpEnable', {
      code,
    }),
  totpDisable: () => mutate<IAuthResult>(G.AuthTotpDisableMutation, 'authTotpDisable'),
  recoveryRenew: () =>
    mutate<IAuthResult & { recoveryCodes?: string[] }>(
      G.AuthRecoveryRenewMutation,
      'authRecoveryRenew'
    ),
  passwordSet: (password: string) =>
    mutate<IAuthResult>(G.AuthPasswordSetMutation, 'authPasswordSet', { password }),
  emailChange: (email: string) =>
    mutate<IAuthResult>(G.AuthEmailChangeMutation, 'authEmailChange', { email }),
  emailConfirm: (code: string) =>
    mutate<IAuthResult & { email?: string }>(G.AuthEmailConfirmMutation, 'authEmailConfirm', {
      code,
    }),
  exportData: () => mutate<IAuthResult & { data?: unknown }>(G.AuthExportMutation, 'authExport'),
  deleteRequest: () =>
    mutate<IAuthResult & { deleteAt?: string }>(G.AuthDeleteRequestMutation, 'authDeleteRequest'),
  deleteCancel: () => mutate<IAuthResult>(G.AuthDeleteCancelMutation, 'authDeleteCancel'),
  invite: () => query<IAuthInviteResult>(G.AuthInviteQuery, 'authInvite'),
  inviteRenew: () => mutate<IAuthInviteResult>(G.AuthInviteRenewMutation, 'authInviteRenew'),

  // ---- admin ----
  adminBanInfo: (userId: string) =>
    query<IAuthBanResult>(G.AuthAdminBanInfoQuery, 'authAdminBanInfo', { userId }),
  adminBan: (userId: string, until: string | null, reason: string | null) =>
    mutate<IAuthBanResult>(G.AuthAdminBanMutation, 'authAdminBan', { userId, until, reason }),
  adminUnban: (userId: string) =>
    mutate<IAuthBanResult>(G.AuthAdminUnbanMutation, 'authAdminUnban', { userId }),
};
