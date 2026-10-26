import { isNativeApp } from '@core/native';
import { BellRing, Loader2, X } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useSystemNotify } from '../system';

/**
 * Offer at the top of the drawer: notifications on this device (system notifications in the
 * app / browser). Hidden once switched on or dismissed.
 */
export const NotifySystemBanner: React.FC = () => {
  const { t } = useTranslation('notify');
  const { offer, denied, enable, dismiss } = useSystemNotify();
  const [busy, setBusy] = useState(false);

  if (!offer) return null;

  const app = isNativeApp();

  const onEnable = async () => {
    setBusy(true);
    const ok = await enable();
    setBusy(false);
    if (ok) toast.success(t('system.enabled'));
    else toast.error(t(app ? 'system.deniedApp' : 'system.deniedBrowser'));
  };

  return (
    <div className="mx-4 mt-3 flex items-start gap-3 rounded-2xl border border-border/60 p-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground text-background">
        <BellRing className="size-5" strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-body leading-5 font-bold">{t('system.title')}</p>
        <p className="mt-0.5 text-caption text-muted-foreground">
          {denied
            ? t(app ? 'system.deniedApp' : 'system.deniedBrowser')
            : t(app ? 'system.textApp' : 'system.textBrowser')}
        </p>
        {!denied && (
          <button
            type="button"
            onClick={() => void onEnable()}
            disabled={busy}
            className="mt-2.5 inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-bold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {t('system.enable')}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('system.dismiss')}
        className="-mt-1 -mr-1 grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
};
