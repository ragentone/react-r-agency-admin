import { MenuItemAction, MenuItemBadge, MenuItemIcon } from '@core/menu';
import { useMenuText } from '@core/menu';
import { cn } from '@ui/lib';

import type { IResolvedMenuEntry } from '../hooks';
import type { IMenuContext } from '../types.ts';

/** Row of every mobile menu list: flat, 48 px tall, no description, no gap to the next row. */
export const menuRowClass = (active: boolean) =>
  cn(
    'flex h-12 w-full items-center gap-3 px-4 text-left text-body text-foreground outline-none transition-colors',
    'hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring/50 [-webkit-tap-highlight-color:transparent]',
    active ? 'font-bold' : 'font-medium'
  );

interface IMenuRowProps {
  item: IResolvedMenuEntry;
  ctx: IMenuContext;
  /** Called after the entry was selected (closes the menu). */
  onAfterSelect?: () => void;
}

/** One navigating entry (link or action) of a mobile menu list. */
export const MenuRow = ({ item, ctx, onAfterSelect }: IMenuRowProps) => {
  const text = useMenuText();
  const label = text(item.entry.label);

  return (
    <MenuItemAction
      item={item}
      ctx={ctx}
      label={label}
      onAfterSelect={onAfterSelect}
      className={menuRowClass(item.active)}
    >
      <MenuItemIcon item={item} />
      <span className={'min-w-0 flex-1 truncate'}>{label}</span>
      <MenuItemBadge item={item} />
      {item.entry.trailing}
    </MenuItemAction>
  );
};
