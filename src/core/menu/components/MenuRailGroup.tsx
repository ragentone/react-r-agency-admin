import { cn } from '@ui/lib';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/shad-cn/components/popover.tsx';
import { useState } from 'react';

import type { IResolvedMenuEntry } from '../hooks';
import type { IMenuContext } from '../types.ts';
import { MenuItemAction, MenuItemBadge, MenuItemIcon } from './MenuParts.tsx';
import { menuSideRowClass, MenuSideRowContent } from './MenuSideRow.tsx';
import { useMenuText } from './use.menu.text.ts';

const popoverRowClass = (active: boolean) =>
  cn(
    'flex h-10 w-full items-center gap-3 rounded-lg px-2.5 text-left text-body text-foreground outline-none transition-colors',
    'hover:bg-foreground/6 focus-visible:ring-2 focus-visible:ring-ring/50',
    active ? 'font-bold' : 'font-medium'
  );

interface IProps {
  item: IResolvedMenuEntry;
  ctx: IMenuContext;
}

/** Entry with children in the icon rail: icon button → popover with the children. */
export const MenuRailGroup = ({ item, ctx }: IProps) => {
  const text = useMenuText();
  const [open, setOpen] = useState(false);
  const label = text(item.entry.label);
  const close = () => setOpen(false);
  // The navigating parent is listed first, without the active state of its children.
  const parent: IResolvedMenuEntry | null =
    item.href || item.entry.onSelect
      ? { ...item, active: item.active && !item.children?.some(c => c.active), children: undefined }
      : null;
  const rows = [...(parent ? [parent] : []), ...(item.children ?? [])];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type={'button'}
          aria-label={label}
          aria-haspopup={'menu'}
          className={menuSideRowClass(item.active, open)}
        >
          <MenuSideRowContent item={item} label={label} />
        </button>
      </PopoverTrigger>
      <PopoverContent side={'right'} align={'start'} sideOffset={8} className={'w-60 p-1.5'}>
        <p className={'px-2.5 pt-1.5 pb-1 text-caption font-medium text-muted-foreground'}>
          {label}
        </p>
        <ul className={'flex flex-col gap-0.5'}>
          {rows.map(row => (
            <li key={row.entry.id}>
              <MenuItemAction
                item={row}
                ctx={ctx}
                label={text(row.entry.label)}
                onAfterSelect={close}
                className={popoverRowClass(row.active)}
              >
                <MenuItemIcon item={row} className={'size-5'} />
                <span className={'min-w-0 flex-1 truncate'}>{text(row.entry.label)}</span>
                {row !== parent && <MenuItemBadge item={row} />}
              </MenuItemAction>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
