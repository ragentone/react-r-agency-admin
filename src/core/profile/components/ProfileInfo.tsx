import { type DateTimeFormat, formatDateTime, type Locales } from '@core/i18n';
import { cn } from '@ui/lib/utils';
import { Cake, Clock, Eye, Mail, ShieldCheck, User, Users } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IUserProfile, IUserProfileParams } from '../types';

export interface IProfileInfoProps {
  profile: IUserProfile;
  params: IUserProfileParams | null;
  className?: string;
}

interface IInfoRow {
  key: string;
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}

/** Full years between a birthday and today; null for invalid dates. */
const getAge = (birthday: string): number | null => {
  const date = new Date(birthday);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const beforeBirthday =
    now.getMonth() < date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() < date.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 150 ? age : null;
};

/**
 * "Information" section: every detail the user shares, as a label/value list.
 * Rows without data are left out (e.g. e-mail or full name when not shared).
 */
export const ProfileInfo: React.FC<IProfileInfoProps> = ({ profile, params, className }) => {
  const { t, i18n } = useTranslation('profile');
  const format = (date: string, as: DateTimeFormat) =>
    formatDateTime(date, as, i18n.language as Locales);

  const gender =
    profile.gender && profile.gender !== 'unknown'
      ? t(`gender.${profile.gender}`, { defaultValue: profile.gender })
      : null;
  const age = profile.birthday ? getAge(profile.birthday) : null;

  const rows: (IInfoRow | false | null | undefined | '')[] = [
    profile.fullName && {
      key: 'fullName',
      icon: User,
      label: t('info.fullName'),
      value: profile.fullName,
    },
    gender && { key: 'gender', icon: Users, label: t('info.gender'), value: gender },
    profile.birthday && {
      key: 'birthday',
      icon: Cake,
      label: t('info.birthday'),
      value: (
        <>
          {format(profile.birthday, 'dateLong')}
          {age !== null && (
            <span className="text-muted-foreground"> · {t('info.age', { count: age })}</span>
          )}
        </>
      ),
    },
    profile.email && {
      key: 'email',
      icon: Mail,
      label: t('info.email'),
      value: (
        <a href={`mailto:${profile.email}`} className="break-all hover:underline">
          {profile.email}
        </a>
      ),
    },
    params && {
      key: 'visibility',
      icon: params.isPublic ? Eye : ShieldCheck,
      label: t('info.visibility'),
      value: params.isPublic ? t('badge.public') : t('badge.private'),
    },
    {
      key: 'activity',
      icon: Clock,
      label: t('info.lastActive'),
      value: profile.online ? (
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-foreground" aria-hidden="true" />
          {t('meta.online')}
        </span>
      ) : profile.lastLogin ? (
        format(profile.lastLogin, 'dateTimeShort')
      ) : (
        t('info.never')
      ),
    },
  ];

  const visible = rows.filter((row): row is IInfoRow => Boolean(row));

  return (
    <section
      data-slot="profile-info"
      aria-labelledby="profile-info-title"
      className={cn('border-b border-border/50', className)}
    >
      <h2
        id="profile-info-title"
        className="px-4 pt-4 pb-1 text-title leading-6 font-extrabold tracking-tight text-foreground"
      >
        {t('sections.info')}
      </h2>
      <dl className="divide-y divide-border/50">
        {visible.map(({ key, icon: Icon, label, value }) => (
          <div key={key} className="flex items-start gap-3 px-4 py-3">
            <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:justify-between sm:gap-4">
              <dt className="text-caption leading-5 text-muted-foreground sm:shrink-0">{label}</dt>
              <dd className="text-body leading-5 font-medium wrap-break-word text-foreground sm:text-right">
                {value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
};
