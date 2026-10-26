import { parse } from 'graphql';
import i18n from 'i18next';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

/**
 * Visitor statistics (runtime shared/stats): every tab sends its page views, a ping every
 * 60 s while visible (online list) and the funnel steps of the sign-in page. Batched, never
 * blocks or breaks the app. No cookie: the tab id lives in sessionStorage only.
 * Do Not Track / Global Privacy Control → the server counts the tab like an anonymous guest.
 */

type Item =
  | { type: 'view'; session: string; path: string; referrer?: string | null; ref?: string | null }
  | { type: 'ping'; session: string; path: string }
  | { type: 'event'; session: string; name: StatsEventName };

export type StatsEventName = 'auth_open' | 'auth_identify' | 'auth_code' | 'auth_register';

// Parsed here instead of codegen: works before the schema was regenerated.
const TrackMutation = parse(`
  mutation StatsTrack($data: JSON!) {
    statsTrack(data: $data) {
      success
    }
  }
`);

const PING_MS = 60_000;
const FLUSH_MS = 4_000;
const SESSION_KEY = 'mesh-stats-tab';

let queue: Item[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let pingTimer: ReturnType<typeof setInterval> | null = null;
let currentPath = '/';
let firstView = true;
let memorySession = '';

const randomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

/** Random id of this tab (sessionStorage; memory when storage is blocked). */
const sessionId = () => {
  try {
    let value = sessionStorage.getItem(SESSION_KEY);
    if (!value) {
      value = randomId();
      sessionStorage.setItem(SESSION_KEY, value);
    }
    return value;
  } catch {
    if (!memorySession) memorySession = randomId();
    return memorySession;
  }
};

const standalone = () => {
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
    );
  } catch {
    return false;
  }
};

const anonymous = () => {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === '1' || nav.globalPrivacyControl === true;
};

const send = async (items: Item[]) => {
  try {
    await getMeshClient()
      .graphql()
      .mutate({
        mutation: TrackMutation as never,
        variables: {
          data: {
            items,
            standalone: standalone(),
            anonymous: anonymous(),
            locale: i18n.language ?? null,
            ua: navigator.userAgent,
          },
        },
      });
  } catch {
    // Statistics must never disturb the app – lost items are fine.
  }
};

const flush = () => {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (!queue.length) return;
  const items = queue.slice(0, 25);
  queue = queue.slice(25);
  void send(items);
  if (queue.length) flush();
};

const schedule = (soon = false) => {
  if (soon || queue.length >= 10) {
    flush();
    return;
  }
  if (!flushTimer) flushTimer = setTimeout(flush, FLUSH_MS);
};

const startPing = () => {
  if (pingTimer) return;
  pingTimer = setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    queue.push({ type: 'ping', session: sessionId(), path: currentPath });
    schedule(true);
  }, PING_MS);
};

let listening = false;
const listen = () => {
  if (listening || typeof document === 'undefined') return;
  listening = true;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
    else {
      // Back in the tab: sign of life right away.
      queue.push({ type: 'ping', session: sessionId(), path: currentPath });
      schedule(true);
    }
  });
  window.addEventListener('pagehide', flush);
};

/** A route change (pathname only – the server normalizes and strips private parts). */
export const statsView = (path: string) => {
  if (typeof window === 'undefined') return;
  listen();
  startPing();
  currentPath = path;
  const item: Item = { type: 'view', session: sessionId(), path };
  if (firstView) {
    firstView = false;
    try {
      item.referrer = document.referrer || null;
      item.ref = new URLSearchParams(window.location.search).get('ref');
    } catch {
      // ignore
    }
    queue.push(item);
    schedule(true);
    return;
  }
  queue.push(item);
  schedule();
};

/** Funnel step of the sign-in page. */
export const statsEvent = (name: StatsEventName) => {
  if (typeof window === 'undefined') return;
  queue.push({ type: 'event', session: sessionId(), name });
  schedule();
};
