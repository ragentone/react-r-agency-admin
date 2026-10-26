import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { CreditsErrorState } from '../components/CreditsUi.tsx';
import { useCreditsFormat } from '../hooks.ts';
import { CreditsRegistry } from '../registry.ts';
import { creditErrorText } from '../utils.ts';
import { CreditsAdminBank } from './CreditsAdminBank.tsx';
import { CreditsAdminChart } from './CreditsAdminChart.tsx';
import { CreditsBankHistory } from './CreditsBankHistory.tsx';
import { useCreditsAdminOverview } from './use.credits.admin.ts';

/** Bank, sums over all users (no single users) and the bank's movements. */
export const CreditsAdminOverview: React.FC = () => {
  const { t } = useTranslation('credits');
  const format = useCreditsFormat();
  const { overview, error, reload } = useCreditsAdminOverview();
  useEffect(() => {
    void reload();
  }, [reload]);

  if (error && !overview) {
    return (
      <CreditsErrorState
        text={creditErrorText(t, error)}
        retryLabel={t('actions.retry')}
        onRetry={() => void reload()}
      />
    );
  }
  if (!overview) {
    return (
      <div aria-busy="true" className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  const kpis = [
    ['circulation', overview.circulation],
    ['wallets', overview.wallets],
    ['todayEarned', overview.today.earned],
    ['todaySpent', overview.today.spent],
    ['todayTransferred', overview.today.transferred],
    ['frozen', overview.frozen],
  ] as const;

  return (
    <>
      <CreditsAdminBank bank={overview.bank} onChanged={() => void reload()} />
      <CreditsAdminChart />
      <p className="px-4 pt-3 text-caption text-muted-foreground">{t('admin.sumsOnly')}</p>

      <dl className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
        {kpis.map(([key, value]) => (
          <div key={key} className="min-w-0 rounded-2xl border border-border/60 px-4 py-3">
            <dt className="truncate text-caption font-semibold text-muted-foreground">
              {t(`admin.kpi.${key}`)}
            </dt>
            <dd className="mt-1 truncate text-title font-bold tabular-nums">{format(value)}</dd>
          </div>
        ))}
      </dl>

      <section className="border-t border-border/50 py-2">
        <h2 className="px-4 pt-2 pb-1 text-title font-bold">{t('admin.apps')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-body">
            <thead>
              <tr className="text-caption text-muted-foreground">
                <th scope="col" className="px-4 py-2 text-left font-semibold">
                  {t('admin.app')}
                </th>
                <th scope="col" className="px-4 py-2 text-right font-semibold">
                  {t('admin.earned')}
                </th>
                <th scope="col" className="px-4 py-2 text-right font-semibold">
                  {t('admin.spent')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {overview.apps.map(row => {
                const entry = CreditsRegistry.app(row.app);
                return (
                  <tr key={row.app}>
                    <td className="px-4 py-2.5 font-semibold">
                      {entry ? t(entry.label) : row.app}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{format(row.earned)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{format(row.spent)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <CreditsBankHistory />
    </>
  );
};
