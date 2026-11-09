import { AccountAvatarUpload } from '@core/account/components/AccountAvatarUpload';
import { AccountTeaserUpload } from '@core/account/components/AccountTeaserUpload';
import type { IUserAccount } from '@core/account/types';
import { useProfileRoute } from '@core/profile/hooks/use.profile.route.ts';
import { useRouterState } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { ArrowUpRight, BadgeCheck } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ACCOUNT_FROM_PROFILE_KEY } from '../const.ts';

export interface AccountProfileCardProps {
  account: IUserAccount | null;
  className?: string;
  onAvatarUpdated?: (url: string) => void;
}

/** X-style profile header: banner, overlapping avatar, name, handle, meta line, chips. */
export const AccountProfileCard: React.FC<AccountProfileCardProps> = ({
  account,
  className,
  onAvatarUpdated,
}) => {
  const { t } = useTranslation('account');
  const { openProfile } = useProfileRoute();
  // Opened via "Edit profile" on the own profile → no way back into it from here.
  const fromProfile = useRouterState({
    select: state =>
      Boolean((state.location.search as Record<string, unknown>)[ACCOUNT_FROM_PROFILE_KEY]),
  });

  if (!account) return null;

  const fullName = [account.details?.firstname, account.details?.lastname]
    .filter(Boolean)
    .join(' ');

  return (
    <section data-slot="account-profile" className={cn(className)}>
      {/* Banner (teaser) – upload, crop, replace, remove */}
      <AccountTeaserUpload />

      <div className="px-4 pb-4">
        {/* Avatar overlaps the banner, "view profile" on the right (like X's "Edit profile"). */}
        <div className="-mt-12 mb-3 flex items-end justify-between gap-3 sm:-mt-16">
          <AccountAvatarUpload
            account={account}
            onUploadSuccess={onAvatarUpdated}
            avatarClassName="size-24 border-4 border-background sm:size-32"
          />
          {/* Navigates to the own profile page → back returns here. */}
          {!fromProfile && (
            <Button
              variant="outline"
              size="md"
              onClick={() => openProfile(account.id)}
              className="mb-1 shrink-0"
            >
              {t('card.viewProfile', { defaultValue: 'Profil ansehen' })}
              <ArrowUpRight className="size-4" />
            </Button>
          )}
        </div>

        <h2 className="flex min-w-0 items-center gap-1.5 text-title font-bold text-foreground">
          <span className="truncate">{fullName || account.alias}</span>
          {account.superUser && (
            <BadgeCheck
              className="size-5 shrink-0 fill-foreground text-background"
              aria-label={t('card.superUser')}
            />
          )}
        </h2>
        <p className="truncate text-body leading-5 text-muted-foreground">@{account.alias}</p>
      </div>
    </section>
  );
};

export const AccountProfileOverview = AccountProfileCard;
