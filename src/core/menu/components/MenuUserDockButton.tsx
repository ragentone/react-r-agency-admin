import { cn } from '@ui/lib';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar.tsx';

import { useMenu } from '../hooks';
import { openMenuGroup, useMenuSheetOpen } from '../store.ts';
import { MenuItemBadge } from './MenuParts.tsx';
import { useMenuText } from './use.menu.text.ts';

/** Id of the user group (`core.tsx`). */
const USER_GROUP_ID = 'user';

/**
 * Avatar button in the mobile dock – opens the user group drawer (profile, account,
 * administration, logout). Registered in `core.tsx`. Renders nothing for guests / a hidden
 * menu (the group has no visible entries then). Phones only.
 */
export const MenuUserDockButton = () => {
  const text = useMenuText();
  const { items, ctx, hidden } = useMenu();
  const open = useMenuSheetOpen('group', USER_GROUP_ID);
  const item = items.find(entry => entry.entry.id === USER_GROUP_ID);

  if (hidden || !item?.children?.length) return null;

  const user = ctx.user;
  const name = user?.alias || user?.email || '';
  const initials = (name || 'U').slice(0, 2).toUpperCase();
  const label = text(item.entry.label);

  return (
    <button
      type={'button'}
      aria-label={label}
      aria-haspopup={'dialog'}
      aria-expanded={open}
      onClick={() => openMenuGroup(USER_GROUP_ID)}
      className={cn(
        'relative flex size-11 shrink-0 items-center justify-center rounded-full outline-none transition-[background-color,transform] hover:bg-foreground/[0.06] active:scale-95 focus-visible:ring-2 focus-visible:ring-ring/50 [-webkit-tap-highlight-color:transparent] md:hidden'
      )}
    >
      <Avatar
        className={cn(
          'size-8 ring-2 transition-[box-shadow]',
          item.active || open ? 'ring-foreground' : 'ring-transparent'
        )}
      >
        {user?.avatarUrl && (
          <AvatarImage src={user.avatarUrl} alt={''} className={'object-cover'} />
        )}
        <AvatarFallback className={'bg-muted text-micro font-semibold text-foreground'}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <MenuItemBadge item={item} variant={'dot'} className={'absolute top-0.5 right-0.5'} />
    </button>
  );
};
