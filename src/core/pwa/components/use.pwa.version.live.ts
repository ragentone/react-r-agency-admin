import { useMeshState, useWebsocket } from '@core/mesh';
import { type RefObject, useCallback, useEffect, useRef } from 'react';

import { fetchLiveVersion, type IPwaLiveVersion, toRelease } from '../api';
import {
  PWA_LIVE_CHANNEL,
  PWA_VERSION_ASK_GAP_MS,
  PWA_VERSION_JITTER_MS,
  PWA_VERSION_RECHECK_MS,
} from '../const';
import type { IPwaLiveEvents, IPwaRelease } from '../types';

/** Build id of this bundle (`vite.config.ts` → `VITE_APP.id`, also sent as `meta.id`). */
const OWN_BUILD = import.meta.env.VITE_APP?.id ?? null;

export interface IPwaVersionLiveHandlers {
  /** No service worker here → the new version can only be loaded by a plain reload. */
  onWithoutWorker: () => void;
  /** Runtime: a production build started (push only). */
  onDeployStart: (deploymentId: string) => void;
  /**
   * Runtime: a build is live (push only). `release` = that build when it is newer than this
   * tab, `null` when this tab already runs it (or dev).
   */
  onVersion: (release: IPwaRelease | null) => void;
  /** A newer build than this tab is live (push or pull). */
  onAvailable: (release: IPwaRelease) => void;
  /** Version of this tab (pull; `null` = unknown). */
  onOwn: (release: IPwaRelease | null) => void;
}

/**
 * Keeps open tabs on the newest frontend build.
 * - Push: runtime broadcasts `system` → `deploy` (build started) and `version` (build live).
 * - Pull: on every (re)connect and when the tab comes back to the foreground the tab asks
 *   `systemVersion` – the live build and the version of this tab. Catches missed broadcasts
 *   (offline, phone in the background, runtime restarted after the build).
 * Another build than this bundle → with a service worker look for the new worker at once
 * (+ once more a minute later); without one `onWithoutWorker`. Production builds only.
 */
export const usePwaVersionLive = (
  registration: RefObject<ServiceWorkerRegistration | undefined>,
  handlers: IPwaVersionLiveHandlers
) => {
  const websocket = useWebsocket();
  const { connected } = useMeshState();
  const latest = useRef(handlers);
  const seen = useRef(new Set<string>());
  const timers = useRef<number[]>([]);
  const askedAt = useRef(0);
  useEffect(() => {
    latest.current = handlers;
  });

  /** The release when it is a newer build for this tab (a check was started), else `null`. */
  const handle = useCallback(
    (version: IPwaLiveVersion | null | undefined, jitter: number): IPwaRelease | null => {
      if (!import.meta.env.PROD || !version?.deploymentId) return null;
      if (!version.buildId || version.buildId === OWN_BUILD) return null;
      const release = toRelease(version) ?? {
        version: null,
        bump: null,
        notes: [],
        required: false,
      };
      latest.current.onAvailable(release);
      if (seen.current.has(version.deploymentId)) return release;
      seen.current.add(version.deploymentId);

      const check = () => {
        const current = registration.current;
        if (!current) {
          latest.current.onWithoutWorker();
          return;
        }
        if (!navigator.onLine) return;
        void current.update().catch(error => console.warn('[pwa] update check failed', error));
      };
      const delay = Math.round(Math.random() * jitter);
      timers.current.push(window.setTimeout(check, delay));
      timers.current.push(
        window.setTimeout(() => {
          const current = registration.current;
          // Still nothing waiting → the worker was probably written after the first check.
          if (current && !current.waiting && !current.installing) check();
        }, delay + PWA_VERSION_RECHECK_MS)
      );
      return release;
    },
    [registration]
  );

  const ask = useCallback(
    (force: boolean) => {
      if (!import.meta.env.PROD) return;
      const now = Date.now();
      if (!force && now - askedAt.current < PWA_VERSION_ASK_GAP_MS) return;
      askedAt.current = now;
      void fetchLiveVersion(OWN_BUILD).then(({ current, own }) => {
        latest.current.onOwn(own);
        handle(current, 0);
      });
    },
    [handle]
  );

  // Push.
  useEffect(() => {
    const channel = websocket.channel<IPwaLiveEvents>(PWA_LIVE_CHANNEL);
    const offs = [
      channel.on('deploy', ({ payload }) => {
        if (payload?.phase === 'before' && payload.deploymentId) {
          latest.current.onDeployStart(payload.deploymentId);
        }
      }),
      channel.on('version', ({ payload }) => {
        latest.current.onVersion(handle(payload, PWA_VERSION_JITTER_MS));
      }),
    ];
    return () => offs.forEach(off => off());
  }, [handle, websocket]);

  // Pull on (re)connect.
  useEffect(() => {
    if (connected) ask(true);
  }, [ask, connected]);

  // Pull when the tab / installed app comes back to the foreground.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') ask(false);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [ask]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(timer => window.clearTimeout(timer));
  }, []);
};
