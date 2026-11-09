import { isNativeApp } from '@core/native';
import { Button } from '@ui/shad-cn/components/button';
import { BellRing, X } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useSystemNotify } from '../system';

/**
 * Offer at the top of the drawer: notifications on this device (system notifications in the
 * app / browser). Hidden once switched on or dismissed. Flat row like a notification.
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
    <div className="flex items-start gap-3 border-b border-border/50 px-4 py-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground/6 text-foreground">
        <BellRing className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-body font-bold text-foreground">{t('system.title')}</p>
        <p className="mt-0.5 text-caption text-muted-foreground">
          {denied
            ? t(app ? 'system.deniedApp' : 'system.deniedBrowser')
            : t(app ? 'system.textApp' : 'system.textBrowser')}
        </p>
        {!denied && (
          <Button size="md" onClick={() => void onEnable()} isLoading={busy} className="mt-2.5">
            {t('system.enable')}
          </Button>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon-md"
        onClick={dismiss}
        aria-label={t('system.dismiss')}
        className="-mt-1 -mr-2 text-muted-foreground"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
};
