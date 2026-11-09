import { cn } from '@ui/lib';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { type IResolvedMenuEntry, useMenuGroupOpen, useMenuGroupReveal } from '../hooks';
import type { IMenuContext } from '../types.ts';
import { MenuItemAction, MenuItemBadge, MenuItemIcon } from './MenuParts.tsx';
import { menuRowClass } from './MenuRow.tsx';
import { menuSideRowClass } from './MenuSideRow.tsx';
import { useMenuText } from './use.menu.text.ts';

interface IMenuGroupProps {
  item: IResolvedMenuEntry;
  ctx: IMenuContext;
  /** `drawer` = flat rows of the mobile menu, `sidebar` = pill rows of the expanded sidebar. */
  variant: 'drawer' | 'sidebar';
  /** Called after a child (or the parent link) was selected – closes the drawer. */
  onAfterSelect?: () => void;
}

/** Child row: indented under the parent – flat (mobile) or a smaller pill (sidebar). */
const childRowClass = (active: boolean, drawer: boolean) =>
  drawer
    ? cn(menuRowClass(active), 'pl-13')
    : cn(
        'flex h-10 w-full items-center gap-3 rounded-full px-3 text-left text-body text-foreground outline-none transition-colors',
        'hover:bg-foreground/6 focus-visible:ring-2 focus-visible:ring-ring/50',
        active ? 'font-bold' : 'font-medium'
      );

/**
 * Entry with children in the mobile menu / expanded sidebar: parent row (link or toggle) with a
 * chevron, children as an indented list below (collapsible, open state remembered per device).
 * Expanding scrolls the group into view when it isn't fully visible.
 */
export const MenuGroup = ({ item, ctx, variant, onAfterSelect }: IMenuGroupProps) => {
  const { t } = useTranslation('menu');
  const text = useMenuText();
  const reduceMotion = Boolean(useReducedMotion());
  const childActive = Boolean(item.children?.some(child => child.active));
  const { open, toggle: toggleOpen } = useMenuGroupOpen(
    item.entry.id,
    childActive || Boolean(item.entry.defaultOpen)
  );
  const { groupRef, request, reveal } = useMenuGroupReveal(open, reduceMotion);
  const toggle = () => {
    request(!open);
    toggleOpen();
  };

  const label = text(item.entry.label);
  const listId = `menu-group-${item.entry.id}`;
  const drawer = variant === 'drawer';
  // Room for the chevron button on the right.
  const parentClass = cn(
    drawer ? menuRowClass(item.active) : menuSideRowClass(item.active),
    'pr-14 xl:pr-14'
  );
  const parentContent = (
    <>
      <MenuItemIcon item={item} />
      <span className={cn('min-w-0 flex-1 truncate', !drawer && 'text-title')}>{label}</span>
      {/* Open: the children show their own badges – collapsed: summed on the parent. */}
      {(!open || item.entry.useBadge) && <MenuItemBadge item={item} />}
    </>
  );

  return (
    <div ref={groupRef} data-slot={'menu-group'}>
      <div className={'relative'}>
        {item.href || item.entry.onSelect ? (
          <MenuItemAction
            item={item}
            ctx={ctx}
            label={label}
            onAfterSelect={onAfterSelect}
            className={parentClass}
          >
            {parentContent}
          </MenuItemAction>
        ) : (
          <button
            type={'button'}
            onClick={toggle}
            aria-expanded={open}
            aria-controls={listId}
            className={parentClass}
          >
            {parentContent}
          </button>
        )}
        <button
          type={'button'}
          onClick={toggle}
          aria-expanded={open}
          aria-controls={listId}
          aria-label={open ? t('group.collapse', { label }) : t('group.expand', { label })}
          className={
            'absolute top-1/2 right-0.5 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/6 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 [-webkit-tap-highlight-color:transparent]'
          }
        >
          <ChevronDown
            aria-hidden
            className={cn(
              'size-4 transition-transform duration-200 motion-reduce:transition-none',
              open && 'rotate-180'
            )}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            id={listId}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onAnimationComplete={reveal}
            className={cn(
              'flex flex-col overflow-hidden',
              !drawer && 'my-1 ml-7 gap-1 border-l border-border/50 pl-2'
            )}
          >
            {item.children?.map(child => {
              const childLabel = text(child.entry.label);
              return (
                <li key={child.entry.id}>
                  <MenuItemAction
                    item={child}
                    ctx={ctx}
                    label={childLabel}
                    onAfterSelect={onAfterSelect}
                    className={childRowClass(child.active, drawer)}
                  >
                    <MenuItemIcon item={child} className={'size-5'} />
                    <span className={'min-w-0 flex-1 truncate'}>{childLabel}</span>
                    <MenuItemBadge item={child} />
                  </MenuItemAction>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
