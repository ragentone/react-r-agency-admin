import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { ChevronRight, CircleAlert, Coins, Flame, Lock, ReceiptText, Trophy } from 'lucide-react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { CREDITS_ROUTE, CREDITS_TOP_ROUTE } from '../const.ts';
import { useCreditsCatalog, useCreditsFormat } from '../hooks.ts';
import { useCreditsStore } from '../store.ts';
import type { CreditHistoryFilter } from '../types.ts';
import { creditErrorText } from '../utils.ts';
import { creditsRowInteractive } from './credits.classes.ts';
import { CreditsEarnList, CreditsSpendList } from './CreditsCatalogLists.tsx';
import { CreditsRedeemCard } from './CreditsRedeemCard.tsx';
import { CreditsTransactionItem } from './CreditsTransactionItem.tsx';
import {
  CreditsChips,
  CreditsEmptyState,
  CreditsErrorState,
  CreditsLoadMore,
  CreditsPageHeader,
  CreditsStats,
  CreditsTabs,
} from './CreditsUi.tsx';

type Tab = 'history' | 'earn' | 'spend';
const TABS: Tab[] = ['history', 'earn', 'spend'];
const FILTERS: CreditHistoryFilter[] = ['all', 'in', 'out'];

const pill =
  'inline-flex h-8 max-w-full items-center gap-1.5 rounded-full bg-foreground/[0.06] px-3 text-caption font-semibold text-foreground';

