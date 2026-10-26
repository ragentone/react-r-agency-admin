import { cn } from '@ui/lib';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import { Download, Loader2, Maximize2, Share, SquarePlus, WifiOff, Zap } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePwa } from './use.pwa.ts';

const BENEFITS = [
  { icon: Zap, key: 'fast' },
  { icon: WifiOff, key: 'offline' },
  { icon: Maximize2, key: 'fullscreen' },
] as const;

/** Bottom sheet: why install + native install button, or the iOS "Add to Home Screen" steps. */
export const PwaInstallSheet = () => {
  const { t } = useTranslation('pwa');
  const { installSheetOpen, closeInstallSheet, canInstall, iosInstallable, install } = usePwa();
  const [busy, setBusy] = useState(false);

  if (!canInstall && !iosInstallable) return null;

  const onInstall = async () => {
    setBusy(true);
    try {
      const outcome = await install();
      if (outcome !== 'accepted') closeInstallSheet(outcome === 'dismissed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer open={installSheetOpen} onOpenChange={open => !open && closeInstallSheet()}>
      <DrawerContent className="mx-auto w-full max-w-md">
        <div className="flex flex-col px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-foreground/15" aria-hidden />

          <div className="flex items-center gap-4">
            <img
              src="/android-chrome-192x192.png"
              alt=""
              aria-hidden="true"
              className="size-16 shrink-0 rounded-[18px] shadow-md ring-1 ring-border/50"
              draggable={false}
            />
            <div className="min-w-0">
              <DrawerTitle className="text-title font-extrabold tracking-tight">
                {t('install.title')}
              </DrawerTitle>
              <DrawerDescription className="mt-0.5 text-caption text-muted-foreground">
                {t('install.subtitle')}
              </DrawerDescription>
            </div>
          </div>

          <ul className="mt-5 flex flex-col gap-2">
            {BENEFITS.map(({ icon: Icon, key }) => (
              <li
                key={key}
                className="flex items-center gap-3 rounded-2xl bg-foreground/[0.035] px-3.5 py-3"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-background ring-1 ring-border/50">
                  <Icon className="size-4" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-body font-semibold">
                    {t(`install.benefits.${key}.title`)}
                  </span>
                  <span className="block text-caption text-muted-foreground">
                    {t(`install.benefits.${key}.text`)}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {canInstall ? (
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => void onInstall()}
                disabled={busy}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground text-body font-bold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                {t('install.action')}
              </button>
              <button
                type="button"
                onClick={() => closeInstallSheet()}
                className="h-11 rounded-full text-body font-semibold text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
              >
                {t('install.later')}
              </button>
            </div>
          ) : (
            <>
              <ol className="mt-6 flex flex-col gap-3 rounded-2xl border border-border/50 p-4">
                {[
                  { icon: Share, text: t('install.ios.step1') },
                  { icon: SquarePlus, text: t('install.ios.step2') },
                  { icon: null, text: t('install.ios.step3') },
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-3 text-body">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-foreground text-caption font-bold text-background">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">{step.text}</span>
                    {step.icon && (
                      <step.icon className={cn('size-5 shrink-0 text-muted-foreground')} />
                    )}
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => closeInstallSheet()}
                className="mt-4 h-12 rounded-full bg-foreground text-body font-bold text-background transition-opacity hover:opacity-90"
              >
                {t('install.ios.done')}
              </button>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
