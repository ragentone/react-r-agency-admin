import { isNativeApp, onNativeEvent } from '@core/native/bridge';

/**
 * Hält die Mesh-Verbindung am Leben, wenn die Seite/PWA nicht im Fokus ist, und baut sie
 * beim Zurückkehren sofort wieder auf.
 *
 * - Web Lock: Chrome/Edge (Desktop + Android) frieren Tabs mit gehaltenem Lock nicht ein
 *   bzw. verwerfen sie nicht → WebSocket bleibt im Hintergrund offen.
 * - Resume-Trigger (visible, pageshow, focus, online, Page-Lifecycle `resume`, native
 *   `app.lifecycle: resumed`): ist die Verbindung weg, wird sofort neu verbunden statt auf
 *   den nächsten (evtl. gedrosselten) Retry-Timer zu warten.
 * - Der Mesh-Client gibt nach 125 Versuchen auf und setzt den Zähler nie zurück → hier wird
 *   er nach jeder erfolgreichen Verbindung zurückgesetzt, und ein Watchdog übernimmt, falls
 *   der Client aufgegeben hat.
 *
 * iOS (Safari/PWA) pausiert Hintergrund-Seiten trotzdem nach kurzer Zeit – das lässt sich
 * im Web nicht verhindern; dort greift der sofortige Reconnect beim Zurückkehren (+ Push).
 */

interface IMeshClientInternals {
  state?: { connected?: boolean; status?: string };
  reconnectCount?: number;
  reconnectDebounce?: ReturnType<typeof setTimeout>;
  connectedAt?: Date;
}

interface IKeepAliveOptions {
  /** Startet einen Verbindungsversuch (MeshClient.connect). */
  connect: () => void;
  /** Wird vor einem Keep-Alive-Reconnect aufgerufen (Status in der UI setzen). */
  onReconnect?: () => void;
}

const WATCHDOG_INTERVAL_MS = 15_000;
/** Mindestabstand zwischen zwei Keep-Alive-Reconnects (verhindert Doppel-Sockets). */
const MIN_RECONNECT_GAP_MS = 4_000;
const LOCK_NAME = 'r-agency-mesh-keep-alive';

const getClient = (): IMeshClientInternals | undefined =>
  (window as unknown as { MeshClient?: IMeshClientInternals }).MeshClient;

const isConnected = () => getClient()?.state?.connected === true;
const isVisible = () => document.visibilityState === 'visible';

/** Lock bis zum Aufräumen halten – verhindert Tab-Freezing/-Discarding in Chromium. */
const holdWebLock = (): (() => void) => {
  const locks = (navigator as Navigator & { locks?: LockManager }).locks;
  if (!locks?.request) return () => undefined;
  const controller = new AbortController();
  let release: () => void = () => undefined;
  locks
    .request(LOCK_NAME, { signal: controller.signal }, () => new Promise<void>(r => (release = r)))
    .catch(() => undefined);
  return () => {
    controller.abort();
    release();
  };
};

export const startMeshKeepAlive = ({ connect, onReconnect }: IKeepAliveOptions): (() => void) => {
  const cleanup: Array<() => void> = [];
  let lastAttempt = 0;

  const reconnectNow = (reason: string) => {
    const client = getClient();
    // Vor dem ersten erfolgreichen Connect kümmert sich der MeshProvider selbst darum.
    if (!client?.connectedAt || isConnected() || !navigator.onLine) return;
    if (Date.now() - lastAttempt < MIN_RECONNECT_GAP_MS) return;
    lastAttempt = Date.now();

    // Ausstehenden (gedrosselten) Retry verwerfen und Zähler zurücksetzen, sonst gibt der
    // Client nach 125 Versuchen für immer auf.
    clearTimeout(client.reconnectDebounce);
    client.reconnectCount = 0;
    console.info(`[mesh] keep-alive reconnect (${reason})`);
    onReconnect?.();
    connect();
  };

  const onResume = (reason: string) => () => {
    if (isVisible()) reconnectNow(reason);
  };

  const listen = (target: EventTarget, event: string, handler: () => void) => {
    target.addEventListener(event, handler);
    cleanup.push(() => target.removeEventListener(event, handler));
  };

  listen(document, 'visibilitychange', onResume('visible'));
  listen(document, 'resume', onResume('resume'));
  listen(window, 'pageshow', onResume('pageshow'));
  listen(window, 'focus', onResume('focus'));
  listen(window, 'online', () => reconnectNow('online'));

  if (isNativeApp()) {
    cleanup.push(
      onNativeEvent('app.lifecycle', ({ state }) => {
        if (state === 'resumed') reconnectNow('app-resumed');
      })
    );
  }

  // Watchdog: greift, wenn der Client aufgegeben hat oder ein Retry-Timer hängt.
  const watchdog = setInterval(() => {
    const client = getClient();
    if (!client || isConnected()) return;
    if ((client.reconnectCount ?? 0) >= 125 || isVisible()) reconnectNow('watchdog');
  }, WATCHDOG_INTERVAL_MS);
  cleanup.push(() => clearInterval(watchdog));

  cleanup.push(holdWebLock());

  return () => cleanup.forEach(off => off());
};

/** Nach jeder erfolgreichen Verbindung aufrufen – setzt den Retry-Zähler des Clients zurück. */
export const resetMeshReconnectCount = () => {
  const client = getClient();
  if (client) client.reconnectCount = 0;
};
