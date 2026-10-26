import { graphql } from '@generated/graphql';

/**
 * Runtime shared/auth operations (`auth<Name>`). Unknown to the generated schema until the
 * runtime runs and `npm run dev` regenerated the documents – the API casts them (see api/client).
 */

export const AuthIdentifyQuery = graphql(`
  query AuthIdentify($identifier: String!) {
    authIdentify(identifier: $identifier) {
      success
      error
      field
      retryAfter
      exists
      email
      methods
    }
  }
`);

export const AuthCodeSendMutation = graphql(`
  mutation AuthCodeSend($identifier: String!, $purpose: String!) {
    authCodeSend(identifier: $identifier, purpose: $purpose) {
      success
      error
      field
      retryAfter
    }
  }
`);

export const AuthCodeVerifyMutation = graphql(`
  mutation AuthCodeVerify($identifier: String!, $purpose: String!, $code: String!, $device: JSON) {
    authCodeVerify(identifier: $identifier, purpose: $purpose, code: $code, device: $device) {
      success
      error
      field
      retryAfter
      step
      ticket
      authToken
      userId
      meta
      deletionPending
      bannedUntil
      banReason
    }
  }
`);

export const AuthPasswordMutation = graphql(`
  mutation AuthPassword($identifier: String!, $password: String!, $device: JSON) {
    authPassword(identifier: $identifier, password: $password, device: $device) {
      success
      error
      field
      retryAfter
      step
      ticket
      authToken
      userId
      meta
      deletionPending
      bannedUntil
      banReason
    }
  }
`);

export const AuthRegisterMutation = graphql(`
  mutation AuthRegister($ticket: String!, $values: JSON!, $device: JSON) {
    authRegister(ticket: $ticket, values: $values, device: $device) {
      success
      error
      field
      retryAfter
      step
      ticket
      authToken
      userId
      meta
      deletionPending
      bannedUntil
      banReason
    }
  }
`);

export const AuthResetMutation = graphql(`
  mutation AuthReset($ticket: String!, $password: String!, $device: JSON) {
    authReset(ticket: $ticket, password: $password, device: $device) {
      success
      error
      field
      retryAfter
      step
      ticket
      authToken
      userId
      meta
      deletionPending
      bannedUntil
      banReason
    }
  }
`);

export const AuthTotpMutation = graphql(`
  mutation AuthTotp($ticket: String!, $code: String!, $device: JSON) {
    authTotp(ticket: $ticket, code: $code, device: $device) {
      success
      error
      field
      retryAfter
      step
      ticket
      authToken
      userId
      meta
      deletionPending
      bannedUntil
      banReason
    }
  }
`);

export const AuthPasskeyOptionsMutation = graphql(`
  mutation AuthPasskeyOptions($identifier: String) {
    authPasskeyOptions(identifier: $identifier) {
      success
      error
      field
      retryAfter
      challengeId
      options
    }
  }
`);

export const AuthPasskeyLoginMutation = graphql(`
  mutation AuthPasskeyLogin($challengeId: String!, $credential: JSON!, $device: JSON) {
    authPasskeyLogin(challengeId: $challengeId, credential: $credential, device: $device) {
      success
      error
      field
      retryAfter
      step
      ticket
      authToken
      userId
      meta
      deletionPending
      bannedUntil
      banReason
    }
  }
`);

export const AuthAliasCheckQuery = graphql(`
  query AuthAliasCheck($alias: String!) {
    authAliasCheck(alias: $alias) {
      success
      error
      field
      retryAfter
      available
      suggestions
    }
  }
`);

export const AuthInviteInfoQuery = graphql(`
  query AuthInviteInfo($token: String!) {
    authInviteInfo(token: $token) {
      success
      error
      field
      retryAfter
      alias
      avatarUrl
    }
  }
`);

export const AuthSecurityQuery = graphql(`
  query AuthSecurity {
    authSecurity {
      success
      error
      field
      retryAfter
      security
    }
  }
`);

export const AuthSessionsQuery = graphql(`
  query AuthSessions {
    authSessions {
      success
      error
      field
      retryAfter
      sessions
      count
    }
  }
`);

export const AuthSessionRevokeMutation = graphql(`
  mutation AuthSessionRevoke($id: ID!) {
    authSessionRevoke(id: $id) {
      success
      error
      field
      retryAfter
      sessions
      count
    }
  }
`);

export const AuthSessionRevokeOthersMutation = graphql(`
  mutation AuthSessionRevokeOthers {
    authSessionRevokeOthers {
      success
      error
      field
      retryAfter
      sessions
      count
    }
  }
`);

export const AuthSudoCodeSendMutation = graphql(`
  mutation AuthSudoCodeSend {
    authSudoCodeSend {
      success
      error
      field
      retryAfter
    }
  }
`);

