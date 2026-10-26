import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import {
  PWA_INSTALL_DISMISS_DAYS,
  PWA_INSTALL_PROMPT_DELAY_MS,
  PWA_STORAGE_DISMISSED,
  PWA_UPDATE_INTERVAL_MS,
} from '../const';
import {
  clearDeferredInstallPrompt,
  getDeferredInstallPrompt,
  isIosSafari,
  isStandalone,
  useInstallPrompt,
} from '../hooks/use.install.prompt.ts';
import { useOnline } from '../hooks/use.online.ts';
import type { IPwaContext, IPwaRelease, PwaInstallOutcome } from '../types';
import { PwaContext } from './pwa.context.ts';
import { PwaInstallSheet } from './PwaInstallSheet.tsx';
import { PwaOfflineIndicator } from './PwaOfflineIndicator.tsx';
import { PwaUpdateNotifier } from './PwaUpdateNotifier.tsx';
import { PwaWhatsNew } from './PwaWhatsNew.tsx';
import { usePwaDeployToast } from './use.pwa.deploy.toast.ts';
import { usePwaRequiredReload } from './use.pwa.required.reload.ts';
import { usePwaVersionLive } from './use.pwa.version.live.ts';

const readDismissedAt = () => {
  try {
    return Number(localStorage.getItem(PWA_STORAGE_DISMISSED)) || 0;
  } catch {
    return 0;
  }
};
const writeDismissedAt = (value: number) => {
  try {
    localStorage.setItem(PWA_STORAGE_DISMISSED, String(value));
  } catch {
    /* private mode – ignore */
  }
};

/**
 * PWA control: service worker registration + update prompt, offline state,
 * install prompt (native or iOS instructions). Registered in `core/pwa/core.tsx`.
 */
export const PwaProvider = ({ children }: { children: ReactNode }) => {
  const online = useOnline();
  const { available, justInstalled } = useInstallPrompt();
  const [installSheetOpen, setInstallSheetOpen] = useState(false);
  const [standalone] = useState(isStandalone);
  const [ios] = useState(isIosSafari);

  const updateIntervalRef = useRef<number | undefined>(undefined);
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined);
  // New build announced by the runtime, but no service worker here → plain reload.
  const [serverVersion, setServerVersion] = useState(false);
  // Internal versions (runtime): this tab and a newer live build.
  const [own, setOwn] = useState<IPwaRelease | null>(null);
  const [newer, setNewer] = useState<IPwaRelease | null>(null);
  useEffect(() => () => window.clearInterval(updateIntervalRef.current), []);

  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      registrationRef.current = registration;
      // Look for new versions regularly (long-running tabs / installed app).
      // Only one interval at a time – cleared on unmount / re-registration (hot reload).
      window.clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = window.setInterval(() => {
        if (navigator.onLine) void registration.update();
      }, PWA_UPDATE_INTERVAL_MS);
    },
    onRegisterError(error) {
      console.warn('[pwa] service worker registration failed', error);
    },
  });

  const installed = standalone || justInstalled;
  const updateWaiting = needRefresh || serverVersion;
  const canInstall = available && !installed;
  const iosInstallable = ios && !installed;

  const install = useCallback(async (): Promise<PwaInstallOutcome> => {
    const prompt = getDeferredInstallPrompt();
    if (!prompt) return 'unavailable';
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    // A prompt can only be used once.
    clearDeferredInstallPrompt();
    if (outcome === 'accepted') setInstallSheetOpen(false);
    return outcome;
  }, []);

  // Activates the waiting worker → the page reloads on `controllerchange`. If nothing is waiting
  // (dev server, already activated elsewhere) the click would seem dead → reload ourselves.
  const update = useCallback(async () => {
    const fallback = window.setTimeout(() => window.location.reload(), 1500);
    try {
      await updateServiceWorker(true);
    } catch (error) {
      console.warn('[pwa] update failed', error);
      window.clearTimeout(fallback);
      window.location.reload();
    }
  }, [updateServiceWorker]);

  // Deploy running / new version: toast in every open tab (+ the blinking dot as before).
  const deployToast = usePwaDeployToast(updateWaiting, update, newer);
  usePwaVersionLive(registrationRef, {
    onWithoutWorker: () => setServerVersion(true),
    onDeployStart: deployToast.onDeployStart,
    onVersion: deployToast.onVersion,
    onAvailable: setNewer,
    onOwn: setOwn,
  });
  // Required version waiting → loads by itself after a minute when nothing is being edited.
  usePwaRequiredReload(updateWaiting && Boolean(newer?.required), update);

  const closeInstallSheet = useCallback((dismiss = true) => {
    setInstallSheetOpen(false);
    if (dismiss) writeDismissedAt(Date.now());
  }, []);

  // Offer the install once per visit after a while – not again for some days after "Not now".
  useEffect(() => {
    if (!canInstall && !iosInstallable) return;
    const dismissedAt = readDismissedAt();
    if (Date.now() - dismissedAt < PWA_INSTALL_DISMISS_DAYS * 86_400_000) return;
    const timer = window.setTimeout(() => setInstallSheetOpen(true), PWA_INSTALL_PROMPT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [canInstall, iosInstallable]);

  const value = useMemo<IPwaContext>(
    () => ({
      canInstall,
      iosInstallable,
      installed,
      install,
      installSheetOpen,
      openInstallSheet: () => setInstallSheetOpen(true),
      closeInstallSheet,
      needRefresh: updateWaiting,
      update,
      version: own?.version ?? null,
      available: newer,
      offlineReady,
      online,
    }),
    [
      canInstall,
      closeInstallSheet,
      install,
      installSheetOpen,
      installed,
      iosInstallable,
      newer,
      offlineReady,
      online,
      own,
      update,
      updateWaiting,
    ]
  );

  return (
    <PwaContext.Provider value={value}>
      {children}
      <PwaUpdateNotifier />
      <PwaOfflineIndicator />
      <PwaInstallSheet />
      <PwaWhatsNew own={own} />
    </PwaContext.Provider>
  );
};
