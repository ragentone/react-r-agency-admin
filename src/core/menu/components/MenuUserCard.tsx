import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar.tsx';

import type { IMenuGroupDrawerHeaderProps } from '../types.ts';

/** Header of the "user" group drawer: avatar, name and e-mail of the signed-in user. */
export const MenuUserCard = ({ ctx }: IMenuGroupDrawerHeaderProps) => {
  const user = ctx.user;
  if (!user) return null;
  const name = user.alias || user.email || '';
  const initials = (name || 'U').slice(0, 2).toUpperCase();

  return (
    <div className={'flex items-center gap-3 rounded-2xl bg-foreground/[0.05] p-3'}>
      <Avatar className={'size-12 shrink-0'}>
        {user.avatarUrl && (
          <AvatarImage src={user.avatarUrl} alt={name} className={'object-cover'} />
        )}
        <AvatarFallback className={'bg-muted text-sm font-semibold text-foreground'}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className={'min-w-0 flex-1'}>
        <p className={'truncate text-title font-bold'}>{name}</p>
        {user.email && user.alias && (
          <p className={'truncate text-caption text-muted-foreground'}>{user.email}</p>
        )}
      </div>
    </div>
  );
};
