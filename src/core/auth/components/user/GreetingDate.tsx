import { cn } from '@ui/lib';
import { motion, useReducedMotion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getDayEmoji,
  getDayProgress,
  getIsoWeek,
  getNextHoliday,
  getSkyPosition,
  GREETING_SLOT_ICONS,
  type GreetingSlot,
} from '@core/auth';
import { GreetingSkyArc } from './GreetingSkyArc.tsx';

const EASE = [0.22, 1, 0.36, 1] as const;

export interface IGreetingDateProps {
  now: Date;
  locale: string;
  slot: GreetingSlot;
  /** Entrance animation delay in seconds (blur + slide up, off with reduced motion). */
  delay?: number;
  className?: string;
}

/**
 * "Today" tile: weekday + day emoji, a large clock with blinking colon, date + calendar week,
 * a day progress bar and – on the right – the sky arc with the sun / moon (stars at night).
 * Monochrome like the greeting card; everything animates in once, then only the colon breathes.
 */
const GreetingDate = ({ now, locale, slot, delay = 0, className }: IGreetingDateProps) => {
  const { t } = useTranslation('auth');
  const reduceMotion = useReducedMotion();
  const SlotIcon = GREETING_SLOT_ICONS[slot];
  const sky = getSkyPosition(now);
  const emoji = getDayEmoji(now);
  const week = getIsoWeek(now);
  const dayProgress = getDayProgress(now);
  const percent = Math.round(dayProgress * 100);
  const dayKey = now.toDateString();
  // Only recalculated when the day changes (`now` ticks every minute).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const holiday = useMemo(() => getNextHoliday(now), [dayKey]);
  const holidayName = t(`greeting.holidays.${holiday.key}`);
  const holidayText =
    holiday.days === 0
      ? t('greeting.holidayToday', { name: holidayName })
      : holiday.days === 1
        ? t('greeting.holidayTomorrow', { name: holidayName })
        : t('greeting.holidayIn', { name: holidayName, count: holiday.days });

  const { weekday, date, timeParts } = useMemo(() => {
    const format = (options: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, options);
    return {
      weekday: format({ weekday: 'long' }).format(now),
      date: format({ day: 'numeric', month: 'long', year: 'numeric' }).format(now),
      // Parts → the separator can blink, AM/PM gets its own small style.
      timeParts: format({ hour: '2-digit', minute: '2-digit' }).formatToParts(now),
    };
  }, [locale, now]);

  const enter = (extra = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 12, filter: 'blur(6px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
          transition: { delay: delay + extra, duration: 0.55, ease: EASE },
        };

  return (
    <motion.div
      {...enter()}
      className={cn('relative isolate overflow-hidden border-t pt-4', className)}
    >
      {/* Soft light from the top right (where the sky sits). */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -top-16 -right-10 -z-10 size-56 rounded-full blur-3xl'
        )}
      />

      <div className={'flex items-start justify-between gap-3'}>
        {/* Left: weekday · clock · date */}
        <div className={'flex min-w-0 flex-col'}>
          <motion.p
            {...enter(0.08)}
            className={
              'flex items-center gap-1.5 text-micro font-semibold uppercase tracking-[0.14em] text-muted-foreground'
            }
          >
            <SlotIcon className={'size-3.5 shrink-0'} strokeWidth={2.25} />
            <time dateTime={now.toISOString().slice(0, 10)} className={'truncate'}>
              {weekday}
            </time>
            <motion.span
              aria-hidden
              className={'inline-block origin-bottom text-base leading-none tracking-normal'}
              initial={reduceMotion ? false : { scale: 0, rotate: -25 }}
              animate={reduceMotion ? undefined : { scale: 1, rotate: [-25, 12, -6, 0] }}
              transition={{ delay: delay + 0.45, duration: 0.7, ease: 'easeOut' }}
            >
              {emoji}
            </motion.span>
          </motion.p>

          <motion.time
            {...enter(0.16)}
            dateTime={now.toISOString()}
            className={
              'mt-1.5 flex items-baseline bg-linear-to-br from-foreground via-foreground to-foreground/45 bg-clip-text text-[clamp(2.75rem,13vw,3.75rem)] leading-none font-extrabold tracking-[-0.045em] text-transparent tabular-nums'
            }
          >
            {timeParts.map((part, i) =>
              part.type === 'literal' && part.value.trim() === ':' ? (
                <motion.span
                  key={i}
                  aria-hidden
                  className={'-mx-[0.02em] -translate-y-[0.06em] text-foreground/40'}
                  animate={reduceMotion ? undefined : { opacity: [1, 0.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  :
                </motion.span>
              ) : part.type === 'dayPeriod' ? (
                <span
                  key={i}
                  className={
                    'ml-1.5 text-body font-bold tracking-normal text-muted-foreground uppercase'
                  }
                >
                  {part.value}
                </span>
              ) : (
                <span key={i}>{part.value}</span>
              )
            )}
          </motion.time>

          <motion.p
            {...enter(0.24)}
            className={'mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption'}
          >
            <span className={'font-medium text-foreground'}>{date}</span>
            <span
              className={
                'rounded-full py-px text-micro font-semibold text-muted-foreground tabular-nums'
              }
            >
              {t('greeting.week', { week })}
            </span>
            <span
              title={new Intl.DateTimeFormat(locale, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(holiday.date)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full py-px text-micro font-semibold tabular-nums',
                holiday.days <= 1
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border/60 text-muted-foreground'
              )}
            >
              <PartyPopper aria-hidden className={'size-3 shrink-0'} strokeWidth={2.25} />
              {holidayText}
            </span>
          </motion.p>
        </div>

        {/* Right: sky */}
        <motion.div {...enter(0.12)} className={'relative -mr-1 shrink-0 pt-1'}>
          <GreetingSkyArc day={sky.day} progress={sky.progress} className={'h-auto w-28 sm:w-44'} />
        </motion.div>
      </div>

      {/* Day progress (00:00 → 24:00) */}
      <motion.div {...enter(0.32)} className={'mt-4'}>
        <div
          role={'progressbar'}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={t('greeting.dayProgress', { percent })}
          className={'relative h-1.5 overflow-hidden rounded-full bg-foreground/[0.08]'}
        >
          <motion.div
            className={'absolute inset-y-0 left-0 rounded-full bg-foreground'}
            initial={reduceMotion ? false : { width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ delay: delay + 0.4, duration: 1.4, ease: EASE }}
          />
          {/* Quarter ticks: 06 · 12 · 18 */}
          {[25, 50, 75].map(tick => (
            <span
              key={tick}
              aria-hidden
              className={'absolute inset-y-0 w-px bg-background/70'}
              style={{ left: `${tick}%` }}
            />
          ))}
        </div>
        <div
          aria-hidden
          className={
            'mt-1.5 flex justify-between text-[10px] font-medium text-muted-foreground/70 tabular-nums'
          }
        >
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>24</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export { GreetingDate };
