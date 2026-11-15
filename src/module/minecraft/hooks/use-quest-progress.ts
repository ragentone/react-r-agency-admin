import { useCallback, useEffect, useState } from 'react';

import { AdminMinecraftQuestApi } from '../api.quest';
import type { IMinecraftQuestProgress } from '../types.quest';

const POLL_MS = 10_000;

/** Fortschritt der Spieler einer Aufgabe: lädt sofort, danach alle 10 s und auf `reload`. */
export function useQuestProgress(questId: string) {
  const [progress, setProgress] = useState<IMinecraftQuestProgress[] | null>(null);

  const reload = useCallback(async () => {
    const result = await AdminMinecraftQuestApi.progress(questId);
    setProgress(result.progress ?? []);
  }, [questId]);

  useEffect(() => {
    let alive = true;
    const load = () =>
      void AdminMinecraftQuestApi.progress(questId).then(
        result => alive && setProgress(result.progress ?? [])
      );
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [questId]);

  return { progress, reload };
}
