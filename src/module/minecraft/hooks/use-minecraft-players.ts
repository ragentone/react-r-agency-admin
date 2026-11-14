import { useCallback, useEffect, useState } from 'react';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftPlayer } from '../types';

const POLL_MS = 10_000;

/** Alle Spieler mit Online-Stand: lädt beim Öffnen, danach alle 10 s und auf `reload`. */
export function useMinecraftPlayers(enabled: boolean) {
  const [players, setPlayers] = useState<IMinecraftPlayer[] | null>(null);

  const reload = useCallback(async () => {
    const result = await AdminMinecraftApi.players();
    setPlayers(result.success ? (result.players ?? []) : []);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    const load = () =>
      void AdminMinecraftApi.players().then(result => {
        if (alive) setPlayers(result.success ? (result.players ?? []) : []);
      });
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [enabled]);

  return { players, reload };
}
