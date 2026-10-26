import { cn } from '@ui/lib/utils';
import { Coins } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { formatCredits, signedCredits } from '../utils.ts';

export interface ICreditsAmountProps {
  value: number;
  /** `+5` / `−5` instead of `5`. */
  signed?: boolean;
  /** Coin icon in front. */
  icon?: boolean;
  className?: string;
  iconClassName?: string;
}

/** Credits amount in the UI language (tabular numbers, optional coin). */
export const CreditsAmount: React.FC<ICreditsAmountProps> = ({
  value,
  signed = false,
  icon = true,
  className,
  iconClassName,
}) => {
  const { t, i18n } = useTranslation('credits');
  const locale = i18n.resolvedLanguage || i18n.language;
  return (
    <span
      className={cn('inline-flex items-center gap-1 tabular-nums', className)}
      aria-label={t('amount', { count: value, value: formatCredits(value, locale) })}
    >
      {icon && <Coins className={cn('size-[1em] shrink-0', iconClassName)} aria-hidden="true" />}
      <span aria-hidden="true">
        {signed ? signedCredits(value, locale) : formatCredits(value, locale)}
      </span>
    </span>
  );
};
