import { CLI_VERIFY_PATH } from './const';

export type CliVerifyError = 'invalid' | 'expired' | 'network';

const endpoint = () => String(import.meta.env.VITE_MESH_SERVER_ENDPOINT ?? '').replace(/\/+$/, '');

/**
 * Eigener Login für die Terminal-Freigabe – unabhängig vom Admin-Bereich und vom Login-Workflow.
 * Der Server prüft nur Passwort und Admin-Rolle (keine Sitzung im Browser, keine Benachrichtigung).
 * Liefert `null` bei Erfolg, sonst den Fehlergrund.
 */
export const verifyCliLogin = async (
  code: string,
  identifier: string,
  password: string
): Promise<CliVerifyError | null> => {
  try {
    const res = await fetch(`${endpoint()}${CLI_VERIFY_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, identifier, password }),
    });
    if (res.ok) return null;
    if (res.status === 410) return 'expired';
    if (res.status === 403) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      return data.error === 'expired' ? 'expired' : 'invalid';
    }
    return 'network';
  } catch {
    return 'network';
  }
};
