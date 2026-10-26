import { cn } from '@ui/lib/utils';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, Check, Loader2, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { type INotifyActivity, useNotifyActivityStore } from '../activity';
import { formatNotifyDateTime, formatNotifyTime } from '../utils';

export interface INotifyActivityListProps {
  /** Runs the activity's button (the drawer closes first). */
  onAction: (activity: INotifyActivity) => void;
}

const ActivityIcon: React.FC<{ activity: INotifyActivity }> = ({ activity }) => {
  const { status, icon: Icon } = activity;
  return (
    <span
      aria-hidden
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-300',
        status === 'done' && 'bg-foreground text-background',
        status === 'error' && 'bg-destructive/10 text-destructive',
        status === 'running' && 'bg-foreground/[0.06] text-foreground'
      )}
    >
      {status === 'done' ? (
        <Check className="size-5" strokeWidth={2.5} />
      ) : status === 'error' ? (
        <AlertCircle className="size-5" />
      ) : Icon ? (
        <Icon className="size-5 animate-pulse" />
      ) : (
        <Loader2 className="size-5 animate-spin" />
      )}
    </span>
  );
};

/** One live activity (like a notification row): icon, title, hint, progress bar, button. */
const ActivityRow: React.FC<{
  activity: INotifyActivity;
  onAction: (activity: INotifyActivity) => void;
}> = ({ activity, onAction }) => {
  const { t, i18n } = useTranslation('notify');
  const reduceMotion = useReducedMotion();
  const remove = useNotifyActivityStore(state => state.remove);
  const running = activity.status === 'running';
  const progress = activity.status === 'done' ? 100 : activity.progress;

  return (
    <motion.li
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'relative overflow-hidden border-b border-border/50 bg-background',
        !activity.seen && 'bg-[color-mix(in_oklab,var(--foreground)_3.5%,var(--background))]'
      )}
    >
      <div role="status" aria-live="polite" className="flex gap-3 px-4 pt-3 pb-3.5">
        <ActivityIcon activity={activity} />

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-body leading-5 font-bold break-words text-foreground">
            {activity.title}
          </p>
          {activity.message && (
            <p className="mt-0.5 text-body leading-5 break-words text-muted-foreground">
              {activity.message}
            </p>
          )}

          {running ? (
            <div
              role="progressbar"
              aria-label={activity.title}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-foreground/[0.08]"
            >
              <div
                className={cn(
                  'h-full rounded-full bg-foreground transition-[width] duration-700 ease-out',
                  progress === undefined ? 'w-1/3 animate-pulse' : 'animate-pulse'
                )}
                style={progress === undefined ? undefined : { width: `${progress}%` }}
              />
            </div>
          ) : (
            <time
              dateTime={activity.date}
              title={formatNotifyDateTime(activity.date, i18n.language)}
              className="mt-1 block text-caption text-muted-foreground tabular-nums"
            >
              {formatNotifyTime(activity.date, i18n.language, t('time.now'))}
            </time>
          )}

          {activity.action && !running && (
            <button
              type="button"
              onClick={() => onAction(activity)}
              className="mt-2.5 inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-bold text-background outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring active:opacity-75"
            >
              {activity.action.label}
            </button>
          )}
        </div>

        {!running && (
          <button
            type="button"
            onClick={() => remove(activity.id)}
            aria-label={t('actions.dismiss')}
            className="-mt-1 -mr-2 grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </motion.li>
  );
};

/** Live activities at the top of the notification center (shown in every tab). */
export const NotifyActivityList: React.FC<INotifyActivityListProps> = ({ onAction }) => {
  const { t } = useTranslation('notify');
  const items = useNotifyActivityStore(state => state.items);
  if (items.length === 0) return null;

  return (
    <section aria-label={t('activity.label')}>
      <ul>
        <AnimatePresence initial={false}>
          {items.map(activity => (
            <ActivityRow key={activity.id} activity={activity} onAction={onAction} />
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
};
