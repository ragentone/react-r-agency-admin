import { useCallback, useEffect, useState } from 'react';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftPass } from '../types';

/** Spielerpass-Einträge; lädt beim Öffnen und auf `reload`. */
export function useMinecraftPasses(enabled: boolean) {
  const [passes, setPasses] = useState<IMinecraftPass[] | null>(null);

  const reload = useCallback(async () => {
    const result = await AdminMinecraftApi.passes();
    setPasses(result.success ? (result.passes ?? []) : []);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    void AdminMinecraftApi.passes().then(result => {
      if (alive) setPasses(result.success ? (result.passes ?? []) : []);
    });
    return () => {
      alive = false;
    };
  }, [enabled]);

  return { passes, reload };
}
