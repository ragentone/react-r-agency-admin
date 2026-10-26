import { isNativeApp } from '@core/native';

/**
 * Passkeys in the browser without a library: JSON options from the runtime → WebAuthn API →
 * JSON credential back (base64url everywhere).
 */
const toBuffer = (value: string): ArrayBuffer => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};

const toBase64Url = (buffer: ArrayBuffer | null | undefined): string => {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

type Json = Record<string, any>;

/** Not in the native app shell: its web view origin does not match the relying party. */
export const passkeySupported = (): boolean =>
  typeof window !== 'undefined' &&
  !isNativeApp() &&
  window.isSecureContext &&
  typeof window.PublicKeyCredential === 'function' &&
  typeof navigator.credentials?.create === 'function';

/** Autofill of passkeys in the user name field (Safari, Chrome). */
export const passkeyAutofillSupported = async (): Promise<boolean> => {
  if (!passkeySupported()) return false;
  const check = (PublicKeyCredential as any).isConditionalMediationAvailable;
  try {
    return typeof check === 'function' ? Boolean(await check.call(PublicKeyCredential)) : false;
  } catch {
    return false;
  }
};

const credentialList = (list: Json[] | undefined) =>
  (list ?? []).map(item => ({ ...item, id: toBuffer(item.id) }));

/** `null` = cancelled by the user (or not allowed). */
export const passkeyCreate = async (options: Json): Promise<Json | null> => {
  const publicKey: PublicKeyCredentialCreationOptions = {
    ...(options as PublicKeyCredentialCreationOptions),
    challenge: toBuffer(options.challenge),
    user: { ...options.user, id: toBuffer(options.user.id) },
    excludeCredentials: credentialList(
      options.excludeCredentials
    ) as PublicKeyCredentialDescriptor[],
  };
  try {
    const credential = (await navigator.credentials.create({
      publicKey,
    })) as PublicKeyCredential | null;
    if (!credential) return null;
    const response = credential.response as AuthenticatorAttestationResponse;
    return {
      id: credential.id,
      rawId: toBase64Url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: toBase64Url(response.clientDataJSON),
        attestationObject: toBase64Url(response.attestationObject),
        transports: typeof response.getTransports === 'function' ? response.getTransports() : [],
      },
    };
  } catch (error) {
    if ((error as DOMException)?.name === 'InvalidStateError') throw new Error('exists');
    return null;
  }
};

let autofillAbort: AbortController | null = null;

/** Stops a pending autofill request (before a button-triggered passkey request). */
export const passkeyAbortAutofill = () => {
  autofillAbort?.abort();
  autofillAbort = null;
};

/** `conditional` = autofill in the user name field (waits until the user picks a passkey). */
export const passkeyGet = async (options: Json, conditional = false): Promise<Json | null> => {
  passkeyAbortAutofill();
  const controller = new AbortController();
  if (conditional) autofillAbort = controller;
  const publicKey: PublicKeyCredentialRequestOptions = {
    ...(options as PublicKeyCredentialRequestOptions),
    challenge: toBuffer(options.challenge),
    allowCredentials: credentialList(options.allowCredentials) as PublicKeyCredentialDescriptor[],
  };
  try {
    const credential = (await navigator.credentials.get({
      publicKey,
      signal: controller.signal,
      ...(conditional ? { mediation: 'conditional' as CredentialMediationRequirement } : {}),
    })) as PublicKeyCredential | null;
    if (!credential) return null;
    const response = credential.response as AuthenticatorAssertionResponse;
    return {
      id: credential.id,
      rawId: toBase64Url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: toBase64Url(response.clientDataJSON),
        authenticatorData: toBase64Url(response.authenticatorData),
        signature: toBase64Url(response.signature),
        userHandle: toBase64Url(response.userHandle),
      },
    };
  } catch {
    return null;
  } finally {
    if (autofillAbort === controller) autofillAbort = null;
  }
};
