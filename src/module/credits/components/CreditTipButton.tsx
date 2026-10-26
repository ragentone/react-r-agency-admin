import { cn } from '@ui/lib/utils';
import { Coins } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useCreditsEnabled, useCreditTipContext } from '../hooks.ts';
import { myCreditsId, openCreditTip } from '../store.ts';
import type { ICreditUser } from '../types.ts';

export interface ICreditTipButtonProps {
  /** Tip context of the app (`forum.tip`, `timeline.tip` …). */
  context: string;
  /** Reference the app resolves to the recipient (`post:<id>` …). */
  refId: string;
  /** Shown in the sheet – the runtime decides who really gets the credits. */
  recipient: ICreditUser | null | undefined;
  subject?: string | null;
  className?: string;
  /** Icon size class (default `size-4`). */
  iconClassName?: string;
  /** Label next to the icon (otherwise icon only). */
  showLabel?: boolean;
  onSuccess?: (received: number) => void;
}

/**
 * "Send credits" button for apps – hidden for guests, own content and when the context is
 * disabled (or the credits module is not active).
 */
export const CreditTipButton: React.FC<ICreditTipButtonProps> = ({
  context,
  refId,
  recipient,
  subject,
  className,
  iconClassName,
  showLabel = false,
  onSuccess,
}) => {
  const { t } = useTranslation('credits');
  const enabled = useCreditsEnabled();
  const tip = useCreditTipContext(context);
  if (!enabled || !tip || !recipient?.id || recipient.id === myCreditsId()) return null;
  const label = t('tip.button', { name: recipient.alias });

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={event => {
        event.stopPropagation();
        openCreditTip({ context, refId, recipient, subject, onSuccess });
      }}
      className={cn(
        'group/tip inline-flex h-9 items-center gap-1.5 rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/[0.06] hover:text-foreground active:bg-foreground/[0.1] focus-visible:ring-2 focus-visible:ring-ring',
        showLabel ? 'px-3 text-sm font-semibold' : 'w-9 justify-center',
        className
      )}
    >
      <Coins
        className={cn('size-4 transition-transform group-active/tip:scale-90', iconClassName)}
        strokeWidth={1.9}
        aria-hidden="true"
      />
      {showLabel && <span>{t('tip.short')}</span>}
    </button>
  );
};
