import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePwa } from './use.pwa.ts';

/** "Ready for offline use" closes itself after this long (ms). */
const OFFLINE_READY_AUTO_CLOSE_MS = 6_000;

/**
 * Bottom drawer, once "ready for offline use" (closes itself after a few seconds).
 * A new version does NOT open a drawer anymore: the settings button in the dock / sidebar
 * gets a blinking dot and the update runs from the settings drawer (`PwaSettingsUpdate`).
 */
export const PwaUpdateNotifier = () => {
  const { t } = useTranslation('pwa');
  const { needRefresh, offlineReady } = usePwa();
  const [open, setOpen] = useState(false);
  const shown = useRef(false);

  useEffect(() => {
    // With a waiting update the offline hint is pointless (the page reloads anyway).
    if (!offlineReady || needRefresh || shown.current) return;
    shown.current = true;
    setOpen(true);
  }, [offlineReady, needRefresh]);

  // Informational only → closes by itself.
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setOpen(false), OFFLINE_READY_AUTO_CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="mx-auto w-full max-w-md">
        <div
          data-slot="pwa-offline-ready"
          className="flex flex-col px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-foreground/15" aria-hidden />

          <div className="flex items-center gap-4">
            <span className="relative shrink-0">
              <img
                src="/android-chrome-192x192.png"
                alt=""
                aria-hidden="true"
                className="size-16 rounded-[18px] shadow-md ring-1 ring-border/50"
                draggable={false}
              />
              <span
                aria-hidden="true"
                className="absolute -right-1.5 -bottom-1.5 grid size-7 place-items-center rounded-full bg-foreground text-background ring-2 ring-popover"
              >
                <CheckCircle2 className="size-4" />
              </span>
            </span>
            <div className="min-w-0">
              <DrawerTitle className="text-title font-extrabold tracking-tight">
                {t('offlineReady.title')}
              </DrawerTitle>
              <DrawerDescription className="mt-0.5 text-caption text-muted-foreground">
                {t('offlineReady.text')}
              </DrawerDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-6 h-12 rounded-full bg-foreground text-body font-bold text-background transition-opacity hover:opacity-90"
          >
            {t('offlineReady.done')}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
