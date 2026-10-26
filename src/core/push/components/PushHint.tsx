import { cn } from '@ui/lib/utils';
import { BellRing, Loader2, X } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { PUSH_HINT_DISMISSED_KEY } from '../const';
import { pushStorage, usePushStore } from '../push';

/**
 * Small card "Turn on notifications" (e.g. in the messenger) – only while the browser
 * has not been asked yet. The permission prompt needs this click (user gesture).
 */
export const PushHint: React.FC<{ className?: string; accent?: string }> = ({
  className,
  accent,
}) => {
  const { t } = useTranslation('push');
  const status = usePushStore(state => state.status);
  const busy = usePushStore(state => state.busy);
  const [dismissed, setDismissed] = useState(
    () => pushStorage.get(PUSH_HINT_DISMISSED_KEY) === '1'
  );

  if (dismissed || status !== 'default') return null;

  const enable = async () => {
    const result = await usePushStore.getState().enable();
    if (result === 'on') toast.success(t('result.on'));
    else if (result === 'denied') toast.error(t('result.denied'));
  };
  const dismiss = () => {
    pushStorage.set(PUSH_HINT_DISMISSED_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className={cn('flex items-start gap-3 rounded-2xl bg-foreground/[0.05] p-3', className)}>
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-full',
          accent ? 'text-white' : 'bg-foreground text-background'
        )}
        style={accent ? { backgroundColor: accent } : undefined}
      >
        <BellRing className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-body font-bold leading-5">{t('hint.title')}</p>
        <p className="text-caption text-muted-foreground">{t('hint.text')}</p>
        <button
          type="button"
          onClick={() => void enable()}
          disabled={busy}
          style={accent ? { color: accent } : undefined}
          className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-bold hover:underline disabled:opacity-60"
        >
          {busy && <Loader2 className="size-3.5 animate-spin" />}
          {t('hint.enable')}
        </button>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('hint.dismiss')}
        title={t('hint.dismiss')}
        className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-foreground/[0.06]"
      >
        <X className="size-4" />
      </button>
    </div>
  );
};
