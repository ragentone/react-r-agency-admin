import { Dices, Landmark, Ticket } from 'lucide-react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { CreditsLoadMore } from '../components/CreditsUi.tsx';
import { useCreditsCatalog } from '../hooks.ts';
import { reasonLabel, relativeTime, signedCredits } from '../utils.ts';
import { useCreditsBankHistory } from './use.credits.admin.ts';

/** Movements of the bank and the voucher reserve – what moved and why, never who. */
export const CreditsBankHistory: React.FC = () => {
  const { t, i18n } = useTranslation('credits');
  const locale = i18n.resolvedLanguage || i18n.language;
  const catalog = useCreditsCatalog();
  const { rows, hasMore, load } = useCreditsBankHistory();

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="border-t border-border/50 py-2">
      <h2 className="px-4 pt-2 pb-1 text-title font-bold">{t('admin.bank.history')}</h2>
      {!rows.length && (
        <p className="px-4 py-6 text-center text-body text-muted-foreground">
          {t('history.emptyTitle')}
        </p>
      )}
      <ul className="divide-y divide-border/40">
        {rows.map(row => {
          const Icon =
            row.wallet === 'reserve' ? Ticket : row.wallet === 'escrow' ? Dices : Landmark;
          return (
            <li key={row.id} className="flex items-center gap-3 px-4 py-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground/[0.06]">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-semibold">
                  {reasonLabel(
                    t,
                    { reason: row.reason, kind: row.byAdmin ? 'admin' : 'bank' },
                    catalog
                  )}
                </p>
                <p className="truncate text-caption text-muted-foreground">
                  {[
                    t(`admin.bank.wallet.${row.wallet}`),
                    row.note,
                    relativeTime(row.createdAt, locale),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <span className="shrink-0 text-body font-bold tabular-nums">
                {signedCredits(row.amount, locale)}
              </span>
            </li>
          );
        })}
      </ul>
      {hasMore && (
        <CreditsLoadMore label={t('actions.loadMore')} onClick={() => void load(rows.length)} />
      )}
    </section>
  );
};