/** `/credits`: balance, streak, today's limit + history / how to earn / what to spend on. */
export const CreditsWalletView: React.FC = () => {
  const { t } = useTranslation('credits');
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { tab?: string; code?: string };
  const tab: Tab = TABS.includes(search.tab as Tab) ? (search.tab as Tab) : 'history';
  const catalog = useCreditsCatalog();

  useEffect(() => {
    void useCreditsStore.getState().refreshWallet(true);
  }, []);

  const selectTab = (next: Tab) =>
    void navigate({ to: CREDITS_ROUTE, search: { tab: next } as never, replace: true });

  return (
    <div
      data-slot="credits"
      className="mx-auto flex min-h-dvh w-full flex-col bg-background overflow-x-hidden"
    >
      <CreditsPageHeader title={t('title')} subtitle={t('subtitle')}>
        <CreditsTabs
          tabs={TABS}
          value={tab}
          onChange={selectTab}
          labelOf={item => t(`tabs.${item}`)}
          label={t('title')}
          idPrefix="credits-tab"
          panelId="credits-panel"
        />
      </CreditsPageHeader>

      <CreditsWalletSummary />

      <Link
        to={CREDITS_TOP_ROUTE}
        className={cn(
          'flex min-h-12 items-center gap-3 border-b border-border/50 px-4 py-3',
          creditsRowInteractive
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground/[0.06]">
          <Trophy className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 truncate text-body font-semibold">{t('top.link')}</span>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>

      <CreditsRedeemCard initialCode={typeof search.code === 'string' ? search.code : null} />

      <div
        id="credits-panel"
        role="tabpanel"
        aria-labelledby={`credits-tab-${tab}`}
        className="flex-1 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        {tab === 'history' && <CreditsHistory />}
        {tab === 'earn' && <CreditsEarnList catalog={catalog} />}
        {tab === 'spend' && <CreditsSpendList catalog={catalog} />}
      </div>
    </div>
  );
};

/** Balance hero: big number, streak / transferable pills, today's progress, totals. */
const CreditsWalletSummary: React.FC = () => {
  const { t } = useTranslation('credits');
  const format = useCreditsFormat();
  const wallet = useCreditsStore(state => state.wallet);

  if (!wallet) {
    return (
      <section aria-busy="true" className="space-y-3 border-b border-border/50 px-4 py-5">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-10 w-44 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-36 rounded-full" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-14 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  const capPercent = wallet.dailyCap
    ? Math.min(100, Math.round((wallet.earnedToday / wallet.dailyCap) * 100))
    : 0;

  return (
    <section aria-label={t('wallet.label')} className="border-b border-border/50 px-4 py-5">
      <p className="text-caption font-semibold text-muted-foreground">{t('wallet.label')}</p>
      <p className="mt-1 flex min-w-0 items-center gap-2 text-display font-extrabold tracking-tight text-foreground tabular-nums sm:text-[2.25rem] sm:leading-10">
        <Coins className="size-7 shrink-0 sm:size-8" strokeWidth={2.2} aria-hidden="true" />
        <span className="truncate">{format(wallet.balance)}</span>
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={pill}>
          <Flame className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{t('wallet.streak', { count: wallet.streak })}</span>
        </span>
        {wallet.transferable < wallet.balance && (
          <span className={pill}>
            <Lock className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {t('wallet.transferable', { value: format(wallet.transferable) })}
            </span>
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-3 text-caption">
          <span className="font-semibold text-foreground">{t('wallet.today')}</span>
          <span className="text-muted-foreground tabular-nums">
            {format(wallet.earnedToday)} / {format(wallet.dailyCap)}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={t('wallet.today')}
          aria-valuemin={0}
          aria-valuemax={wallet.dailyCap}
          aria-valuenow={wallet.earnedToday}
          className="mt-2 h-2 overflow-hidden rounded-full bg-foreground/[0.08]"
        >
          <div
            className="h-full rounded-full bg-foreground transition-[width] duration-500 ease-out"
            style={{ width: `${capPercent}%` }}
          />
        </div>
      </div>

      <CreditsStats
        className="mt-4"
        items={(
          [
            ['earned', wallet.earned],
            ['spent', wallet.spent],
            ['sent', wallet.sent],
          ] as const
        ).map(([key, value]) => ({ key, label: t(`wallet.${key}`), value: format(value) }))}
      />

      {wallet.frozen && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-2xl border border-destructive/40 px-4 py-3 text-body text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {t('errors.frozen')}
        </p>
      )}
    </section>
  );
};

const CreditsHistory: React.FC = () => {
  const { t } = useTranslation('credits');
  const catalog = useCreditsCatalog();
  const history = useCreditsStore(state => state.history);
  const filter = useCreditsStore(state => state.historyFilter);
  const loaded = useCreditsStore(state => state.historyLoaded);
  const loading = useCreditsStore(state => state.historyLoading);
  const hasMore = useCreditsStore(state => state.historyHasMore);
  const error = useCreditsStore(state => state.historyError);
  const loadHistory = useCreditsStore(state => state.loadHistory);

  useEffect(() => {
    void loadHistory(false);
  }, [loadHistory]);

  return (
    <>
      <CreditsChips
        className="pt-3 pb-1"
        options={FILTERS}
        value={filter}
        onChange={item => void loadHistory(false, item)}
        labelOf={item => t(`history.filters.${item}`)}
        label={t('history.filter')}
      />

      {error && !history.length ? (
        <CreditsErrorState
          text={creditErrorText(t, error)}
          retryLabel={t('actions.retry')}
          onRetry={() => void loadHistory(false)}
        />
      ) : !loaded && loading ? (
        <ul aria-busy="true" className="px-4 py-2">
          {Array.from({ length: 5 }, (_, index) => (
            <li key={index} className="flex items-center gap-3 py-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-2/3 rounded-full" />
                <Skeleton className="h-3 w-1/3 rounded-full" />
              </div>
              <Skeleton className="h-4 w-10 rounded-full" />
            </li>
          ))}
        </ul>
      ) : !history.length ? (
        <CreditsEmptyState
          icon={ReceiptText}
          title={t('history.emptyTitle')}
          text={t('history.emptyText')}
        />
      ) : (
        <>
          <ul className="divide-y divide-border/50">
            {history.map(row => (
              <CreditsTransactionItem key={row.id} row={row} catalog={catalog} />
            ))}
          </ul>
          {hasMore && (
            <CreditsLoadMore
              label={t('actions.loadMore')}
              loading={loading}
              onClick={() => void loadHistory(true)}
            />
          )}
        </>
      )}
    </>
  );
};
