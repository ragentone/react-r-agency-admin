import { useCallback, useEffect, useRef, useState } from 'react';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftConsoleLine } from '../types';

const POLL_MS = 1500;
const MAX_LINES = 500;

/** Konsolenverlauf eines Servers: pollt neue Zeilen, solange `enabled` (Drawer offen). */
export function useMinecraftConsole(serverId: string, enabled: boolean) {
  const [lines, setLines] = useState<IMinecraftConsoleLine[]>([]);
  const last = useRef(0);

  const poll = useCallback(async () => {
    const result = await AdminMinecraftApi.consoleHistory(serverId, last.current);
    if (!result.success || !result.lines) return;
    const after = last.current;
    const next = result.last ?? 0;
    // Erster Abruf oder Runtime-Neustart (Zähler beginnt neu): Anzeige ersetzen.
    if (after === 0 || next < after) {
      setLines(result.lines);
    } else if (result.lines.length > 0) {
      setLines(prev => [...prev, ...(result.lines ?? [])].slice(-MAX_LINES));
    }
    last.current = next;
  }, [serverId]);

  useEffect(() => {
    if (!enabled) return undefined;
    last.current = 0;
    void poll();
    const timer = setInterval(() => void poll(), POLL_MS);
    return () => clearInterval(timer);
  }, [enabled, poll]);

  return { lines, refresh: poll };
}
