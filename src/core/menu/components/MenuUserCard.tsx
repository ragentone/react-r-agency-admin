import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar.tsx';

import type { IMenuGroupDrawerHeaderProps } from '../types.ts';

/** Header of the "user" group drawer: avatar, name and e-mail of the signed-in user (flat row). */
export const MenuUserCard = ({ ctx }: IMenuGroupDrawerHeaderProps) => {
  const user = ctx.user;
  if (!user) return null;
  const name = user.alias || user.email || '';
  const initials = (name || 'U').slice(0, 2).toUpperCase();

  return (
    <div className={'flex items-center gap-3 border-b border-border/50 px-4 py-3'}>
      <Avatar className={'size-10 shrink-0'}>
        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={''} className={'object-cover'} />}
        <AvatarFallback className={'bg-muted text-caption font-bold text-foreground'}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className={'min-w-0 flex-1'}>
        <p className={'truncate text-body font-bold'}>{name}</p>
        {user.email && user.alias && (
          <p className={'truncate text-caption text-muted-foreground'}>{user.email}</p>
        )}
      </div>
    </div>
  );
};
