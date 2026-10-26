import { ACCOUNT_FROM_PROFILE_KEY } from '@core/account/const.ts';
import { CoreVariables } from '@core/core.variables.ts';
import { FriendButton } from '@core/friends/components/FriendButton';
import { type DateTimeFormat, formatDateTime, type Locales } from '@core/i18n';
import { Link, useRouterState } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar.tsx';
import { CalendarDays, Clock, Lock, User } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../auth/components/use.auth.ts';
import type { IUserProfile, IUserProfileParams, IUserProfileRelation } from '../types';
import { ProfileDescription } from './ProfileDescription.tsx';
import { ProfileRelationBadge } from './ProfileRelationBadge.tsx';

export interface IProfileCardProps {
  profile: IUserProfile;
  params: IUserProfileParams | null;
  relation?: IUserProfileRelation | null;
  className?: string;
}

const MetaItem: React.FC<{ icon: React.ElementType; children: React.ReactNode }> = ({
  icon: Icon,
  children,
}) => (
  <li className="inline-flex min-w-0 items-center gap-1.5">
    <Icon className="size-4 shrink-0" aria-hidden="true" />
    <span className="truncate">{children}</span>
  </li>
);

/** X-style profile head: banner, overlapping avatar (online dot), name, @alias, bio, meta row. */
export const ProfileCard: React.FC<IProfileCardProps> = ({
  profile,
  params,
  relation,
  className,
}) => {
  const { t, i18n } = useTranslation('profile');
  const formatDate = (date: string, format: DateTimeFormat) =>
    formatDateTime(date, format, i18n.language as Locales);
  const own = Boolean(params?.isOwen);
  const { authorized } = useAuth();
  const signedIn = Boolean(authorized);
  // Profile opened as dialog over the account page → "edit" would only lead back there, hide it.
  const overAccount = useRouterState({
    select: state => state.location.pathname === CoreVariables.routePathAccount,
  });
  const name = profile.fullName || profile.alias;

  return (
    <section data-slot="profile-card" className={cn('border-b border-border/50', className)}>
      {/* Banner */}
      <div className="relative h-32 overflow-hidden bg-muted sm:h-48" aria-hidden="true">
        {profile.teaserUrl && (
          <img
            src={profile.teaserUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        )}
      </div>

      <div className="px-4 pb-4">
        {/* Avatar overlaps the banner; action on the right */}
        <div className="-mt-12 mb-3 flex items-end justify-between gap-3 sm:-mt-16">
          <div className="relative">
            <Avatar className="size-24 border-4 border-background bg-background sm:size-32">
              {profile.avatarUrl && (
                <AvatarImage src={profile.avatarUrl} alt={name} className="object-cover" />
              )}
              <AvatarFallback className="bg-muted text-muted-foreground">
                <User className="size-10 sm:size-12" />
              </AvatarFallback>
            </Avatar>
            {profile.online && (
              <span
                className="absolute right-1.5 bottom-1.5 size-4 rounded-full border-[3px] border-background bg-foreground sm:right-2.5 sm:bottom-2.5 sm:size-5"
                aria-label={t('meta.online')}
                role="img"
              />
            )}
          </div>

          {!own && signedIn && (
            <FriendButton
              userId={profile.userId}
              name={profile.alias}
              avatarUrl={profile.avatarUrl}
              initialRelation={relation}
              className="mb-1"
            />
          )}
          {own && !overAccount && (
            <Link
              to={CoreVariables.routePathAccount as '/'}
              // Account knows it was opened from the profile → hides its "view profile" button.
              search={{ [ACCOUNT_FROM_PROFILE_KEY]: 1 } as never}
              className="mb-1 inline-flex h-9 items-center rounded-full border border-border/50 px-4 text-sm font-bold text-foreground transition-colors hover:bg-foreground/10"
            >
              {t('actions.editProfile')}
            </Link>
          )}
        </div>

        <h2 className="truncate text-xl leading-6 font-extrabold tracking-tight text-foreground">
          {name}
        </h2>
        <p className="truncate text-body leading-5 text-muted-foreground">@{profile.alias}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {own && (
            <span className="inline-flex h-6 items-center rounded-full bg-foreground px-2.5 text-xs font-medium text-background">
              {t('badge.own')}
            </span>
          )}
          {params && !params.isPublic && (
            <span className="inline-flex h-6 items-center gap-1 rounded-full border border-border/50 px-2.5 text-xs font-medium text-muted-foreground">
              <Lock className="size-3" aria-hidden="true" />
              {t('badge.private')}
            </span>
          )}
          {profile.online && (
            <span className="inline-flex h-6 items-center gap-1 rounded-full border border-border/50 px-2.5 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-foreground" aria-hidden="true" />
              {t('meta.online')}
            </span>
          )}
          {/* Signed in: the FriendButton shows the relation – badge only as read-only fallback. */}
          {!own && !signedIn && (
            <ProfileRelationBadge relation={relation} profileUserId={profile.userId} />
          )}
        </div>

        <ProfileDescription html={profile.description} className="mt-3" />

        {/* Meta row, like X's "Joined …" line */}
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-body leading-5 text-muted-foreground">
          {profile.createdAt && (
            <MetaItem icon={CalendarDays}>
              {t('meta.joined', { date: formatDate(profile.createdAt, 'dateMonthYear') })}
            </MetaItem>
          )}
          {!profile.online && profile.lastLogin && (
            <MetaItem icon={Clock}>
              {t('meta.lastSeen', { date: formatDate(profile.lastLogin, 'dateTimeShort') })}
            </MetaItem>
          )}
        </ul>
      </div>
    </section>
  );
};
