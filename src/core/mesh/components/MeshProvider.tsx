import { useAuthTokenStore } from '@core/auth/auth.token.store.tsx';
import i18n from 'i18next';
import { useMesh } from 'r-agency-mesh-client-v1/release';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { resetMeshReconnectCount, startMeshKeepAlive } from '../keep.alive.ts';
import { type IMeshContext, type MeshConnectionStatus, MeshContext } from './mesh.context.ts';
import { MeshError } from './MeshError.tsx';
import { MeshLoading } from './MeshLoading.tsx';
import { MeshReconnectBanner } from './MeshReconnectBanner.tsx';

interface IProps {
  children: ReactNode;
  fallback?: ReactNode;
  afterLoadDelay?: number;
}

const MeshProvider = ({ children, fallback, afterLoadDelay = 0 }: IProps) => {
  const { config, connect, onEvent } = useMesh();
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<MeshConnectionStatus>('connecting');
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const afterLoadTimeoutRef = useRef<number>(0);
  /** Einmal verbunden → App bleibt bei Verbindungsabbrüchen gemountet (kein Vollbild-Fehler). */
  const [everConnected, setEverConnected] = useState(false);

  const reconnect = useCallback(() => {
    setStatus('reconnecting');
    setError(null);
    connect();
  }, [connect]);

  useEffect(() => {
    // Unsubscribe on unmount – Fast Refresh re-runs this effect, without cleanup every
    // hot reload would add another set of listeners (and another header hook).
    const unsubscribe: Array<() => void> = [];
    const init = () => {
      config({
        endpoint: import.meta.env.VITE_MESH_SERVER_ENDPOINT,
        onTryReconnect: (count: number) => {
          setRetryCount(count);
          setStatus('reconnecting');
        },
      });

      unsubscribe.push(
        onEvent('connected', () => {
          clearTimeout(afterLoadTimeoutRef.current);
          resetMeshReconnectCount();
          afterLoadTimeoutRef.current = setTimeout(() => {
            setEverConnected(true);
            setConnected(true);
            setStatus('connected');
            setError(null);
            setRetryCount(0);
          }, afterLoadDelay);
        }) as () => void
      );

      unsubscribe.push(
        onEvent('reconnected', () => {
          resetMeshReconnectCount();
          setConnected(true);
          setStatus('connected');
          setError(null);
          setRetryCount(0);
        }) as () => void
      );

      unsubscribe.push(
        onEvent('disconnected', (err: any) => {
          setConnected(false);
          setStatus('disconnected');
          if (err?.error || err?.message) {
            setError(typeof err === 'string' ? err : err.error || err.message);
          }
        }) as () => void
      );

      unsubscribe.push(
        onEvent('connect:error', (payload: any) => {
          setConnected(false);
          setStatus('error');
          setError(payload?.error || payload?.reason || 'Mesh connection failed');
        }) as () => void
      );

      unsubscribe.push(
        onEvent('websocket:error', (payload: any) => {
          setError(payload?.error || 'WebSocket error');
        }) as () => void
      );

      unsubscribe.push(
        onEvent('modify:headers', event => {
          event.headers.assign({
            'x-auth-token': useAuthTokenStore.getState().token,
            // UI language – the runtime uses it for emails and other texts it sends itself.
            'x-mesh-locale': i18n.resolvedLanguage || i18n.language || '',
            // Client scope (`vite.config.ts` → `VITE_APP.scope`): `admin` = admin instance, the
            // runtime then only lets admins sign in and turns sign-up off (shared/auth).
            'x-mesh-app-scope': import.meta.env.VITE_APP?.scope ?? 'default',
          });
        }) as () => void
      );

      connect();

      // Verbindung im Hintergrund halten + beim Zurückkehren sofort wiederherstellen.
      unsubscribe.push(
        startMeshKeepAlive({
          connect: () => connect(),
          onReconnect: () => setStatus('reconnecting'),
        })
      );
    };

    init();
    return () => {
      clearTimeout(afterLoadTimeoutRef.current);
      unsubscribe.forEach(off => off());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = useMemo<IMeshContext>(() => {
    return {
      connected,
      status,
      retryCount,
      error,
      reconnect,
    };
  }, [connected, status, retryCount, error, reconnect]);

  const isErrorState =
    status === 'error' || status === 'disconnected' || status === 'reconnecting' || error !== null;

  const renderContent = () => {
    if (everConnected) {
      // Kurzzeitige Abbrüche (z. B. nach Hintergrund/Standby) nicht mit einem Vollbild-Fehler
      // quittieren – App-Zustand bleibt erhalten, ein dezentes Banner zeigt den Reconnect.
      return (
        <>
          {children}
          <MeshReconnectBanner visible={status !== 'connected'} onRetry={reconnect} />
        </>
      );
    }

    if (isErrorState) {
      if (fallback !== undefined) {
        return fallback;
      }
      return (
        <MeshError status={status} retryCount={retryCount} error={error} onRetry={reconnect} />
      );
    }

    if (!connected) {
      if (fallback !== undefined) {
        return fallback;
      }
      return <MeshLoading status={status} retryCount={retryCount} />;
    }

    return children;
  };

  return <MeshContext.Provider value={contextValue}>{renderContent()}</MeshContext.Provider>;
};

export { MeshProvider };
