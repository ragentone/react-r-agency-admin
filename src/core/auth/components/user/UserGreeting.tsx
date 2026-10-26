import { CoreVariables } from '@core/core.variables.ts';
import { type ClientPlatform, useClientPlatform } from '@core/native';
import { getProfilePath } from '@core/profile/const.ts';
import { Link } from '@tanstack/react-router';
import { cn } from '@ui/lib';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Card } from '@ui/shad-cn/components/card.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Globe, Laptop, type LucideIcon, Smartphone } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../use.auth.ts';
import {
  formatRelativeTime,
  getGreetingSlot,
  getUserDisplayName,
  GREETING_SLOT_ICONS,
  pickGreetingVariant,
  toGreetingDate,
  useGreetingNow,
} from './greeting.utils.ts';
import { GreetingDate } from './GreetingDate.tsx';

export interface IUserGreetingProps {
  /** `card` = framed card, `inline` = without frame, `compact` = one line (lists / headers). */
  variant?: 'card' | 'inline' | 'compact';
  className?: string;
  showAvatar?: boolean;
  /** Date tile + sky arc with sun / moon. */
  showDate?: boolean;
  /** "Last active …" from `userMeta.lastLogin`. */
  showLastLogin?: boolean;
  /** Current platform (Android / iOS / macOS app, fallback: web). */
  showPlatform?: boolean;
  /** Overrides the name (default: alias → e-mail prefix). */
  name?: string;
  /** Extra content below the greeting (buttons, stats …). */
  children?: ReactNode;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const PLATFORM_ICONS: Record<ClientPlatform, LucideIcon> = {
  android: Smartphone,
  ios: Smartphone,
  macos: Laptop,
  web: Globe,
};

/** Profile avatar (X style): plain circle, dims on hover, links to the profile. */
const GreetingAvatar = ({
  to,
  name,
  src,
  compact,
  label,
}: {
  to: string;
  name: string;
  src?: string | null;
  compact?: boolean;
  label: string;
}) => (
  <Link
    to={to as '/'}
    aria-label={label}
    className={
      'shrink-0 rounded-full outline-none transition-opacity hover:opacity-85 focus-visible:ring-[3px] focus-visible:ring-ring/40'
    }
  >
    <Avatar className={cn('border border-border/60', compact ? 'size-8' : 'size-14 sm:size-16')}>
      {src && <AvatarImage src={src} alt={''} className={'object-cover'} />}
      <AvatarFallback
        className={cn(
          'bg-foreground font-bold uppercase text-background',
          compact ? 'text-caption' : 'text-title sm:text-display'
        )}
      >
        {name.slice(0, 1)}
      </AvatarFallback>
    </Avatar>
  </Link>
);

/**
 * Personal greeting of the logged-in user – daytime aware ("Guten Morgen, Anna"),
 * laid out like an X profile header: avatar · bold name · muted meta line with "·" separators.
 * Guests get a welcome + login call to action.
 */
const UserGreeting = ({
  variant = 'inline',
  className,
  showAvatar = true,
  showDate = true,
  showLastLogin = true,
  showPlatform = true,
  name: nameOverride,
  children,
}: IUserGreetingProps) => {
  const { t, i18n } = useTranslation('auth');
  const { userMeta, authorized, loaded } = useAuth();
  const reduceMotion = useReducedMotion();
  const now = useGreetingNow();
  const platform = useClientPlatform();
  const platformName = t(`greeting.platform.${platform}`);

  const locale = i18n.resolvedLanguage ?? i18n.language ?? 'en';
  const slot = getGreetingSlot(now.getHours());
  const SlotIcon = GREETING_SLOT_ICONS[slot];
  const isUser = Boolean(authorized && userMeta?.id);
  const name = nameOverride ?? getUserDisplayName(userMeta?.alias, userMeta?.email);
  const profilePath = userMeta?.id ? getProfilePath(userMeta.id) : null;
  const isCard = variant === 'card';
  const isCompact = variant === 'compact';

  const lastLogin = toGreetingDate(userMeta?.lastLogin);
  const lastLoginText =
    showLastLogin && isUser && lastLogin
      ? t('greeting.lastLogin', { time: formatRelativeTime(lastLogin, now, locale) })
      : null;

  const greeting = isUser
    ? t(`greeting.slots.${slot}.${pickGreetingVariant(now, slot)}`)
    : t('greeting.guest.title');
  const subline = isUser ? t(`greeting.subline.${slot}`) : t('greeting.guest.text');

  const frame = (content: ReactNode, extraClass?: string) =>
    isCard ? (
      <Card
        role={'region'}
        aria-label={t('greeting.label')}
        className={cn('rounded-2xl border-border/60 p-4 shadow-none sm:p-5', extraClass, className)}
      >
        {content}
      </Card>
    ) : (
      <section aria-label={t('greeting.label')} className={cn(extraClass, className)}>
        {content}
      </section>
    );

  // ---------------------------------------------------------------- loading
  if (!loaded) {
    return (
      <div
        aria-hidden
        className={cn(
          'flex items-center gap-3',
          isCard && 'rounded-2xl border border-border/60 p-4 sm:p-5',
          className
        )}
      >
        {showAvatar && (
          <Skeleton
            className={cn('shrink-0 rounded-full', isCompact ? 'size-8' : 'size-14 sm:size-16')}
          />
        )}
        <div className={'flex flex-1 flex-col gap-2'}>
          <Skeleton className={'h-3.5 w-24 rounded-full'} />
          {!isCompact && <Skeleton className={'h-5 w-40 rounded-full'} />}
        </div>
      </div>
    );
  }

  const avatar =
    showAvatar && isUser && profilePath ? (
      <GreetingAvatar
        to={profilePath}
        name={name}
        src={userMeta?.avatarUrl}
        compact={isCompact}
        label={t('greeting.profile')}
      />
    ) : null;

  // ---------------------------------------------------------------- compact
  if (isCompact) {
    return (
      <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
        {avatar}
        <p className={'min-w-0 truncate text-body'}>
          <span className={'text-muted-foreground'}>{greeting}</span>
          {isUser && (
            <>
              {', '}
              <span className={'font-bold text-foreground'}>{name}</span>
            </>
          )}
        </p>
      </div>
    );
  }

  const enter = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.4, ease: EASE },
        };

  // Meta line like X ("@handle · 2h"): platform · last active.
  const meta: ReactNode[] = [];
  if (showPlatform) {
    const PlatformIcon = PLATFORM_ICONS[platform];
    meta.push(
      <span
        key={'platform'}
        className={'inline-flex items-center gap-1'}
        aria-label={t('greeting.platform.label', { platform: platformName })}
      >
        <PlatformIcon aria-hidden className={'size-3.5'} strokeWidth={2} />
        <span aria-hidden>{platformName}</span>
      </span>
    );
  }
  if (lastLoginText) meta.push(<span key={'last-login'}>{lastLoginText}</span>);

  const title = isUser ? name : (CoreVariables.headerTitle ?? t('greeting.guest.fallbackTitle'));

  return frame(
    <>
      {/* Header row: avatar · greeting + name */}
      <motion.div {...enter(0)} className={'flex items-center gap-3 sm:gap-4'}>
        {avatar}
        <div className={'min-w-0 flex-1'}>
          <p className={'flex items-center gap-1.5 text-body text-muted-foreground'}>
            <SlotIcon aria-hidden className={'size-4 shrink-0'} strokeWidth={2} />
            <span className={'truncate'}>
              {greeting}
              {isUser && ','}
            </span>
          </p>
          <h2
            className={
              'truncate text-xl leading-7 font-extrabold tracking-[-0.02em] text-foreground sm:text-2xl sm:leading-8'
            }
          >
            {isUser && profilePath ? (
              <Link
                to={profilePath as '/'}
                className={
                  'rounded-sm outline-none decoration-2 underline-offset-2 hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40'
                }
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </h2>
        </div>
      </motion.div>

      {/* Subline + meta */}
      <motion.div {...enter(0.08)} className={'mt-3 flex flex-col gap-1.5'}>
        <p className={'text-body text-pretty text-foreground'}>{subline}</p>
        {meta.length > 0 && (
          <p
            className={
              'flex flex-wrap items-center gap-x-1.5 gap-y-1 text-caption text-muted-foreground'
            }
          >
            {meta.map((item, i) => (
              <Fragment key={i}>
                {i > 0 && <span aria-hidden>·</span>}
                {item}
              </Fragment>
            ))}
          </p>
        )}
      </motion.div>

      {showDate && (
        <GreetingDate now={now} locale={locale} slot={slot} delay={0.12} className={'mt-4'} />
      )}

      {!isUser && (
        <motion.div {...enter(0.16)} className={'mt-5'}>
          <Button asChild size={'lg'} className={'w-full sm:w-auto'}>
            <Link to={CoreVariables.routePathAuth as '/'}>
              {t('greeting.guest.cta')}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </motion.div>
      )}

      {children && (
        <motion.div {...enter(0.2)} className={'mt-5'}>
          {children}
        </motion.div>
      )}
    </>,
    !isCard ? 'relative' : undefined
  );
};

export { UserGreeting };
