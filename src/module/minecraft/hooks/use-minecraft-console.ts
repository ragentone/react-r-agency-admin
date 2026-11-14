import { useMeshState, useWebsocket } from '@core/mesh';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftConsoleLine } from '../types';

const MAX_LINES = 500;
/** Websocket aktiv: Abruf nur als Herzschlag (hält die Beobachtung am Server, füllt Lücken). */
const HEARTBEAT_MS = 30_000;
/** Ohne Websocket: wie bisher pollen. */
const FALLBACK_POLL_MS = 1500;
const LIVE_CHANNEL = 'minecraft';

interface IConsoleLiveEvents {
  console: { serverId: string; line: IMinecraftConsoleLine };
}

/**
 * Konsolenverlauf eines Servers, solange `enabled` (Drawer offen): einmal laden, dann live per
 * Websocket (`minecraft` → `console`). Der Abruf alle 30 s hält die Beobachtung am Server und holt
 * verpasste Zeilen nach; ohne Verbindung wird wie früher alle 1,5 s gepollt.
 */
export function useMinecraftConsole(serverId: string, enabled: boolean) {
  const websocket = useWebsocket();
  const { connected } = useMeshState();
  const [lines, setLines] = useState<IMinecraftConsoleLine[]>([]);
  const last = useRef(0);

  const poll = useCallback(async () => {
    const after = last.current;
    const result = await AdminMinecraftApi.consoleHistory(serverId, after);
    if (!result.success || !result.lines) return;
    const next = result.last ?? 0;
    // Erster Abruf oder Runtime-Neustart (Zähler beginnt neu): Anzeige ersetzen.
    if (after === 0 || next < after) {
      setLines(result.lines);
      last.current = next;
      return;
    }
    // Live-Zeilen, die während des Abrufs eintrafen, nicht doppelt anzeigen.
    const fresh = result.lines.filter(line => line.seq > last.current);
    if (fresh.length > 0) setLines(prev => [...prev, ...fresh].slice(-MAX_LINES));
    last.current = Math.max(last.current, next);
  }, [serverId]);

  // Verlauf laden + Herzschlag bzw. Fallback-Polling (neu laden nach jedem Verbindungswechsel).
  useEffect(() => {
    if (!enabled) return undefined;
    last.current = 0;
    void poll();
    const timer = setInterval(() => void poll(), connected ? HEARTBEAT_MS : FALLBACK_POLL_MS);
    return () => clearInterval(timer);
  }, [connected, enabled, poll]);

  // Live-Zeilen.
  useEffect(() => {
    if (!enabled) return undefined;
    const channel = websocket.channel<IConsoleLiveEvents>(LIVE_CHANNEL);
    const off = channel.on('console', ({ payload }) => {
      if (payload.serverId !== serverId) return;
      const { line } = payload;
      if (line.seq <= last.current) return;
      // Lücke (Zeile verpasst) oder Verlauf noch nicht geladen: nachladen statt raten.
      if (line.seq !== last.current + 1) {
        void poll();
        return;
      }
      last.current = line.seq;
      setLines(prev => [...prev, line].slice(-MAX_LINES));
    });
    return () => off();
  }, [enabled, poll, serverId, websocket]);

  return { lines, refresh: poll };
}
