import { useAuth } from '@core/auth/components/use.auth.ts';
import { GoogleAuthAfterMutation } from '@core/auth/graphql';
import type { GoogleAuthAfterReturn, IGoogleAuthParams } from '@core/auth/types';
import { useGraphQl } from '@core/mesh';
import { callNative, isNativeApp, NativeBridgeError } from '@core/native';
import { useRouter } from '@tanstack/react-router';
import { nanoid } from 'nanoid';
import { useCallback, useState } from 'react';

export interface IUseUserGoogleAuthOptions {
  onSuccess?: (data?: GoogleAuthAfterReturn | null) => void;
  onError?: (error: Error) => void;
}

export const parseGoogleAuthHash = (
  hash: string
): { accessToken?: string; idToken?: string; error?: string } => {
  const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash;
  const params = new URLSearchParams(cleanHash);
  return {
    accessToken: params.get('access_token') || undefined,
    idToken: params.get('id_token') || undefined,
    error: params.get('error') || undefined,
  };
};

export const buildGoogleAuthUrl = (
  nonce: string,
  redirectUri: string = import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin,
  state?: string
): string => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const authUrl =
    import.meta.env.VITE_GOOGLE_AUTH_URL || 'https://accounts.google.com/o/oauth2/v2/auth';

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token id_token',
    scope: 'openid email profile',
    nonce,
    prompt: 'select_account',
  });
  if (state) params.set('state', state);

  return `${authUrl}?${params.toString()}`;
};

/**
 * Native App (Flutter, siehe `@core/native`): Google blockiert OAuth in eingebetteten WebViews
 * (403 disallowed_useragent). Die App öffnet den Login daher im System-Anmeldefenster
 * (Android Auth Tab / iOS+macOS ASWebAuthenticationSession). Die Callback-Seite erkennt
 * `state=r-agency-app` (index.html) und springt per `r-agency://google-auth#…` zurück in die App.
 */
export const NATIVE_GOOGLE_AUTH_STATE = 'r-agency-app';

export const nativeGoogleAuth = async (
  authUrl: string
): Promise<{ accessToken: string; idToken: string }> => {
  try {
    const { hash } = await callNative('auth.google', { url: authUrl });
    const { accessToken, idToken, error } = parseGoogleAuthHash(hash);
    if (accessToken && idToken) return { accessToken, idToken };
    throw new Error(error || 'Failed to retrieve tokens from Google response');
  } catch (err) {
    if (err instanceof NativeBridgeError && err.code === 'CANCELED') {
      throw new Error('Google sign-in was cancelled');
    }
    throw err;
  }
};

export const useUserGoogleAuth = (options?: IUseUserGoogleAuthOptions) => {
  const { mutate } = useGraphQl();
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const googleAuthAfter = useCallback(
    async (params: IGoogleAuthParams): Promise<GoogleAuthAfterReturn | null | undefined> => {
      setLoading(true);
      try {
        const response = await mutate({
          mutation: GoogleAuthAfterMutation,
          variables: {
            token: params.token,
            id: params.id,
            nonce: params.nonce,
          },
        });

        const result = response.data?.googleAuthAfter;
        const email = response.data?.googleAuthAfter?.gapi_exd;
        const password = response.data?.googleAuthAfter?.gapi_pxd;

        if (result?.success && email && password) {
          await login({
            email: email,
            password: password,
            userType: 'google',
          });
        } else {
          void navigate({ to: '/auth' });
        }
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [login, mutate, navigate, options]
  );

  const loginWithGoogle = useCallback(
    async (popupOptions?: {
      width?: number;
      height?: number;
    }): Promise<GoogleAuthAfterReturn | null | undefined> => {
      setLoading(true);
      try {
        const nonce = nanoid();
        sessionStorage.setItem('google_auth_nonce', nonce);

        const redirectUri = window.location.origin + import.meta.env.VITE_GOOGLE_REDIRECT_URI_PATH;

        if (isNativeApp()) {
          const tokens = await nativeGoogleAuth(
            buildGoogleAuthUrl(nonce, redirectUri, NATIVE_GOOGLE_AUTH_STATE)
          );
          sessionStorage.removeItem('google_auth_nonce');
          return await googleAuthAfter({ token: tokens.accessToken, id: tokens.idToken, nonce });
        }

        const authUrl = buildGoogleAuthUrl(nonce, redirectUri);

        const width = popupOptions?.width ?? 500;
        const height = popupOptions?.height ?? 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          authUrl,
          'google-auth-popup',
          `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
        );

        if (!popup) {
          // If popup is blocked by browser, redirect current window
          window.location.href = authUrl;
          return null;
        }

        const tokens = await new Promise<{ accessToken: string; idToken: string }>(
          (resolve, reject) => {
            let resolved = false;

            const handleMessage = (event: MessageEvent) => {
              if (event.origin !== window.location.origin) return;
              if (event.data?.type === 'GOOGLE_AUTH_CALLBACK' && event.data?.hash) {
                const parsed = parseGoogleAuthHash(event.data.hash);
                if (parsed.accessToken && parsed.idToken) {
                  resolved = true;
                  window.removeEventListener('message', handleMessage);
                  window.clearInterval(interval);
                  try {
                    popup.close();
                  } catch {
                    // ignore
                  }
                  resolve({ accessToken: parsed.accessToken, idToken: parsed.idToken });
                } else if (parsed.error) {
                  resolved = true;
                  window.removeEventListener('message', handleMessage);
                  window.clearInterval(interval);
                  try {
                    popup.close();
                  } catch {
                    // ignore
                  }
                  reject(new Error(parsed.error));
                }
              }
            };

            window.addEventListener('message', handleMessage);

            const interval = window.setInterval(() => {
              try {
                if (!popup || popup.closed) {
                  window.clearInterval(interval);
                  window.removeEventListener('message', handleMessage);
                  if (!resolved) {
                    reject(new Error('Google sign-in popup was closed'));
                  }
                  return;
                }

                if (popup.location.origin === window.location.origin) {
                  const hash = popup.location.hash;
                  if (
                    hash &&
                    (hash.includes('access_token') ||
                      hash.includes('id_token') ||
                      hash.includes('error'))
                  ) {
                    resolved = true;
                    window.clearInterval(interval);
                    window.removeEventListener('message', handleMessage);
                    const { accessToken, idToken, error } = parseGoogleAuthHash(hash);
                    popup.close();
                    if (accessToken && idToken) {
                      resolve({ accessToken, idToken });
                    } else {
                      reject(new Error(error || 'Failed to retrieve tokens from Google response'));
                    }
                  }
                }
              } catch {
                // Ignore cross-origin errors while popup is on accounts.google.com
              }
            }, 300);
          }
        );

        const storedNonce = sessionStorage.getItem('google_auth_nonce') || nonce;
        sessionStorage.removeItem('google_auth_nonce');

        return await googleAuthAfter({
          token: tokens.accessToken,
          id: tokens.idToken,
          nonce: storedNonce,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [googleAuthAfter, options]
  );

  return {
    loginWithGoogle,
    googleAuthAfter,
    loading,
  };
};
