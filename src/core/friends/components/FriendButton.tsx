import { cn } from '@ui/lib/utils';
import { Button, buttonVariants } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Spinner } from '@ui/shad-cn/components/spinner.tsx';
import {
  Ban,
  Check,
  ChevronDown,
  Clock,
  MoreHorizontal,
  ShieldOff,
  Undo2,
  UserCheck,
  UserMinus,
  UserPlus,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useFriendActions } from '../hooks/use.friend.actions';
import { useFriendRelation } from '../hooks/use.friend.relation';
import type { IFriendRelation } from '../types';
import { filterOfState } from '../utils';
import { FriendActionMenu, type IFriendMenuItem } from './FriendActionMenu';
import { FriendConfirmDialog } from './FriendConfirmDialog';

export interface IFriendButtonProps {
  /** The other user. */
  userId: string;
  /** Display name (alias) for toasts and confirm texts. */
  name: string;
  avatarUrl?: string | null;
  /** Relation known already (e.g. from the profile load) – avoids an extra request. */
  initialRelation?: IFriendRelation | null;
  className?: string;
}

/** Menu triggers (dropdown / action sheet) look like the other buttons. */
const outline = buttonVariants({ variant: 'outline', size: 'md' });
const outlineIcon = buttonVariants({ variant: 'outline', size: 'icon-md' });

/**
 * Relation-aware action (profile):
 * - none → "Add" + ⋯ (block)
 * - outgoing → "Requested ▾" (withdraw / block)
 * - incoming → "Accept" + ✕ + ⋯ (block)
 * - friends → "Friends ▾" (remove / block)
 * - blocked → "Unblock"
 *
 * Optimistic: switches to the target state immediately; decline / withdraw / remove offer undo.
 */
export const FriendButton: React.FC<IFriendButtonProps> = ({
  userId,
  name,
  avatarUrl,
  initialRelation,
  className,
}) => {
  const { t } = useTranslation('friends');
  const { relation, state, loading, pending } = useFriendRelation(userId, initialRelation);
  const actions = useFriendActions();
  const [confirmBlock, setConfirmBlock] = useState(false);

  // Blocked by the other user → nothing to do here.
  if (state === 'blockedByOther' || actions.meId === userId) return null;

  // Relation not known yet (e.g. search results) → placeholder instead of a wrong "Add".
  if (loading && !relation && !pending && initialRelation === undefined) {
    return <Skeleton aria-hidden className={cn('h-9 w-28 rounded-full', className)} />;
  }

  const rel = relation ?? {};
  // Also while the relation reloads after an action (relationId for the next action).
  const disabled = !!pending || loading;
  const spinner = <Spinner />;
  const user = { alias: name, avatarUrl };

  const blockItem: IFriendMenuItem = {
    key: 'block',
    label: t('actions.block', { name }),
    icon: Ban,
    destructive: true,
    onSelect: () => setConfirmBlock(true),
  };

  const moreMenu = (items: IFriendMenuItem[]) => (
    <FriendActionMenu
      user={user}
      items={items}
      disabled={disabled}
      triggerLabel={t('actions.more')}
      triggerClassName={outlineIcon}
    >
      <MoreHorizontal />
    </FriendActionMenu>
  );

  const content = (() => {
    switch (state) {
      case 'none':
        return (
          <>
            <Button
              disabled={disabled && pending !== 'request'}
              isLoading={pending === 'request'}
              onClick={() => void actions.request(userId, name)}
            >
              <UserPlus />
              {t('actions.add')}
            </Button>
            {moreMenu([blockItem])}
          </>
        );
      case 'outgoing':
        return (
          <FriendActionMenu
            user={{ ...user, subtitle: t('state.outgoing') }}
            disabled={disabled}
            triggerLabel={t('state.outgoingMenu')}
            triggerClassName={cn(outline, 'text-muted-foreground')}
            items={[
              {
                key: 'cancel',
                label: t('actions.cancel'),
                icon: Undo2,
                onSelect: () => actions.cancel(userId, rel, name),
              },
              blockItem,
            ]}
          >
            {pending === 'request' ? spinner : <Clock />}
            {t('state.outgoing')}
            <ChevronDown className="-mr-1 size-3.5 opacity-60" />
          </FriendActionMenu>
        );
      case 'incoming':
        return (
          <>
            <Button
              disabled={disabled && pending !== 'accept'}
              isLoading={pending === 'accept'}
              onClick={() => void actions.accept(userId, rel, name)}
            >
              <Check strokeWidth={2.5} />
              {t('actions.accept')}
            </Button>
            <Button
              variant="outline"
              size="icon-md"
              disabled={disabled}
              aria-label={t('actions.reject')}
              title={t('actions.reject')}
              onClick={() => actions.reject(userId, rel, name)}
            >
              <X />
            </Button>
            {moreMenu([blockItem])}
          </>
        );
      case 'friends':
        return (
          <FriendActionMenu
            user={{ ...user, subtitle: t('state.friends') }}
            disabled={disabled}
            triggerLabel={t('state.friendsMenu')}
            triggerClassName={outline}
            items={[
              {
                key: 'remove',
                label: t('actions.remove'),
                icon: UserMinus,
                onSelect: () => actions.remove(userId, rel, name),
              },
              blockItem,
            ]}
          >
            {pending === 'accept' ? spinner : <UserCheck />}
            {t('state.friends')}
            <ChevronDown className="-mr-1 size-3.5 opacity-60" />
          </FriendActionMenu>
        );
      case 'blocked':
        return (
          <Button
            variant="outline"
            disabled={disabled && !pending}
            isLoading={!!pending}
            onClick={() => void actions.unblock(userId, name)}
          >
            <ShieldOff />
            {t('actions.unblock')}
          </Button>
        );
    }
  })();

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {content}
      <FriendConfirmDialog
        kind={confirmBlock ? 'block' : null}
        name={name}
        onClose={() => setConfirmBlock(false)}
        onConfirm={() => {
          setConfirmBlock(false);
          void actions.block(userId, name, filterOfState(state));
        }}
      />
    </div>
  );
};
