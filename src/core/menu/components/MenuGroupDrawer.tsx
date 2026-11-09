import { ChevronRight } from 'lucide-react';

import type { IResolvedMenuEntry } from '../hooks';
import { openMenuGroup, useMenuSheetOpen } from '../store.ts';
import type { IMenuContext } from '../types.ts';
import { MenuRow } from './MenuRow.tsx';
import { MenuSideButton } from './MenuSideRow.tsx';
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

const MenuGroupRows = ({ item, ctx, close }: IMenuGroupDrawerListProps) => (
  <ul className={'flex flex-col'}>
    {rowsOf(item).map(row => (
      <li key={row.entry.id}>
        <MenuRow item={row} ctx={ctx} onAfterSelect={close} />
      </li>
    ))}
  </ul>
);

/** Content of a group panel: optional `drawerHeader`, then rows; sub groups get a heading. */
export const MenuGroupDrawerList = ({ item, ctx, close }: IMenuGroupDrawerListProps) => {
  const text = useMenuText();
  const Header = item.entry.drawerHeader;

  return (
    <>
      {Header && <Header ctx={ctx} close={close} />}
      <MenuGroupRows item={item} ctx={ctx} close={close} />
      {(item.children ?? [])
        .filter(child => child.children?.length)
        .map(group => (
          <section
            key={group.entry.id}
            aria-label={text(group.entry.label)}
            className={'mt-2 border-t border-border/50 pt-2'}
          >
            <h3
              className={
                'px-4 py-2 text-micro font-medium tracking-wider text-muted-foreground uppercase'
              }
            >
              {text(group.entry.label)}
            </h3>
            <MenuGroupRows item={group} ctx={ctx} close={close} />
          </section>
        ))}
    </>
  );
};

/** Group with `display: 'drawer'` in the desktop sidebar / icon rail: opens the bottom drawer. */
export const MenuGroupDrawer = ({ item }: { item: IResolvedMenuEntry }) => {
  const text = useMenuText();
  const open = useMenuSheetOpen('group', item.entry.id);

  return (
    <MenuSideButton
      item={item}
      label={text(item.entry.label)}
      open={open}
      onClick={() => openMenuGroup(item.entry.id)}
      trailing={
        <ChevronRight
          aria-hidden
          className={'hidden size-4 shrink-0 text-muted-foreground xl:block'}
        />
      }
    />
  );
};
