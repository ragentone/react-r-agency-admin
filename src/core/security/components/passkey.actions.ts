import { toast } from 'sonner';

import { AuthApi } from '../api';
import { withSudo } from '../sudo';
import type { IAuthPasskey } from '../types';
import { passkeyCreate } from '../utils/webauthn';

/** Adds a passkey for this device (sudo + WebAuthn). Returns the new list or null. */
export const addPasskey = async (
  errorText: (result: { error?: string | null }) => string | null,
  t: (key: string) => string
): Promise<IAuthPasskey[] | null> => {
  const options = await withSudo(() => AuthApi.passkeyRegisterOptions());
  if (options.error === 'sudo_required') return null;
  if (!options.success || !options.challengeId || !options.options) {
    toast.error(errorText(options as never));
    return null;
  }
  let credential: Record<string, unknown> | null;
  try {
    credential = await passkeyCreate(options.options);
  } catch {
    toast.error(t('passkeys.exists'));
    return null;
  }
  if (!credential) return null;
  const result = await AuthApi.passkeyRegister(options.challengeId, credential);
  if (!result.success) {
    toast.error(errorText(result as never));
    return null;
  }
  toast.success(t('passkeys.added'));
  const list = await AuthApi.security();
  return list.security?.passkeys ?? null;
};
