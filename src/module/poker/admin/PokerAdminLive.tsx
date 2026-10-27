import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog.tsx';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { RefreshCw, WifiOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { pokerAdminAction } from '../api.ts';
import { POKER_LIVE_REFRESH_MS } from '../const.ts';
import { formatNumber, formatTime, signed } from '../utils.ts';
import { PokerSection, PokerStat } from './PokerAdminView.tsx';
import { usePokerAdminOverview } from './use.poker.admin.ts';

type Confirm = { kind: 'table' | 'tournament'; id: string; label: string } | null;

/** Live: escrow, today's numbers, open cash tables and tournaments (refreshes itself). */
export const PokerAdminLive: React.FC = () => {
  const { t, i18n } = useTranslation('poker');
  const locale = i18n.resolvedLanguage || i18n.language;
  const { overview, error, reload: load } = usePokerAdminOverview();
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, POKER_LIVE_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [load]);

  const run = async () => {
    if (!confirm) return;
    setBusy(true);
    const result = await pokerAdminAction(
      confirm.kind === 'table' ? 'closeTable' : 'cancelTournament',
      confirm.kind === 'table' ? { tableId: confirm.id } : { id: confirm.id }
    );
    setBusy(false);
    setConfirm(null);
    if (!result.success) toast.error(t(`admin.errors.${result.error ?? 'unknown'}`));
    else toast.success(t(confirm.kind === 'table' ? 'admin.live.closed' : 'admin.live.cancelled'));
    void load();
  };

  if (error && !overview) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
        <p className="text-body font-bold">{t(`admin.errors.${error}`)}</p>
        <Button variant="outline" onClick={() => void load()}>
          <RefreshCw />
          {t('admin.retry')}
        </Button>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="space-y-3 p-4" aria-busy="true">
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      {!!overview.recovery?.problems.length && (
        <div role="alert" className="mx-4 mt-4 rounded-2xl border border-destructive/40 px-4 py-3">
          <p className="text-body font-bold text-destructive">{t('admin.live.recoveryTitle')}</p>
          <p className="mt-0.5 text-caption text-muted-foreground">
            {t('admin.live.recoveryText')}
          </p>
          <ul className="mt-2 space-y-0.5 font-mono text-micro break-all">
            {overview.recovery.problems.slice(0, 10).map(problem => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </div>
      )}
      <dl className="grid grid-cols-3 gap-2 px-4 pt-4">
        <PokerStat label={t('admin.live.escrow')} value={formatNumber(overview.escrow, locale)} />
        <PokerStat
          label={t('admin.live.hands')}
          value={formatNumber(overview.today.hands, locale)}
        />
        <PokerStat label={t('admin.live.rake')} value={formatNumber(overview.today.rake, locale)} />
      </dl>

      {overview.today.reasons.length > 0 && (
        <>
          <PokerSection title={t('admin.live.today')} />
          <ul className="border-y border-border/50">
            {overview.today.reasons.map(row => (
              <li
                key={row.reason}
                className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-2.5 last:border-b-0"
              >
                <span className="min-w-0 truncate text-body">
                  {t(`admin.reasons.${row.reason.replace(/\./g, '_')}`, {
                    defaultValue: row.reason,
                  })}
                  <span className="ml-1.5 text-caption text-muted-foreground">×{row.count}</span>
                </span>
                <span className="shrink-0 text-body font-semibold tabular-nums">
                  {signed(row.amount, locale)}
                </span>
              </li>
            ))}
          </ul>
          <p className="px-4 pt-2 text-caption text-muted-foreground">
            {t('admin.live.todayHint')}
          </p>
        </>
      )}

      <PokerSection title={t('admin.live.tables', { count: overview.tables.length })} />
      {overview.tables.length === 0 ? (
        <p className="px-4 text-caption text-muted-foreground">{t('admin.live.noTables')}</p>
      ) : (
        <ul className="border-t border-border/50">
          {overview.tables.map(table => (
            <li key={table.tableId} className="border-b border-border/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-body font-bold tabular-nums">
                  {formatNumber(table.sb, locale)}/{formatNumber(table.bb, locale)}
                </span>
                <Badge variant="secondary" className="rounded-full">
                  {table.bots
                    ? t('admin.live.bots', { level: t(`admin.levels.${table.bots}`) })
                    : table.seats === 2
                      ? 'Heads-Up'
                      : `${table.seats}-Max`}
                </Badge>
                {table.running && (
                  <Badge className="rounded-full">
                    {t('admin.live.hand', { no: table.handNo })}
                  </Badge>
                )}
                <span className="ml-auto text-caption text-muted-foreground tabular-nums">
                  {t('admin.live.chips', { value: formatNumber(table.chips, locale) })}
                </span>
              </div>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {table.players.map(player => (
                  <li
                    key={player.userId}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-caption"
                  >
                    {!player.connected && (
                      <WifiOff className="size-3" aria-label={t('admin.live.offline')} />
                    )}
                    <span className="font-semibold">@{player.alias}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatNumber(player.stack, locale)}
                    </span>
                    {player.sittingOut && (
                      <span className="text-muted-foreground">· {t('admin.live.sittingOut')}</span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  variant="destructive-outline"
                  onClick={() =>
                    setConfirm({
                      kind: 'table',
                      id: table.tableId,
                      label: `${table.sb}/${table.bb}`,
                    })
                  }
                >
                  {t('admin.live.close')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <PokerSection title={t('admin.live.tournaments')} />
      {overview.tournaments.length === 0 ? (
        <p className="px-4 text-caption text-muted-foreground">{t('admin.live.noTournaments')}</p>
      ) : (
        <ul className="border-t border-border/50">
          {overview.tournaments.map(item => (
            <li
              key={item.id}
              className="flex items-center gap-3 border-b border-border/50 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2">
                  <span className="truncate text-body font-bold">
                    {t(`admin.names.${item.configId}`, { defaultValue: item.configId })}
                  </span>
                  <Badge
                    variant={item.status === 'running' ? 'default' : 'secondary'}
                    className="rounded-full"
                  >
                    {t(`admin.status.${item.status}`)}
                  </Badge>
                </p>
                <p className="truncate text-caption text-muted-foreground tabular-nums">
                  {item.status === 'running'
                    ? t('admin.live.running', {
                        left: item.left,
                        total: item.entrants,
                        level: item.level,
                        tables: item.tables,
                      })
                    : t('admin.live.registering', { count: item.entrants })}
                  {' · '}
                  {t('admin.live.pool', { value: formatNumber(item.prizePool, locale) })}
                  {item.startsAt && item.status === 'registering'
                    ? ` · ${formatTime(item.startsAt, locale)}`
                    : ''}
                </p>
              </div>
              <Button
                size="sm"
                variant="destructive-outline"
                onClick={() =>
                  setConfirm({
                    kind: 'tournament',
                    id: item.id,
                    label: t(`admin.names.${item.configId}`, { defaultValue: item.configId }),
                  })
                }
              >
                {t('admin.live.cancel')}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog open={!!confirm} onOpenChange={open => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.kind === 'table'
                ? t('admin.live.closeTitle', { label: confirm.label })
                : t('admin.live.cancelTitle', { label: confirm?.label ?? '' })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(confirm?.kind === 'table' ? 'admin.live.closeText' : 'admin.live.cancelText')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.back')}</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={() => void run()}>
              {t(confirm?.kind === 'table' ? 'admin.live.close' : 'admin.live.cancel')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
