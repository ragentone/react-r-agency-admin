import { cn } from '@ui/lib/utils';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { ToggleGroup, ToggleGroupItem } from '@ui/shad-cn/components/toggle-group.tsx';
import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { pokerAdminAction } from '../api.ts';
import type { IPokerAdminHand, IPokerAdminResult } from '../types.ts';
import { cardLabel, formatNumber, formatTime, signed } from '../utils.ts';
import { usePokerAdminHands } from './use.poker.admin.ts';

type Kind = 'all' | 'cash' | 'tournament';

const STREETS = ['preflop', 'flop', 'turn', 'river', 'showdown'];

/** Hand history: search by user, cash / tournament, details with cards and every action. */
export const PokerAdminHands: React.FC<{ initialUser?: string }> = ({ initialUser = '' }) => {
  const { t, i18n } = useTranslation('poker');
  const locale = i18n.resolvedLanguage || i18n.language;
  const [query, setQuery] = useState(initialUser);
  const [user, setUser] = useState(initialUser);
  const [kind, setKind] = useState<Kind>('all');
  const { rows, hasMore, userFound, loading, load } = usePokerAdminHands(user, kind);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    // Remote list for the current filter (state is set when the answer arrives).
    void load(0);
  }, [load]);

  return (
    <>
      <form
        className="flex flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-center"
        onSubmit={event => {
          event.preventDefault();
          setUser(query.trim());
        }}
      >
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            size="lg"
            type="search"
            value={query}
            placeholder={t('admin.hands.search')}
            aria-label={t('admin.hands.search')}
            onChange={event => setQuery(event.target.value)}
            className="rounded-full pl-9"
          />
        </div>
        <ToggleGroup
          type="single"
          value={kind}
          onValueChange={value => value && setKind(value as Kind)}
          aria-label={t('admin.hands.kind')}
          className="justify-start"
        >
          {(['all', 'cash', 'tournament'] as const).map(item => (
            <ToggleGroupItem
              key={item}
              value={item}
              className="rounded-full px-3 data-[state=on]:bg-foreground data-[state=on]:text-background"
            >
              {t(`admin.hands.kinds.${item}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </form>

      {!userFound && (
        <p className="px-4 pt-4 text-body font-semibold">{t('admin.hands.noUser', { user })}</p>
      )}

      <ul className="mt-4 border-t border-border/50" aria-busy={loading}>
        {rows === null &&
          Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="border-b border-border/50 px-4 py-3">
              <Skeleton className="h-4 w-40 rounded-full" />
              <Skeleton className="mt-2 h-3 w-56 rounded-full" />
            </li>
          ))}
        {rows?.length === 0 && userFound && (
          <li className="px-4 py-8 text-center text-caption text-muted-foreground">
            {t('admin.hands.empty')}
          </li>
        )}
        {rows?.map(row => (
          <li key={row.handId}>
            <button
              type="button"
              onClick={() => setOpenId(row.handId)}
              className="w-full border-b border-border/50 px-4 py-3 text-left outline-none transition-colors hover:bg-foreground/[0.03] active:bg-foreground/[0.06] focus-visible:bg-foreground/[0.05]"
            >
              <span className="flex items-center gap-2">
                <span className="text-body font-bold tabular-nums">
                  {t('admin.hands.pot', { value: formatNumber(row.pot, locale) })}
                </span>
                <Badge variant="secondary" className="rounded-full">
                  {t(`admin.names.${row.stakeId}`, { defaultValue: row.stakeId })}
                </Badge>
                {row.kind === 'tournament' && (
                  <Badge variant="outline" className="rounded-full">
                    {t('admin.hands.kinds.tournament')}
                  </Badge>
                )}
                <span className="ml-auto text-caption text-muted-foreground tabular-nums">
                  {formatTime(row.createdAt, locale)}
                </span>
              </span>
              <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-caption tabular-nums">
                {row.players.map(player => {
                  const net = player.end - player.start;
                  return (
                    <span
                      key={player.seat}
                      className={cn(net > 0 ? 'font-bold' : 'text-muted-foreground')}
                    >
                      @{player.alias} {signed(net, locale)}
                    </span>
                  );
                })}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {hasMore && (
        <div className="px-4 pt-3">
          <Button
            variant="outline"
            fullWidth
            isLoading={loading}
            onClick={() => void load(rows?.length ?? 0)}
          >
            {t('admin.more')}
          </Button>
        </div>
      )}

      <PokerHandDrawer key={openId ?? 'none'} handId={openId} onClose={() => setOpenId(null)} />
    </>
  );
};

const PokerHandDrawer: React.FC<{ handId: string | null; onClose: () => void }> = ({
  handId,
  onClose,
}) => {
  const { t, i18n } = useTranslation('poker');
  const locale = i18n.resolvedLanguage || i18n.language;
  const [hand, setHand] = useState<IPokerAdminHand | null>(null);

  useEffect(() => {
    if (!handId) return;
    // Remote details (state is set when the answer arrives).
    void pokerAdminAction<IPokerAdminResult & { hand?: IPokerAdminHand }>('hand', { handId }).then(
      result => {
        if (result.success && result.hand) setHand(result.hand);
      }
    );
  }, [handId]);

  return (
    <Drawer open={!!handId} onOpenChange={open => !open && onClose()} showSwipeHandle>
      <DrawerContent className="mx-auto w-full max-w-[560px]">
        <div className="max-h-[85dvh] overflow-y-auto px-5 pt-1 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <DrawerTitle className="text-title font-bold">
            {hand
              ? t('admin.hands.pot', { value: formatNumber(hand.pot, locale) })
              : t('admin.hands.title')}
          </DrawerTitle>
          <DrawerDescription className="text-caption text-muted-foreground tabular-nums">
            {hand
              ? `${formatTime(hand.createdAt, locale)} · ${t('admin.hands.rake', { value: hand.rake })} · ${hand.handId}`
              : '…'}
          </DrawerDescription>

          {!hand ? (
            <Skeleton className="mt-4 h-40 rounded-2xl" />
          ) : (
            <>
              <p className="mt-4 text-micro font-semibold text-muted-foreground uppercase">
                {t('admin.hands.board')}
              </p>
              <p className="mt-1 font-mono text-title font-bold tracking-wide">
                {hand.board.length ? hand.board.map(cardLabel).join(' ') : '—'}
              </p>

              <ul className="mt-4 divide-y divide-border/50 border-y border-border/50">
                {hand.players.map(player => {
                  const net = player.end - player.start;
                  return (
                    <li key={player.seat} className="flex items-center gap-3 py-2.5">
                      <span className="min-w-0 flex-1 truncate text-body font-semibold">
                        @{player.alias}
                        {player.folded && (
                          <span className="ml-1.5 text-caption font-normal text-muted-foreground">
                            {t('admin.hands.folded')}
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-body">
                        {player.cards.map(cardLabel).join(' ')}
                      </span>
                      <span className={cn('w-20 text-right tabular-nums', net > 0 && 'font-bold')}>
                        {signed(net, locale)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {STREETS.map(street => {
                const actions = hand.actions.filter(action => action.street === street);
                if (!actions.length) return null;
                return (
                  <div key={street} className="mt-4">
                    <p className="text-micro font-semibold text-muted-foreground uppercase">
                      {t(`admin.hands.streets.${street}`)}
                    </p>
                    <ol className="mt-1 space-y-0.5 text-caption">
                      {actions.map((action, index) => (
                        <li key={index} className="flex gap-2 tabular-nums">
                          <span className="font-semibold">@{action.alias}</span>
                          <span>
                            {t(`admin.hands.actions.${action.type}`, { defaultValue: action.type })}
                          </span>
                          {action.amount > 0 && <span>{formatNumber(action.amount, locale)}</span>}
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
