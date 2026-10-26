import { cn } from '@ui/lib';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/shad-cn/components/tooltip.tsx';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

import type { IResolvedMenuEntry } from '../hooks';
import { openMenuGroup, useMenuSheetOpen } from '../store.ts';
import type { IMenuContext } from '../types.ts';
import { MenuItemAction, MenuItemBadge, MenuItemIcon } from './MenuParts.tsx';
import { useMenuText } from './use.menu.text.ts';

interface IMenuGroupDrawerProps {
  item: IResolvedMenuEntry;
  /**
   * `drawer` = row in the mobile menu, `sidebar` = expanded desktop sidebar row,
   * `rail` = icon button of the rail.
   */
  variant: 'drawer' | 'sidebar' | 'rail';
  /** Called before the bottom drawer opens (mobile: closes the main menu). */
  onBeforeOpen?: () => void;
}

const rowBase =
  'relative flex w-full items-center gap-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 [-webkit-tap-highlight-color:transparent]';

/**
 * Group with `display: 'drawer'`: one row in the main menu, the children open in the bottom
 * drawer (`MenuSectionDrawerHost`, centered).
 */
export const MenuGroupDrawer = ({ item, variant, onBeforeOpen }: IMenuGroupDrawerProps) => {
  const text = useMenuText();
  const open = useMenuSheetOpen('group', item.entry.id);
  const label = text(item.entry.label);
  const description = item.entry.description ? text(item.entry.description) : null;
  const nested = variant === 'drawer';

  const common = {
    type: 'button' as const,
    onClick: () => {
      onBeforeOpen?.();
      openMenuGroup(item.entry.id);
    },
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': open,
  };

  if (variant === 'rail') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            {...common}
            aria-label={label}
            className={cn(
              'group relative flex w-full items-center justify-center rounded-full p-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50',
              item.active || open
                ? 'bg-foreground/[0.08] text-foreground'
                : 'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground'
            )}
          >
            <span className={'relative flex'}>
              <MenuItemIcon item={item} />
              <MenuItemBadge
                item={item}
                variant={'dot'}
                className={'absolute -right-1.5 -top-1.5'}
              />
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
      {...common}
      className={cn(
        rowBase,
        nested ? 'rounded-2xl px-3 py-2.5' : 'rounded-full px-4 py-3',
        item.active || open
          ? 'bg-foreground/[0.07] text-foreground'
          : nested
            ? 'text-foreground/90 active:bg-foreground/[0.06]'
            : 'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground'
      )}
    >
      <MenuItemIcon item={item} />
      <span className={'flex min-w-0 flex-1 flex-col'}>
        <span className={cn('truncate text-title', item.active ? 'font-bold' : 'font-medium')}>
          {label}
        </span>
        {nested && description && (
          <span className={'truncate text-caption text-muted-foreground'}>{description}</span>
        )}
      </span>
      <MenuItemBadge item={item} />
      <ChevronUp className={'size-4.5 shrink-0 text-muted-foreground'} aria-hidden />
    </button>
  );
};

/** One list row of the group drawer (link / action with icon, description, badge). */
const GroupRow = ({
  item,
  ctx,
  index,
  active,
  showBadge = true,
  close,
}: {
  item: IResolvedMenuEntry;
  ctx: IMenuContext;
  index: number;
  active: boolean;
  showBadge?: boolean;
  close: () => void;
}) => {
  const text = useMenuText();
  const reduceMotion = useReducedMotion();
  const label = text(item.entry.label);

  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + Math.min(index, 12) * 0.03, duration: 0.25, ease: 'easeOut' }}
    >
      <MenuItemAction
        item={{ ...item, active, children: undefined }}
        ctx={ctx}
        label={label}
        onAfterSelect={close}
        className={cn(
          rowBase,
          'rounded-2xl px-3 py-2.5',
          active
            ? 'bg-foreground/[0.07] text-foreground'
            : 'text-foreground/90 hover:bg-foreground/[0.04] active:bg-foreground/[0.06]'
        )}
      >
        <MenuItemIcon item={{ ...item, active }} />
        <span className={'flex min-w-0 flex-1 flex-col'}>
          <span className={cn('truncate text-title', active ? 'font-bold' : 'font-medium')}>
            {label}
          </span>
          {item.entry.description && (
            <span className={'truncate text-caption text-muted-foreground'}>
              {text(item.entry.description)}
            </span>
          )}
        </span>
        {showBadge && <MenuItemBadge item={item} />}
        {item.entry.trailing}
        {active && <span className={'size-1.5 shrink-0 rounded-full bg-foreground'} />}
      </MenuItemAction>
    </motion.li>
  );
};

/** Rows of a group: the navigating parent (if any) followed by its children. */
const rowsOf = (item: IResolvedMenuEntry) => [
  ...(item.href || item.entry.onSelect ? [item] : []),
  ...(item.children ?? []),
];

type Block =
  { type: 'rows'; rows: IResolvedMenuEntry[] } | { type: 'group'; group: IResolvedMenuEntry };

/**
 * Body of the bottom drawer for a group: optional `drawerHeader` (e.g. user card), then the
 * (navigating) parent and the children as list rows. Child groups (e.g. `administration` in
 * `user`) get an own block with heading; rows after them are separated again.
 */
export const MenuGroupDrawerList = ({
  item,
  ctx,
  close,
}: {
  item: IResolvedMenuEntry;
  ctx: IMenuContext;
  close: () => void;
}) => {
  const text = useMenuText();
  const Header = item.entry.drawerHeader;

  const blocks = rowsOf(item).reduce<Block[]>((acc, row) => {
    if (row !== item && row.children?.length) {
      acc.push({ type: 'group', group: row });
      return acc;
    }
    const last = acc[acc.length - 1];
    if (last?.type === 'rows') last.rows.push(row);
    else acc.push({ type: 'rows', rows: [row] });
    return acc;
  }, []);

  /** Row is active – a group parent only when none of its children is. */
  const isActive = (row: IResolvedMenuEntry, parent: IResolvedMenuEntry) =>
    row.active && !(row === parent && parent.children?.some(child => child.active));

  let index = 0;
  return (
    <>
      {Header && (
        <div className={'mb-2'}>
          <Header ctx={ctx} close={close} />
        </div>
      )}
      {blocks.map((block, blockIndex) => {
        const separated = blockIndex > 0 && 'mt-2 border-t border-border/50 pt-2';
        if (block.type === 'rows') {
          return (
            <ul key={`rows:${blockIndex}`} className={cn('flex flex-col gap-0.5', separated)}>
              {block.rows.map(row => (
                <GroupRow
                  key={row.entry.id}
                  item={row}
                  ctx={ctx}
                  index={index++}
                  active={isActive(row, item)}
                  showBadge={row !== item}
                  close={close}
                />
              ))}
            </ul>
          );
        }
        const group = block.group;
        return (
          <section
            key={group.entry.id}
            aria-label={text(group.entry.label)}
            className={cn(separated)}
          >
            <h3
              className={
                'px-3 pt-2 pb-1 text-micro font-semibold uppercase tracking-wider text-muted-foreground'
              }
            >
              {text(group.entry.label)}
            </h3>
            <ul className={'flex flex-col gap-0.5'}>
              {rowsOf(group).map(row => (
                <GroupRow
                  key={row.entry.id}
                  item={row}
                  ctx={ctx}
                  index={index++}
                  active={isActive(row, group)}
                  showBadge={row !== group}
                  close={close}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
};
