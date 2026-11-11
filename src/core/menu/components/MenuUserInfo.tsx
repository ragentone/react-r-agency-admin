import { cn } from '@ui/lib';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar.tsx';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@ui/shad-cn/components/item.tsx';

import type { IMenuContext } from '../types.ts';

interface IProps {
  ctx: IMenuContext;
  /** Alias and e-mail block (sidebar: `hidden xl:flex`, so the rail only shows the avatar). */
  textClassName?: string;
}

/**
 * User info under the brand: avatar, alias and e-mail of the signed-in user (shadcn `Item`, outline).
 * Renders nothing for guests.
 */
export const MenuUserInfo = ({ ctx, textClassName }: IProps) => {
  const user = ctx.user;
  if (!user) return null;
  const name = user.alias || user.email || '';
  const initials = (name || 'U').slice(0, 2).toUpperCase();

  return (
    <Item variant={'default'} size={'sm'} className={'rounded-none justify-start px-4 pt-5 pb-5'}>
      <ItemMedia>
        <Avatar className={'size-10'}>
          {user.avatarUrl && (
            <AvatarImage src={user.avatarUrl} alt={''} className={'object-cover'} />
          )}
          <AvatarFallback className={'bg-muted text-caption font-bold text-foreground'}>
            {initials}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent className={cn('min-w-0 gap-0', textClassName)}>
        {user.alias && (
          <ItemTitle className={'block truncate text-body font-bold'}>{user.alias}</ItemTitle>
        )}
        {user.email && (
          <ItemDescription className={'truncate text-caption'}>{user.email}</ItemDescription>
        )}
      </ItemContent>
    </Item>
  );
};
