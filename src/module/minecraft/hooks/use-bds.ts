import { useCallback, useEffect, useRef, useState } from 'react';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftBdsStatus } from '../types';

const POLL_MS = 2000;

/** BDS-Stand; pollt während Download/Installation und startet die Installation. */
export function useBds(enabled: boolean) {
  const [status, setStatus] = useState<IMinecraftBdsStatus | null>(null);
  const [failed, setFailed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(async () => {
    const result = await AdminMinecraftApi.bdsStatus();
    setFailed(!result.success);
    if (result.status) setStatus(result.status);
    return result.status ?? null;
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    const tick = async () => {
      const next = await load();
      const active = next?.phase === 'downloading' || next?.phase === 'installing';
      if (alive && active) timer.current = setTimeout(() => void tick(), POLL_MS);
    };
    void tick();
    return () => {
      alive = false;
      clearTimeout(timer.current);
    };
  }, [enabled, load, starting]);

  const install = async () => {
    setStarting(true);
    setStartError(null);
    const result = await AdminMinecraftApi.bdsInstall();
    if (!result.success) setStartError(result.error ?? 'unknown');
    setStarting(false);
  };

  return { status, failed, starting, startError, install };
}
