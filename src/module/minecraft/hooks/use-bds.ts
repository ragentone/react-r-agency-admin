import { useCallback, useEffect, useRef, useState } from 'react';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftBdsStatus } from '../types';

const POLL_MS = 1500;

/** BDS-Stand; pollt während Download/Installation und startet die Installation. */
export function useBds() {
  const [status, setStatus] = useState<IMinecraftBdsStatus | null>(null);
  const [failed, setFailed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const latest = useRef(0);

  const load = useCallback(async () => {
    const call = ++latest.current;
    const result = await AdminMinecraftApi.bdsStatus();
    if (call !== latest.current) return; // eine neuere Antwort gilt
    setFailed(!result.success);
    if (result.status) setStatus(result.status);
  }, []);

  const active = status?.phase === 'downloading' || status?.phase === 'installing';

  useEffect(() => {
    let alive = true;
    void AdminMinecraftApi.bdsStatus().then(result => {
      if (!alive || latest.current > 0) return;
      setFailed(!result.success);
      if (result.status) setStatus(result.status);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(id);
  }, [active, load]);

  const install = async () => {
    setStarting(true);
    setStartError(null);
    const result = await AdminMinecraftApi.bdsInstall();
    if (!result.success) {
      setStartError(result.error ?? 'unknown');
      void load();
    } else {
      // Sofort Rückmeldung; das Polling übernimmt, sobald die Phase "downloading" ist.
      latest.current += 1;
      setStatus(current =>
        current ? { ...current, phase: 'downloading', error: null, progress: null } : current
      );
    }
    setStarting(false);
  };

  return { status, failed, starting, startError, install };
}
