import { cn } from '@ui/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar.tsx';
import {
  animate,
  motion,
  type PanInfo,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { CheckCheck, Loader2, Trash2, UserRound } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { INotifyAction, INotifyItem } from '../types';
import { formatNotifyDateTime, formatNotifyTime, notifyText } from '../utils';
import { type INotifyMenuItem, NotifyItemMenu } from './NotifyItemMenu';
import { NotifyTypeIcon } from './NotifyTypeIcon';

/** Swipe distance (px) that deletes the notification. */
const SWIPE_DELETE_PX = 96;

export interface INotifyItemProps {
  item: INotifyItem;
  index?: number;
  /** Emit of the action in flight (spinner). */
  busy?: string;
  onOpen: (item: INotifyItem) => void;
  onOpenProfile: (userId: string) => void;
  onAction: (item: INotifyItem, action: INotifyAction) => void;
  onSeen: (item: INotifyItem) => void;
  onDelete: (item: INotifyItem) => void;
}

const pill =
  'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-bold outline-none transition-[opacity,background-color] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60';

const actionClass = (variant: INotifyAction['variant']) => {
  switch (variant) {
    case 'destructive':
      return cn(pill, 'border border-border/60 text-destructive hover:bg-destructive/10');
    case 'default':
    case undefined:
    case null:
      return cn(pill, 'bg-foreground text-background hover:opacity-90');
    case 'link':
    case 'ghost':
      return cn(pill, 'px-3 text-foreground hover:bg-foreground/[0.06]');
    default:
      return cn(pill, 'border border-border/60 text-foreground hover:bg-foreground/[0.06]');
  }
};

/**
 * One notification (like X): sender avatar with type badge (or type icon), bold title,
 * text, relative time, action buttons. Unread → dot + tinted row. Swipe left to delete.
 */
export const NotifyItem: React.FC<INotifyItemProps> = ({
  item,
  index = 0,
  busy,
  onOpen,
  onOpenProfile,
  onAction,
  onSeen,
  onDelete,
}) => {
  const { t, i18n } = useTranslation('notify');
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const trashOpacity = useTransform(x, [-SWIPE_DELETE_PX, -24, 0], [1, 0.4, 0]);
  const trashScale = useTransform(x, [-SWIPE_DELETE_PX, -24], [1, 0.7]);

  const title = notifyText(t, item.title, item);
  const message = notifyText(t, item.message, item);
  const heading = title || message;
  const body = title ? message : '';
  const time = formatNotifyTime(item.date, i18n.language, t('time.now'));
  const fullTime = formatNotifyDateTime(item.date, i18n.language);

  const menu = useMemo<INotifyMenuItem[]>(() => {
    const entries: INotifyMenuItem[] = [];
    if (!item.seen) {
      entries.push({
        key: 'seen',
        label: t('actions.markRead'),
        icon: CheckCheck,
        onSelect: () => onSeen(item),
      });
    }
    if (item.from) {
      entries.push({
        key: 'profile',
        label: t('actions.profile', { name: item.from.alias }),
        icon: UserRound,
        onSelect: () => onOpenProfile(item.from!.id),
      });
    }
    if (item.removable) {
      entries.push({
        key: 'delete',
        label: t('actions.delete'),
        icon: Trash2,
        destructive: true,
        onSelect: () => onDelete(item),
      });
    }
    return entries;
  }, [item, onDelete, onOpenProfile, onSeen, t]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_DELETE_PX || info.velocity.x < -700) {
      void animate(x, -480, { duration: 0.18 });
      onDelete(item);
      return;
    }
    void animate(x, 0, { type: 'spring', stiffness: 500, damping: 40 });
  };

  return (
    <motion.li
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.03, duration: 0.22, ease: 'easeOut' }}
      className="relative overflow-hidden border-b border-border/50"
    >
      {/* Revealed while swiping left. */}
      {item.removable && (
        <motion.div
          aria-hidden
          style={{ opacity: trashOpacity }}
          className="absolute inset-0 flex items-center justify-end bg-destructive pr-6 text-white"
        >
          <motion.span style={{ scale: trashScale }}>
            <Trash2 className="size-5" />
          </motion.span>
        </motion.div>
      )}

      <motion.div
        drag={item.removable && !reduceMotion ? 'x' : false}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.7, right: 0 }}
        style={{ x }}
        onDragEnd={onDragEnd}
        className={cn(
          'relative flex gap-3 bg-background px-4 py-3 transition-colors',
          !item.seen && 'bg-[color-mix(in_oklab,var(--foreground)_3.5%,var(--background))]'
        )}
      >
        {/* Unread marker */}
        {!item.seen && (
          <span
            role="img"
            aria-label={t('unread')}
            className="absolute top-[22px] left-1.5 size-2 rounded-full bg-foreground"
          />
        )}

        {/* Avatar (sender) or type icon */}
        <div className="shrink-0 pt-0.5">
          {item.from ? (
            <button
              type="button"
              onClick={() => onOpenProfile(item.from!.id)}
              aria-label={t('actions.profile', { name: item.from.alias })}
              className="relative block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="size-10 ring-1 ring-border/50">
                {item.from.avatarUrl && (
                  <AvatarImage
                    src={item.from.avatarUrl}
                    alt={item.from.alias}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <UserRound className="size-5" />
                </AvatarFallback>
              </Avatar>
              <NotifyTypeIcon type={item.type} badge className="absolute -right-1 -bottom-1" />
            </button>
          ) : (
            <NotifyTypeIcon type={item.type} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1">
            <button
              type="button"
              onClick={() => onOpen(item)}
              className="min-w-0 flex-1 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className={cn(
                  'block text-body leading-5 break-words text-foreground',
                  item.seen ? 'font-semibold' : 'font-bold'
                )}
              >
                {heading}
              </span>
              {body && (
                <span className="mt-0.5 line-clamp-4 block text-body leading-5 break-words text-muted-foreground">
                  {body}
                </span>
              )}
              <time
                dateTime={item.date}
                title={fullTime}
                className="mt-1 block text-caption text-muted-foreground tabular-nums"
              >
                {time}
              </time>
            </button>
            <NotifyItemMenu title={heading} items={menu} className="-mt-1.5 -mr-2" />
          </div>

          {item.actions.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {item.actions.map(action => {
                const running = busy === action.emit;
                return (
                  <button
                    key={`${action.emit}:${action.label}`}
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => onAction(item, action)}
                    className={actionClass(action.variant)}
                  >
                    {running && <Loader2 className="size-4 animate-spin" />}
                    {notifyText(t, action.label, item)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.li>
  );
};
