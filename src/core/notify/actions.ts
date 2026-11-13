import type { INotifyAction, INotifyItem } from './types';

/** Context handed to an action handler. */
export interface INotifyActionContext {
  item: INotifyItem;
  action: INotifyAction;
  /** Closes the notification drawer. */
  close: () => void;
}

/**
 * Result of an action:
 * - `ok` – done (notification is deleted when the action has `delete`, else marked as read).
 * - `failed` – try again later (network …): the notification stays, error toast.
 * - `stale` – the reason is gone (e.g. the request was answered / withdrawn already):
 *   the notification is removed and the user gets a short hint.
 */
export type NotifyActionOutcome = 'ok' | 'failed' | 'stale';

/**
 * Handles the `emit` of a notification button. Resolve `false` (or throw) when it failed,
 * `'stale'` when there is nothing to do anymore – anything else counts as success.
 */
export type NotifyActionHandler = (
  payload: Record<string, unknown>,
  context: INotifyActionContext
) => unknown | Promise<unknown>;

/** Texts of the confirm dialog shown before an action runs (already translated). */
export interface INotifyActionConfirm {
  title: string;
  text: string;
  action: string;
  destructive?: boolean;
}

export interface INotifyActionOptions {
  /** Ask before running (e.g. "block") – return `null` to skip the dialog. */
  confirm?: (context: Omit<INotifyActionContext, 'close'>) => INotifyActionConfirm | null;
}

interface IEntry {
  handler: NotifyActionHandler;
  options: INotifyActionOptions;
}

const handlers = new Map<string, IEntry>();

/**
 * Registry of notification button handlers – modules register the `emit` names their
 * backend sends (see `core/notify/core.tsx` for the friend request buttons).
 *
 * ```ts
 * NotifyActions.register('forum::open_post', ({ id }) => openPost(String(id)));
 * ```
 */
export const NotifyActions = {
  /** Returns an unregister function. Registering the same `emit` again replaces it. */
  register(emit: string, handler: NotifyActionHandler, options: INotifyActionOptions = {}) {
    const entry: IEntry = { handler, options };
    handlers.set(emit, entry);
    return () => {
      if (handlers.get(emit) === entry) handlers.delete(emit);
    };
  },

  has(emit: string) {
    return handlers.has(emit);
  },

  /** Confirm texts for this action, or null (run right away). */
  confirmOf(context: Omit<INotifyActionContext, 'close'>): INotifyActionConfirm | null {
    return handlers.get(context.action.emit)?.options.confirm?.(context) ?? null;
  },

  /** Runs the handler of `action.emit`. Unknown emits count as success. */
  async run(context: INotifyActionContext): Promise<NotifyActionOutcome> {
    const entry = handlers.get(context.action.emit);
    if (!entry) {
      console.warn(`[notify] no handler for "${context.action.emit}"`);
      return 'ok';
    }
    try {
      const result = await entry.handler(context.action.payload ?? {}, context);
      if (result === 'stale') return 'stale';
      return result === false ? 'failed' : 'ok';
    } catch (error) {
      console.warn(`[notify] action "${context.action.emit}" failed`, error);
      return 'failed';
    }
  },
};
