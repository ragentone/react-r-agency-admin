import { useRouter } from '@tanstack/react-router';
import { createContext, useContext, useEffect, useId, useRef } from 'react';

/**
 * "Back closes the dialog" for every dialog, sheet, drawer and alert dialog –
 * without changing the routing (no URL change, no extra history entries).
 *
 * How: while at least one such dialog is open, a blocker is registered on the router
 * history. A browser/Android back (popstate BACK) is then undone by the history and the
 * topmost open dialog is closed instead. Dialogs that live in the URL (entry detail,
 * profile, love chat) don't register – back navigates and closes them as before.
 *
 * Limitation: back on the very first page of the tab has no in-app entry to intercept,
 * the browser leaves the page. The Flutter app asks `window.__rAgencyBack()` first instead.
 */

/** Marks a dialog element (role="dialog") as back-closable; value = registry id. */
export const BACK_CLOSE_ATTR = 'data-back-close';

const OPEN_DIALOGS = [
  '[role="dialog"][data-state="open"]',
  '[role="alertdialog"][data-state="open"]',
  '[role="dialog"][data-open]',
  '[role="alertdialog"][data-open]',
].join(',');

interface IEntry {
  id: string;
  close: () => void;
}

type RouterHistory = ReturnType<typeof useRouter>['history'];

const stack: IEntry[] = [];
let release: (() => void) | null = null;

/** Topmost open dialog decides: back-closable → close it; URL dialog → let back navigate. */
const topEntry = (): IEntry | null => {
  const open = document.querySelectorAll<HTMLElement>(OPEN_DIALOGS);
  const top = open[open.length - 1];
  if (!top) return stack[stack.length - 1] ?? null;
  const id = top.getAttribute(BACK_CLOSE_ATTR);
  return id ? (stack.find(entry => entry.id === id) ?? null) : null;
};

/**
 * Native back (Flutter WebView, `lib/webview_page.dart`): closes the topmost back-closable
 * dialog without going through history – also works on the first page, where there is no
 * history entry to intercept. `true` = handled; otherwise the app navigates back / exits.
 */
export const handleNativeBack = (): boolean => {
  const entry = topEntry();
  if (!entry) return false;
  entry.close();
  return true;
};

if (typeof window !== 'undefined') {
  (window as Window & { __rAgencyBack?: () => boolean }).__rAgencyBack = handleNativeBack;
}

const ensureBlocker = (history: RouterHistory) => {
  if (release) return;
  release = history.block({
    enableBeforeUnload: false,
    blockerFn: ({ action }: { action: string }) => {
      if (action !== 'BACK') return false;
      const entry = topEntry();
      if (!entry) return false;
      entry.close();
      return true;
    },
  });
};

const removeEntry = (id: string) => {
  const index = stack.findIndex(entry => entry.id === id);
  if (index >= 0) stack.splice(index, 1);
  if (stack.length === 0 && release) {
    release();
    release = null;
  }
};

/**
 * Registers an open dialog: back calls `close`. Returns the id for `BACK_CLOSE_ATTR`
 * on the dialog content (needed to find the topmost dialog).
 */
export function useBackClose(open: boolean, close: () => void, enabled = true): string {
  const id = useId();
  const router = useRouter({ warn: false });
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  useEffect(() => {
    if (!open || !enabled || !router) return;
    stack.push({ id, close: () => closeRef.current() });
    ensureBlocker(router.history);
    return () => removeEntry(id);
  }, [open, enabled, router, id]);

  return id;
}

export const BackCloseIdContext = createContext<string | undefined>(undefined);

/** Spread on the dialog content: `{...useBackCloseProps()}`. */
export const useBackCloseProps = () => {
  const id = useContext(BackCloseIdContext);
  return id ? { [BACK_CLOSE_ATTR]: id } : {};
};
