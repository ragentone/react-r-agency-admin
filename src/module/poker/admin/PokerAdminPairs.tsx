import { cn } from '@ui/lib/utils';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { ToggleGroup, ToggleGroupItem } from '@ui/shad-cn/components/toggle-group.tsx';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { pokerAdminAction } from '../api.ts';
import type { IPokerAdminPair, IPokerAdminResult } from '../types.ts';
import { formatNumber } from '../utils.ts';

const DAYS = [7, 14, 30] as const;
type Result = IPokerAdminResult & { pairs?: IPokerAdminPair[]; scanned?: number; days?: number };

/**
 * Chip dumping: credits that went between two players in cash hands. Flagged pairs moved
 * more than the transfer limit allows – mostly one way.
 */
export const PokerAdminPairs: React.FC<{ onShowHands: (alias: string) => void }> = ({
  onShowHands,
}) => {
  const { t, i18n } = useTranslation('poker');
  const locale = i18n.resolvedLanguage || i18n.language;
  const [days, setDays] = useState<(typeof DAYS)[number]>(7);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let active = true;
    // Remote analysis for the chosen range (state is set when the answer arrives).
    void pokerAdminAction<Result>('pairs', { days }).then(response => {
      if (active) setResult(response);
    });
    return () => {
      active = false;
    };
  }, [days]);

  const pairs = result?.days === days ? (result.pairs ?? []) : null;

  return (
    <>
      <div className="flex flex-col gap-2 px-4 pt-4">
        <p className="text-caption text-muted-foreground">{t('admin.pairs.hint')}</p>
        <ToggleGroup
          type="single"
          value={String(days)}
          onValueChange={value => value && setDays(Number(value) as (typeof DAYS)[number])}
          aria-label={t('admin.pairs.range')}
          className="justify-start"
        >
          {DAYS.map(item => (
            <ToggleGroupItem
              key={item}
              value={String(item)}
              className="rounded-full px-3 data-[state=on]:bg-foreground data-[state=on]:text-background"
            >
              {t('admin.pairs.days', { count: item })}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {result?.scanned !== undefined && result.days === days && (
          <p className="text-caption text-muted-foreground">
            {t('admin.pairs.scanned', { count: result.scanned })}
          </p>
        )}
      </div>

      <ul className="mt-3 border-t border-border/50">
        {!pairs &&
          Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="border-b border-border/50 px-4 py-3">
              <Skeleton className="h-4 w-48 rounded-full" />
              <Skeleton className="mt-2 h-3 w-32 rounded-full" />
            </li>
          ))}
        {pairs?.length === 0 && (
          <li className="px-4 py-8 text-center text-caption text-muted-foreground">
            {t('admin.pairs.empty')}
          </li>
        )}
        {pairs?.map(pair => {
          const [from, to] = pair.aToB >= pair.bToA ? [pair.a, pair.b] : [pair.b, pair.a];
          return (
            <li
              key={`${pair.a.userId}-${pair.b.userId}`}
              className={cn(
                'border-b border-border/50 px-4 py-3',
                pair.flagged && 'bg-foreground/[0.04]'
              )}
            >
              <p className="flex items-center gap-2">
                {pair.flagged && <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />}
                <span className="truncate text-body font-bold">@{from.alias}</span>
                <ArrowRight className="size-4 shrink-0" aria-label={t('admin.pairs.to')} />
                <span className="truncate text-body font-bold">@{to.alias}</span>
                {pair.sameAddress && (
                  <Badge variant="outline" className="ml-auto shrink-0 rounded-full">
                    {t('admin.pairs.sameAddress')}
                  </Badge>
                )}
                {pair.flagged && (
                  <Badge
                    variant="destructive"
                    className={cn('shrink-0 rounded-full', !pair.sameAddress && 'ml-auto')}
                  >
                    {t('admin.pairs.flagged')}
                  </Badge>
                )}
              </p>
              <p className="mt-0.5 text-caption text-muted-foreground tabular-nums">
                {t('admin.pairs.line', {
                  net: formatNumber(pair.net, locale),
                  hands: pair.hands,
                  oneSided: Math.round(pair.oneSided * 100),
                })}
              </p>
              <div className="mt-2 flex gap-2">
                <Button size="xs" variant="outline" onClick={() => onShowHands(from.alias)}>
                  {t('admin.pairs.handsOf', { alias: from.alias })}
                </Button>
                <Button size="xs" variant="outline" onClick={() => onShowHands(to.alias)}>
                  {t('admin.pairs.handsOf', { alias: to.alias })}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};
