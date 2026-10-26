import { useEffect, useRef } from 'react';

import { PWA_REQUIRED_RELOAD_MS, PWA_REQUIRED_RETRY_MS } from '../const';

/** Something is being typed / a form is open → don't reload yet. */
const busy = () => {
  const active = document.activeElement as HTMLElement | null;
  if (active?.matches('input, textarea, select, [contenteditable="true"], [contenteditable=""]')) {
    return true;
  }
  return Boolean(
    document.querySelector('[role="dialog"] form, [role="alertdialog"], [data-vaul-drawer] form')
  );
};

/**
 * Required update waiting: load it by itself after a minute – but not while something is being
 * edited (then try again every 15 s). The toast with "Update" is visible the whole time.
 */
export const usePwaRequiredReload = (active: boolean, update: () => Promise<void>) => {
  const updateRef = useRef(update);
  useEffect(() => {
    updateRef.current = update;
  });

  useEffect(() => {
    if (!active) return;
    let timer: number | undefined;
    const attempt = () => {
      if (busy()) {
        timer = window.setTimeout(attempt, PWA_REQUIRED_RETRY_MS);
        return;
      }
      void updateRef.current();
    };
    timer = window.setTimeout(attempt, PWA_REQUIRED_RELOAD_MS);
    return () => window.clearTimeout(timer);
  }, [active]);
};
