import { cn } from '@ui/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar.tsx';
import { UserRound } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const SIZES = {
  md: { avatar: 'size-11', icon: 'size-5', dot: 'size-3.5 border-[2.5px]' },
  lg: { avatar: 'size-12', icon: 'size-5', dot: 'size-3.5 border-[2.5px]' },
  xl: { avatar: 'size-16', icon: 'size-7', dot: 'right-0.5 bottom-0.5 size-4 border-[3px]' },
} as const;

export interface IFriendAvatarProps {
  alias: string;
  avatarUrl?: string | null;
  /** Black dot bottom right (accepted friends only). */
  online?: boolean;
  size?: keyof typeof SIZES;
  className?: string;
}

/** Avatar of a user in the friends UI – fine ring, person icon as fallback, online dot. */
export const FriendAvatar: React.FC<IFriendAvatarProps> = ({
  alias,
  avatarUrl,
  online,
  size = 'lg',
  className,
}) => {
  const { t } = useTranslation('friends');
  const s = SIZES[size];
  return (
    <span className={cn('relative shrink-0', className)}>
      <Avatar className={cn(s.avatar, 'ring-1 ring-border/50')}>
        {avatarUrl && <AvatarImage src={avatarUrl} alt={alias} className="object-cover" />}
        <AvatarFallback className="bg-muted text-muted-foreground">
          <UserRound className={s.icon} />
        </AvatarFallback>
      </Avatar>
      {online && (
        <span
          role="img"
          aria-label={t('online')}
          className={cn(
            'absolute right-0 bottom-0 rounded-full border-background bg-foreground',
            s.dot
          )}
        />
      )}
    </span>
  );
};
