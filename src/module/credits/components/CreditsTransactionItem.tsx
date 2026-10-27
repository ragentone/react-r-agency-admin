import { cn } from '@ui/lib/utils';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  Dices,
  HandCoins,
  Landmark,
  type LucideIcon,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Ticket,
} from 'lucide-react';
import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { CreditsRegistry } from '../registry.ts';
import type { ICreditCatalog, ICreditTransaction } from '../types.ts';
import { reasonLabel, relativeTime, signedCredits } from '../utils.ts';
import { CreditsAvatar } from './CreditsAvatar.tsx';

const KIND_ICONS: Record<ICreditTransaction['kind'], LucideIcon> = {
  earn: Sparkles,
  revoke: RotateCcw,
  purchase: ShoppingBag,
  refund: RotateCcw,
  transfer_in: ArrowDownLeft,
  transfer_out: ArrowUpRight,
  admin: ShieldCheck,
  voucher: Ticket,
  bank: Landmark,
  stake: Dices,
  payout: HandCoins,
};

export interface ICreditsTransactionItemProps {
  row: ICreditTransaction;
  catalog: ICreditCatalog | null;
  /** Extra action (admin: reverse). */
  action?: ReactNode;
}

/** One booking – icon, what for, who / app · time, amount (X-style row). */
export const CreditsTransactionItem: React.FC<ICreditsTransactionItemProps> = ({
  row,
  catalog,
  action,
}) => {
  const { t, i18n } = useTranslation('credits');
  const locale = i18n.resolvedLanguage || i18n.language;
  const app = CreditsRegistry.app(row.app);
  const Icon = (row.kind === 'earn' && app?.icon) || KIND_ICONS[row.kind] || Coins;
  const transfer = row.kind === 'transfer_in' || row.kind === 'transfer_out';
  const positive = row.amount > 0;
  const meta = [
    transfer && row.counterparty
      ? t(row.kind === 'transfer_in' ? 'history.from' : 'history.to', {
          name: row.counterparty.alias || t('history.deletedUser'),
        })
      : app
        ? t(app.label)
        : row.app === 'core'
          ? null
          : row.app,
    relativeTime(row.createdAt, locale),
  ].filter(Boolean);

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      {transfer && row.counterparty ? (
        <CreditsAvatar user={row.counterparty} />
      ) : (
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground/[0.06]">
          <Icon className="size-[18px]" strokeWidth={1.9} aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-semibold text-foreground">
          {reasonLabel(t, row, catalog)}
        </p>
        <p className="truncate text-caption text-muted-foreground">
          <time dateTime={row.createdAt}>{meta.join(' · ')}</time>
        </p>
        {row.note && (
          <p className="mt-0.5 line-clamp-2 text-caption break-words text-foreground/80">
            “{row.note}”
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span
          className={cn(
            'text-body font-bold tabular-nums',
            positive ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {signedCredits(row.amount, locale)}
        </span>
        {action}
      </div>
    </li>
  );
};
