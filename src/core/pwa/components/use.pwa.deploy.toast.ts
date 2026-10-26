import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { PWA_DEPLOY_READY_MAX_MS, PWA_DEPLOY_TOAST_ID, PWA_DEPLOY_TOAST_MAX_MS } from '../const';
import type { IPwaRelease } from '../types';

/**
 * Toasts for every open tab while a frontend deploy runs (one toast, replaced in place):
 * 1. build started → "Installing an update …" (spinner, closes itself after 15 min)
 * 2. new version ready here (service worker waiting / no worker) → "New version 1.1.0" with the
 *    first "what's new" note and "Update". Required versions: cannot be dismissed (also when
 *    the tab only found out by asking, not by the push).
 * Same build as this tab (or dev) → the first toast just goes. "Update" = `update` of the PWA
 * context, so it only shows once the new worker is really waiting (no reload into the old app).
 */
export const usePwaDeployToast = (
  updateWaiting: boolean,
  update: () => Promise<void>,
  available: IPwaRelease | null
) => {
  const { t } = useTranslation('pwa');
  /** A `version` push arrived and the "new version" toast is still to come. */
  const announce = useRef(false);
  /** Version the "new version" toast was shown for (no repeat). */
  const shownFor = useRef<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const updateRef = useRef(update);
  useEffect(() => {
    updateRef.current = update;
  });

  const later = useCallback((ms: number, fn: () => void) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(fn, ms);
  }, []);

  const onDeployStart = useCallback(() => {
    toast.loading(t('deploy.before.title'), {
      id: PWA_DEPLOY_TOAST_ID,
      description: t('deploy.before.text'),
      duration: Number.POSITIVE_INFINITY,
    });
    later(PWA_DEPLOY_TOAST_MAX_MS, () => toast.dismiss(PWA_DEPLOY_TOAST_ID));
  }, [later, t]);

  const onVersion = useCallback(
    (release: IPwaRelease | null) => {
      if (!release) {
        announce.current = false;
        window.clearTimeout(timer.current);
        toast.dismiss(PWA_DEPLOY_TOAST_ID);
        return;
      }
      announce.current = true;
      // The new worker never showed up → don't leave the spinner (the dot may still come later).
      later(PWA_DEPLOY_READY_MAX_MS, () => {
        if (!announce.current) return;
        announce.current = false;
        toast.dismiss(PWA_DEPLOY_TOAST_ID);
      });
    },
    [later]
  );

  const required = Boolean(available?.required);
  const version = available?.version ?? null;
  const note = available?.notes[0] ?? null;

  useEffect(() => {
    if (!updateWaiting || !(announce.current || required)) return;
    const key = version ?? 'unknown';
    if (shownFor.current === key && !announce.current) return;
    shownFor.current = key;
    announce.current = false;
    window.clearTimeout(timer.current);
    toast(version ? t('update.titleVersion', { version }) : t('update.title'), {
      id: PWA_DEPLOY_TOAST_ID,
      description: required ? t('update.requiredText') : (note ?? t('update.text')),
      duration: Number.POSITIVE_INFINITY,
      closeButton: !required,
      dismissible: !required,
      action: {
        label: t('update.action'),
        onClick: () => void updateRef.current(),
      },
    });
  }, [note, required, t, updateWaiting, version]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { onDeployStart, onVersion };
};
