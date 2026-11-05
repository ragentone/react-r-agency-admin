import { cn } from '@ui/lib';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/shad-cn/components/tooltip.tsx';
import { ChevronRight } from 'lucide-react';

import type { IResolvedMenuEntry } from '../hooks';
import { openMenuGroup, useMenuSheetOpen } from '../store.ts';
import type { IMenuContext,MenuComponentVariant } from '../types.ts';
import { MenuItemBadge, MenuItemIcon } from './MenuParts.tsx';
import { MenuRow } from './MenuRow.tsx';
import { useMenuText } from './use.menu.text.ts';

/** Row of a group as its own entry: the navigating parent row and the children without own active state. */
const ownRow = (row: IResolvedMenuEntry): IResolvedMenuEntry => ({
  ...row,
  active: row.active && !row.children?.some(child => child.active),
  children: undefined,
});

/** Rows of a group: the navigating parent (if any) followed by its direct children. */
const rowsOf = (item: IResolvedMenuEntry) => [
  ...(item.href || item.entry.onSelect ? [ownRow(item)] : []),
  ...(item.children ?? []).map(ownRow),
];

interface IMenuGroupDrawerListProps {
  item: IResolvedMenuEntry;
  ctx: IMenuContext;
  close: () => void;
}

/** Content of a group panel: optional `drawerHeader`, then rows; sub groups get a heading. */
export const MenuGroupDrawerList = ({ item, ctx, close }: IMenuGroupDrawerListProps) => {
  const text = useMenuText();
  const Header = item.entry.drawerHeader;

  return (
    <>
      {Header && <Header ctx={ctx} close={close} />}
      <ul className={'flex flex-col'}>
        {rowsOf(item).map(row => (
          <li key={row.entry.id}>
            <MenuRow item={row} ctx={ctx} onAfterSelect={close} />
          </li>
        ))}
      </ul>
      {(item.children ?? [])
        .filter(child => child.children?.length)
        .map(group => (
          <section key={group.entry.id} aria-label={text(group.entry.label)}>
            <h3 className={'px-4 py-2 text-micro font-semibold uppercase tracking-wider text-muted-foreground'}>
              {text(group.entry.label)}
            </h3>
            <ul className={'flex flex-col'}>
              {rowsOf(group).map(row => (
                <li key={row.entry.id}>
                  <MenuRow item={row} ctx={ctx} onAfterSelect={close} />
                </li>
              ))}
            </ul>
          </section>
        ))}
    </>
  );
};

/** Group with `display: 'drawer'` in the desktop sidebar / icon rail: opens the bottom drawer. */
export const MenuGroupDrawer = ({
  item,
  variant,
  onBeforeOpen,
}: {
  item: IResolvedMenuEntry;
  variant: MenuComponentVariant;
  onBeforeOpen?: () => void;
}) => {
  const text = useMenuText();
  const open = useMenuSheetOpen('group', item.entry.id);
  const label = text(item.entry.label);
  const onClick = () => {
    onBeforeOpen?.();
    openMenuGroup(item.entry.id);
  };

  if (variant === 'rail') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type={'button'}
            onClick={onClick}
            aria-haspopup={'dialog'}
            aria-expanded={open}
            aria-label={label}
            className={cn(
              'group relative flex w-full items-center justify-center rounded-full p-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50',
              item.active || open
                ? 'bg-foreground/8 text-foreground'
                : 'text-muted-foreground hover:bg-foreground/6 hover:text-foreground'
            )}
          >
            <span className={'relative flex'}>
              <MenuItemIcon item={item} />
              <MenuItemBadge item={item} variant={'dot'} className={'absolute -right-1.5 -top-1.5'} />
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side={'right'} sideOffset={6}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button
      type={'button'}
      onClick={onClick}
      aria-haspopup={'dialog'}
      aria-expanded={open}
      className={cn(
        'flex h-12 w-full items-center gap-4 rounded-full px-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50',
        item.active || open
          ? 'bg-foreground/[0.07] text-foreground'
          : 'text-muted-foreground hover:bg-foreground/6 hover:text-foreground'
      )}
    >
      <MenuItemIcon item={item} />
      <span className={cn('min-w-0 flex-1 truncate text-title', item.active ? 'font-bold' : 'font-medium')}>
        {label}
      </span>
      <MenuItemBadge item={item} />
      <ChevronRight className={'size-4 shrink-0 text-muted-foreground'} aria-hidden />
    </button>
  );
};
