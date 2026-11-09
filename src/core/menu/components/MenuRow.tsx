import { cn } from '@ui/lib';
import { ChevronRight } from 'lucide-react';

import type { IResolvedMenuEntry } from '../hooks';
import type { IMenuContext } from '../types.ts';
import { MenuItemAction, MenuItemBadge, MenuItemIcon } from './MenuParts.tsx';
import { useMenuText } from './use.menu.text.ts';

/** Row of every mobile menu list: flat, 48 px tall, no description, no gap to the next row. */
export const menuRowClass = (active: boolean) =>
  cn(
    'flex h-12 w-full items-center gap-3 px-4 text-left text-body text-foreground outline-none transition-colors',
    'hover:bg-accent/50 active:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 [-webkit-tap-highlight-color:transparent]',
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

interface IMenuOpenRowProps {
  item: IResolvedMenuEntry;
  /** Translation key (`ns:key`) or plain text. */
  label: string;
  onClick: () => void;
}

/** Row of a mobile menu list that opens a panel (apps, games, user group) – chevron on the right. */
export const MenuOpenRow = ({ item, label, onClick }: IMenuOpenRowProps) => {
  const text = useMenuText();

  return (
    <button
      type={'button'}
      aria-haspopup={'dialog'}
      onClick={onClick}
      className={menuRowClass(item.active)}
    >
      <MenuItemIcon item={item} />
      <span className={'min-w-0 flex-1 truncate'}>{text(label)}</span>
      <MenuItemBadge item={item} />
      <ChevronRight className={'size-4 shrink-0 text-muted-foreground'} aria-hidden />
    </button>
  );
};
