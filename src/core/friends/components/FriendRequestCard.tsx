import { Button } from '@ui/shad-cn/components/button.tsx';
import { motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFriendActions } from '../hooks/use.friend.actions';
import { useFriendSubtitle } from '../hooks/use.friend.subtitle';
import { usePendingFriendAction } from '../store';
import type { IFriendListItem } from '../types';
import { FriendAvatar } from './FriendAvatar';

export interface IFriendRequestCardProps {
  item: IFriendListItem;
  index?: number;
  onOpenProfile: (userId: string) => void;
}

/** Received request as a card in the horizontal carousel – big avatar, accept / decline. */
export const FriendRequestCard: React.FC<IFriendRequestCardProps> = ({
  item,
  index = 0,
  onOpenProfile,
}) => {
  const { t } = useTranslation('friends');
  const reduceMotion = useReducedMotion();
  const actions = useFriendActions();
  const pending = usePendingFriendAction(item.id);
  const subtitle = useFriendSubtitle(item, 'incoming');

  return (
    <motion.li
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
      transition={{ delay: Math.min(index, 6) * 0.04, type: 'spring', stiffness: 380, damping: 30 }}
      className="w-40 shrink-0 snap-start"
    >
      <div className="flex h-full flex-col items-center rounded-2xl border border-border/60 bg-background p-3 pt-4 text-center">
        <button
          type="button"
          onClick={() => onOpenProfile(item.id)}
          className="group flex w-full min-w-0 flex-col items-center rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <FriendAvatar
            alias={item.alias}
            avatarUrl={item.avatarUrl}
            online={item.online}
            size="xl"
          />
          <span className="mt-2.5 w-full truncate text-body font-bold group-hover:underline">
            {item.alias}
          </span>
          <span className="w-full truncate text-caption text-muted-foreground">
            {subtitle ?? ' '}
          </span>
        </button>

        <div className="mt-3 flex w-full items-center gap-1.5">
          <Button
            size="sm"
            className="flex-1 px-2"
            disabled={!!pending && pending !== 'accept'}
            isLoading={pending === 'accept'}
            onClick={() => void actions.accept(item.id, item.relation, item.alias)}
          >
            {t('actions.acceptShort')}
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={!!pending}
            onClick={() => actions.reject(item.id, item.relation, item.alias)}
            aria-label={t('actions.reject')}
            title={t('actions.reject')}
          >
            <X />
          </Button>
        </div>
      </div>
    </motion.li>
  );
};
