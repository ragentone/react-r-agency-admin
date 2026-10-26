import { startCall } from '@core/call/call.engine';
import { primeRingAudio } from '@core/call/ringer';
import { CmsContainer } from '@core/cms';
import { useProfileRoute } from '@core/profile/hooks/use.profile.route.ts';
import { Button, buttonVariants } from '@ui/shad-cn/components/button.tsx';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@ui/shad-cn/components/item.tsx';
import { Spinner } from '@ui/shad-cn/components/spinner.tsx';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Ban,
  Check,
  MoreHorizontal,
  Phone,
  ShieldOff,
  Undo2,
  UserMinus,
  UserRound,
  Video,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FRIENDS_LAYER_DELAY_MS } from '../const';
import { useFriendActions } from '../hooks/use.friend.actions';
import { useFriendSubtitle } from '../hooks/use.friend.subtitle';
import { useFriendsStore, usePendingFriendAction } from '../store';
import type { FriendsFilter, ICmsFriendsAcceptedListItem, IFriendListItem } from '../types';
import { FriendActionMenu } from './FriendActionMenu';
import { FriendAvatar } from './FriendAvatar';
import { FriendConfirmDialog, type FriendConfirmKind } from './FriendConfirmDialog';

export interface IFriendsListItemProps {
  item: IFriendListItem;
  filter: FriendsFilter;
  index?: number;
  /** Override for opening the profile (e.g. close the drawer first). */
  onOpenProfile?: (userId: string) => void;
}

/** Quiet icon action in a row (muted until hover). */
const quietIcon = 'text-muted-foreground hover:text-foreground';

/** One user in a friends list – avatar + name open the profile, actions depend on the list. */
export const FriendsListItem: React.FC<IFriendsListItemProps> = ({
  item,
  filter,
  index = 0,
  onOpenProfile,
}) => {
  const { t } = useTranslation('friends');
  const reduceMotion = useReducedMotion();
  const { openProfile: openProfileRoute } = useProfileRoute();
  const openProfile = onOpenProfile ?? openProfileRoute;
  const actions = useFriendActions();
  const pending = usePendingFriendAction(item.id);
  const [confirm, setConfirm] = useState<FriendConfirmKind | null>(null);
  const relation = item.relation;
  const name = item.alias;
  const subtitle = useFriendSubtitle(item, filter);

  /** The friends drawer (modal) closes first, then the call screen opens. */
  const call = (video: boolean) => {
    primeRingAudio();
    const user = { id: item.id, alias: item.alias, avatarUrl: item.avatarUrl ?? null };
    const drawerOpen = useFriendsStore.getState().drawerOpen;
    useFriendsStore.getState().closeDrawer();
    window.setTimeout(() => void startCall(user, video), drawerOpen ? FRIENDS_LAYER_DELAY_MS : 0);
  };

  return (
    <Item
      asChild
      size="sm"
      className="flex-nowrap gap-3 rounded-none border-0 py-2.5 hover:bg-accent/40"
    >
      <motion.li
        layout={!reduceMotion}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
        transition={{ delay: Math.min(index, 8) * 0.03, duration: 0.25, ease: 'easeOut' }}
      >
        <button
          type="button"
          onClick={() => openProfile(item.id)}
          className="group/profile flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <FriendAvatar alias={name} avatarUrl={item.avatarUrl} online={item.online} />
          <ItemContent className="min-w-0 gap-0">
            <ItemTitle className="w-full min-w-0 text-body font-bold">
              <span className="truncate group-hover/profile:underline">{name}</span>
            </ItemTitle>
            {subtitle && (
              <ItemDescription className="line-clamp-1 text-caption">{subtitle}</ItemDescription>
            )}
          </ItemContent>
        </button>

        <ItemActions className="shrink-0 gap-1.5">
          {filter === 'incoming' && (
            <>
              <Button
                size="sm"
                disabled={!!pending && pending !== 'accept'}
                isLoading={pending === 'accept'}
                onClick={() => void actions.accept(item.id, relation, name)}
                aria-label={t('actions.accept')}
              >
                <Check strokeWidth={2.5} />
                <span className="hidden min-[400px]:inline">{t('actions.acceptShort')}</span>
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={!!pending}
                onClick={() => actions.reject(item.id, relation, name)}
                aria-label={t('actions.reject')}
                title={t('actions.reject')}
              >
                <X />
              </Button>
            </>
          )}

          {filter === 'outgoing' && (
            <Button
              variant="outline"
              size="sm"
              disabled={!!pending}
              onClick={() => actions.cancel(item.id, relation, name)}
              aria-label={t('actions.cancel')}
            >
              <Undo2 />
              <span className="hidden min-[400px]:inline">{t('actions.cancelShort')}</span>
            </Button>
          )}

          {filter === 'blocked' && (
            <Button
              variant="outline"
              size="sm"
              disabled={!!pending && pending !== 'unblock'}
              isLoading={pending === 'unblock'}
              onClick={() => void actions.unblock(item.id, name)}
              aria-label={t('actions.unblock')}
            >
              <ShieldOff />
              <span className="hidden min-[400px]:inline">{t('actions.unblock')}</span>
            </Button>
          )}

          {filter === 'accepted' && (
            <>
              <Button
                variant="ghost"
                size="icon-lg"
                className={quietIcon}
                disabled={!!pending}
                onClick={() => call(true)}
                aria-label={t('actions.videoCallWith', { name })}
                title={t('actions.videoCallWith', { name })}
              >
                <Video />
              </Button>
              <CmsContainer<ICmsFriendsAcceptedListItem>
                name={'friends-accepted-list-item'}
                payload={{
                  user: {
                    id: item.id,
                    alias: name,
                    avatarUrl: item.avatarUrl ?? null,
                    online: item.online ?? false,
                  },
                  filter,
                  close: () => useFriendsStore.getState().closeDrawer(),
                }}
              />
              <FriendActionMenu
                user={{ alias: name, avatarUrl: item.avatarUrl, subtitle }}
                disabled={!!pending}
                triggerLabel={t('actions.more')}
                triggerClassName={buttonVariants({
                  variant: 'ghost',
                  size: 'icon-lg',
                  className: quietIcon,
                })}
                items={[
                  {
                    key: 'videoCall',
                    label: t('actions.videoCall'),
                    icon: Video,
                    onSelect: () => call(true),
                  },
                  {
                    key: 'voiceCall',
                    label: t('actions.voiceCall'),
                    icon: Phone,
                    onSelect: () => call(false),
                  },
                  {
                    key: 'profile',
                    label: t('actions.profile'),
                    icon: UserRound,
                    onSelect: () => openProfile(item.id),
                  },
                  {
                    key: 'remove',
                    label: t('actions.remove'),
                    icon: UserMinus,
                    onSelect: () => actions.remove(item.id, relation, name),
                  },
                  {
                    key: 'block',
                    label: t('actions.block', { name }),
                    icon: Ban,
                    destructive: true,
                    onSelect: () => setConfirm('block'),
                  },
                ]}
              >
                {pending ? <Spinner /> : <MoreHorizontal className="size-5" />}
              </FriendActionMenu>
            </>
          )}
        </ItemActions>

        <FriendConfirmDialog
          kind={confirm}
          name={name}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            setConfirm(null);
            void actions.block(item.id, name, filter);
          }}
        />
      </motion.li>
    </Item>
  );
};
