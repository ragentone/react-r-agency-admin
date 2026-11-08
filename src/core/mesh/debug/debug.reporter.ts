import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import { DebugClientReportMutation } from './debug.graphql.ts';

/**
 * Client-side debug reporter. Collects errors (e.g. from `ErrorBoundary`), batches them and
 * sends them to the runtime mutation `debugClientReport`. Reporting must never throw or block
 * the UI: failed batches are dropped, unsent events are capped.
 */

export type DebugReportLevel = 'error' | 'warn' | 'info';

export interface IDebugReportEvent {
  level: DebugReportLevel;
  tag: string;
  message: string;
  error?: string;
}

const MAX_BATCH = 20;
const MAX_FIELD_LENGTH = 1000;
const QUEUE_CAPACITY = 200;
const BATCH_DELAY_MS = 1_000;
const SEND_TIMEOUT_MS = 5_000;

const queue: IDebugReportEvent[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;
let sending = false;

const clip = (value: unknown): string => String(value ?? '').slice(0, MAX_FIELD_LENGTH);

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('debug report timeout')), ms);
    promise.then(
      value => {
        clearTimeout(id);
        resolve(value);
      },
      err => {
        clearTimeout(id);
        reject(err);
      }
    );
  });

const scheduleFlush = () => {
  if (timer !== undefined || sending) return;
  timer = setTimeout(() => {
    timer = undefined;
    void flushDebugReports();
  }, BATCH_DELAY_MS);
};

/** Queues one event; drops it when the queue is full. */
export const reportDebugEvent = (event: IDebugReportEvent): void => {
  if (queue.length >= QUEUE_CAPACITY) return;
  queue.push({
    level: event.level,
    tag: clip(event.tag),
    message: clip(event.message),
    error: event.error !== undefined ? clip(event.error) : undefined,
  });
  scheduleFlush();
};

/** Convenience for caught errors (ErrorBoundary, catch blocks). */
export const reportClientError = (tag: string, error: unknown, extra?: string): void => {
  const err = error instanceof Error ? error : null;
  const message = err?.message ?? String(error);
  reportDebugEvent({
    level: 'error',
    tag,
    message: extra ? `${message} | ${extra}` : message,
    error: err?.stack ?? err?.name,
  });
};

/** Sends the next batch. Errors are swallowed on purpose (no loops, no UI impact). */
export const flushDebugReports = async (): Promise<void> => {
  if (sending || queue.length === 0) return;
  const batch = queue.splice(0, MAX_BATCH);
  sending = true;
  try {
    await withTimeout(
      getMeshClient()
        .graphql()
        .mutate({
          mutation: DebugClientReportMutation,
          variables: { events: batch },
        }),
      SEND_TIMEOUT_MS
    );
  } catch {
    // Not connected, timed out or rate limited → batch is dropped.
  } finally {
    sending = false;
    if (queue.length > 0) scheduleFlush();
  }
};

let globalHandlersInstalled = false;

/**
 * Reports uncaught errors (`window.onerror`) and unhandled promise rejections.
 * Safe to call more than once (HMR, provider re-mounts): handlers are registered only once.
 */
export const installDebugGlobalHandlers = (): void => {
  if (globalHandlersInstalled || typeof window === 'undefined') return;
  globalHandlersInstalled = true;

  window.addEventListener('error', (event: ErrorEvent) => {
    const location = event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : undefined;
    reportClientError('window.onerror', event.error ?? event.message, location);
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    reportClientError('unhandledrejection', event.reason);
  });
};
