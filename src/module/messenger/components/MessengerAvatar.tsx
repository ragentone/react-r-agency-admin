import { cn } from '@ui/lib/utils.ts';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar.tsx';
import React from 'react';

import { MESSENGER_ONLINE } from '../const.ts';
import type { IMessengerUser } from '../types.ts';
import { initialsOf } from '../utils.ts';

export interface IMessengerAvatarProps {
  user: Pick<IMessengerUser, 'alias' | 'avatarUrl' | 'online'> | null;
  /** Tailwind size, e.g. `size-14`. */
  className?: string;
  /** Green "active" dot (bottom right). */
  showOnline?: boolean;
  /** Dot size, scales with the avatar. */
  dotClassName?: string;
}

/** Round avatar with Messenger's green "active" dot. */
export const MessengerAvatar: React.FC<IMessengerAvatarProps> = ({
  user,
  className,
  showOnline = true,
  dotClassName,
}) => {
  const name = user?.alias ?? '';
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <Avatar className="size-full">
        {user?.avatarUrl && (
          <AvatarImage src={user.avatarUrl} alt={name} className="object-cover" />
        )}
        <AvatarFallback className="bg-foreground/[0.08] text-[0.8em] font-semibold text-foreground">
          {initialsOf(name)}
        </AvatarFallback>
      </Avatar>
      {showOnline && user?.online && (
        <span
          aria-hidden="true"
          style={{ backgroundColor: MESSENGER_ONLINE }}
          className={cn(
            'absolute right-0 bottom-0 size-3.5 rounded-full border-[2.5px] border-background',
            dotClassName
          )}
        />
      )}
    </span>
  );
};
