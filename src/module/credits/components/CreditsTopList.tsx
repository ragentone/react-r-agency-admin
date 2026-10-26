import { useAuthStore } from '@core/auth/auth.store.tsx';
import { useMeshState } from '@core/mesh';
import { openProfileDrawer } from '@core/profile/hooks/use.profile.drawer.ts';
import { cn } from '@ui/lib/utils';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Crown, Trophy } from 'lucide-react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { ICreditTopUser } from '../types.ts';
import { CREDITS_TOP_REFRESH_MS, useCreditsTop } from '../use.credits.top.ts';
import { creditsFocus } from './credits.classes.ts';
import { CreditsAmount } from './CreditsAmount.tsx';
import { CreditsAvatar } from './CreditsAvatar.tsx';
import { CreditsEmptyState, CreditsErrorState } from './CreditsUi.tsx';

/** Public: the three users with the most credits (only public profiles). */
export const CreditsTopList: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation('credits');
  const signedIn = useAuthStore(state => Boolean(state.authorized && state.userMeta?.id));
  const { users, failed, load } = useCreditsTop();
  const { connected } = useMeshState();

  useEffect(() => {
    if (!connected) return;
    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, CREDITS_TOP_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [connected, load]);

  const open = (user: ICreditTopUser) => {
    if (signedIn) openProfileDrawer(user.id);
  };

  if (failed && !users) {
    return (
      <CreditsErrorState
        className={className}
        text={t('errors.unknown')}
        retryLabel={t('actions.retry')}
        onRetry={() => void load()}
      />
    );
  }
  if (!users) {
    return (
      <div aria-busy="true" className={cn('space-y-3 p-4', className)}>
        <Skeleton className="h-36 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      </div>
    );
  }
  if (!users.length) {
    return <CreditsEmptyState className={className} icon={Trophy} text={t('top.empty')} />;
  }

  const [first, ...rest] = users;
  return (
    <div className={cn('p-4', className)}>
      <ol aria-label={t('top.title')} className="space-y-3">
        {first && (
          <li>
            <button
              type="button"
              onClick={() => open(first)}
              disabled={!signedIn}
              aria-label={t('top.rankLabel', { rank: 1, name: first.alias })}
              className={cn(
                'relative flex w-full flex-col items-center rounded-3xl bg-foreground px-4 pt-7 pb-6 text-center text-background transition-[opacity,transform] enabled:hover:opacity-90 enabled:active:scale-[0.99] sm:pt-8 sm:pb-7',
                creditsFocus
              )}
            >
              <Crown className="absolute top-3 left-4 size-5" aria-hidden="true" />
              <span className="absolute top-3 right-4 text-caption font-bold tabular-nums">#1</span>
              <CreditsAvatar
                user={first}
                className="size-20 ring-4 ring-background/20 sm:size-24"
              />
              <span className="mt-3 max-w-full truncate text-title font-bold">@{first.alias}</span>
              <CreditsAmount
                value={first.balance}
                className="mt-1 max-w-full text-display font-extrabold"
              />
            </button>
          </li>
        )}
        {rest.length > 0 && (
          <li className="grid grid-cols-2 gap-3">
            {rest.map(user => (
              <button
                key={user.id}
                type="button"
                onClick={() => open(user)}
                disabled={!signedIn}
                aria-label={t('top.rankLabel', { rank: user.rank, name: user.alias })}
                className={cn(
                  'relative flex min-w-0 flex-col items-center rounded-3xl border border-border px-3 pt-6 pb-4 text-center transition-colors enabled:hover:bg-foreground/[0.03] enabled:active:bg-foreground/[0.06]',
                  creditsFocus
                )}
              >
                <span className="absolute top-3 right-3.5 text-caption font-bold text-muted-foreground tabular-nums">
                  #{user.rank}
                </span>
                <CreditsAvatar user={user} className="size-14" />
                <span className="mt-2 max-w-full truncate text-body font-bold">@{user.alias}</span>
                <CreditsAmount
                  value={user.balance}
                  className="mt-0.5 max-w-full text-title font-bold"
                />
              </button>
            ))}
          </li>
        )}
      </ol>
      <p className="pt-4 text-center text-caption text-muted-foreground">{t('top.hint')}</p>
    </div>
  );
};