export const AuthSudoPasskeyOptionsMutation = graphql(`
  mutation AuthSudoPasskeyOptions {
    authSudoPasskeyOptions {
      success
      error
      field
      retryAfter
      challengeId
      options
    }
  }
`);

export const AuthSudoMutation = graphql(`
  mutation AuthSudo($values: JSON!, $device: JSON) {
    authSudo(values: $values, device: $device) {
      success
      error
      field
      retryAfter
      sudoUntil
    }
  }
`);

export const AuthPasskeyRegisterOptionsMutation = graphql(`
  mutation AuthPasskeyRegisterOptions {
    authPasskeyRegisterOptions {
      success
      error
      field
      retryAfter
      challengeId
      options
    }
  }
`);

export const AuthPasskeyRegisterMutation = graphql(`
  mutation AuthPasskeyRegister(
    $challengeId: String!
    $credential: JSON!
    $name: String
    $device: JSON
  ) {
    authPasskeyRegister(
      challengeId: $challengeId
      credential: $credential
      name: $name
      device: $device
    ) {
      success
      error
      field
      retryAfter
      passkeys
      passkey
    }
  }
`);

export const AuthPasskeyRenameMutation = graphql(`
  mutation AuthPasskeyRename($id: ID!, $name: String!) {
    authPasskeyRename(id: $id, name: $name) {
      success
      error
      field
      retryAfter
      passkeys
      passkey
    }
  }
`);

export const AuthPasskeyRemoveMutation = graphql(`
  mutation AuthPasskeyRemove($id: ID!) {
    authPasskeyRemove(id: $id) {
      success
      error
      field
      retryAfter
      passkeys
      passkey
    }
  }
`);

export const AuthTotpSetupMutation = graphql(`
  mutation AuthTotpSetup {
    authTotpSetup {
      success
      error
      field
      retryAfter
      secret
      uri
    }
  }
`);

export const AuthTotpEnableMutation = graphql(`
  mutation AuthTotpEnable($code: String!) {
    authTotpEnable(code: $code) {
      success
      error
      field
      retryAfter
      recoveryCodes
    }
  }
`);

export const AuthTotpDisableMutation = graphql(`
  mutation AuthTotpDisable {
    authTotpDisable {
      success
      error
      field
      retryAfter
    }
  }
`);

export const AuthRecoveryRenewMutation = graphql(`
  mutation AuthRecoveryRenew {
    authRecoveryRenew {
      success
      error
      field
      retryAfter
      recoveryCodes
    }
  }
`);

export const AuthPasswordSetMutation = graphql(`
  mutation AuthPasswordSet($password: String!) {
    authPasswordSet(password: $password) {
      success
      error
      field
      retryAfter
    }
  }
`);

export const AuthEmailChangeMutation = graphql(`
  mutation AuthEmailChange($email: String!) {
    authEmailChange(email: $email) {
      success
      error
      field
      retryAfter
    }
  }
`);

export const AuthEmailConfirmMutation = graphql(`
  mutation AuthEmailConfirm($code: String!) {
    authEmailConfirm(code: $code) {
      success
      error
      field
      retryAfter
      email
    }
  }
`);

export const AuthExportMutation = graphql(`
  mutation AuthExport {
    authExport {
      success
      error
      field
      retryAfter
      data
    }
  }
`);

export const AuthDeleteRequestMutation = graphql(`
  mutation AuthDeleteRequest {
    authDeleteRequest {
      success
      error
      field
      retryAfter
      deleteAt
    }
  }
`);

export const AuthDeleteCancelMutation = graphql(`
  mutation AuthDeleteCancel {
    authDeleteCancel {
      success
      error
      field
      retryAfter
    }
  }
`);

export const AuthInviteQuery = graphql(`
  query AuthInvite {
    authInvite {
      success
      error
      field
      retryAfter
      token
      expiresAt
      uses
    }
  }
`);

export const AuthInviteRenewMutation = graphql(`
  mutation AuthInviteRenew {
    authInviteRenew {
      success
      error
      field
      retryAfter
      token
      expiresAt
      uses
    }
  }
`);

export const AuthAdminBanInfoQuery = graphql(`
  query AuthAdminBanInfo($userId: ID!) {
    authAdminBanInfo(userId: $userId) {
      success
      error
      field
      retryAfter
      ban
    }
  }
`);

export const AuthAdminBanMutation = graphql(`
  mutation AuthAdminBan($userId: ID!, $until: String, $reason: String) {
    authAdminBan(userId: $userId, until: $until, reason: $reason) {
      success
      error
      field
      retryAfter
      ban
    }
  }
`);

export const AuthAdminUnbanMutation = graphql(`
  mutation AuthAdminUnban($userId: ID!) {
    authAdminUnban(userId: $userId) {
      success
      error
      field
      retryAfter
      ban
    }
  }
`);
