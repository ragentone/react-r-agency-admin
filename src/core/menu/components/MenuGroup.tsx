import { cn } from '@ui/lib';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/shad-cn/components/popover.tsx';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type IResolvedMenuEntry, useMenuGroupOpen } from '../hooks';
import type { IMenuContext } from '../types.ts';
import { MenuItemAction, MenuItemBadge, MenuItemIcon } from './MenuParts.tsx';
import { useMenuText } from './use.menu.text.ts';

interface IMenuGroupProps {
  item: IResolvedMenuEntry;
  ctx: IMenuContext;
  /** `drawer` = mobile drawer rows, `sidebar` = expanded desktop sidebar (pill rows). */
  variant: 'drawer' | 'sidebar';
  /** Called after a child (or the parent link) was selected – closes the drawer. */
  onAfterSelect?: () => void;
}

/** Nearest scrollable ancestor (drawer nav / sidebar list). */
const scrollParentOf = (el: HTMLElement): HTMLElement | null => {
  let node = el.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
};

/**
 * Scrolls a just expanded group into view: the whole group if it fits, otherwise the parent
 * row to the top (the children follow below). Does nothing when it is already fully visible.
 */
const revealGroup = (el: HTMLElement, smooth: boolean) => {
  const container = scrollParentOf(el);
  if (!container) return;
  const margin = 8;
  const box = container.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto';
  if (rect.height + margin * 2 > box.height || rect.top < box.top + margin) {
    container.scrollBy({ top: rect.top - box.top - margin, behavior });
  } else if (rect.bottom > box.bottom - margin) {
    container.scrollBy({ top: rect.bottom - box.bottom + margin, behavior });
  }
};

const rowBase =
  'relative flex w-full items-center gap-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 [-webkit-tap-highlight-color:transparent]';

/**
 * Entry with children in the drawer / expanded sidebar: parent row (link or toggle) with a
 * chevron, children as an indented list below (collapsible, open state remembered).
 * Expanding scrolls the group into view (drawer / sidebar) when it isn't fully visible.
 */
export const MenuGroup = ({ item, ctx, variant, onAfterSelect }: IMenuGroupProps) => {
  const { t } = useTranslation('menu');
  const text = useMenuText();
  const reduceMotion = useReducedMotion();
  const childActive = Boolean(item.children?.some(child => child.active));
  const { open, toggle: toggleOpen } = useMenuGroupOpen(
    item.entry.id,
    childActive || Boolean(item.entry.defaultOpen)
  );
  const groupRef = useRef<HTMLDivElement>(null);
  // Set when the user opens the group → reveal it once the children are visible.
  const revealRef = useRef(false);
  const toggle = () => {
    revealRef.current = !open;
    toggleOpen();
  };
  const reveal = () => {
    if (!revealRef.current || !groupRef.current) return;
    revealRef.current = false;
    revealGroup(groupRef.current, !reduceMotion);
  };

  // Reduced motion: no expand animation (no `onAnimationComplete`) → reveal after layout.
  useEffect(() => {
    if (!open || !reduceMotion) return;
    const frame = requestAnimationFrame(reveal);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reduceMotion]);
  const label = text(item.entry.label);
  const listId = `menu-group-${item.entry.id}`;
  const parentNavigates = Boolean(item.href || item.entry.onSelect);
  const drawer = variant === 'drawer';

  const parentClass = cn(
    rowBase,
    drawer ? 'rounded-2xl px-3 py-2.5 pr-12' : 'rounded-full px-4 py-3 pr-12',
    item.active && !childActive
      ? drawer
        ? 'bg-foreground/[0.07] text-foreground'
        : 'bg-foreground/[0.08] text-foreground'
      : drawer
        ? 'text-foreground/90 active:bg-foreground/[0.06]'
        : 'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground',
    childActive && 'text-foreground'
  );

  const parentContent = (
    <>
      <MenuItemIcon item={item} />
      <span className={'flex min-w-0 flex-1 flex-col'}>
        <span className={cn('truncate text-title', item.active ? 'font-bold' : 'font-medium')}>
          {label}
        </span>
        {drawer && item.entry.description && (
          <span className={'truncate text-caption text-muted-foreground'}>
            {text(item.entry.description)}
          </span>
        )}
      </span>
      {/* Open: the children show their own badges – collapsed: summed on the parent. */}
      {(!open || item.entry.useBadge) && <MenuItemBadge item={item} />}
    </>
  );

  return (
    <div ref={groupRef} data-slot={'menu-group'}>
      <div className={'relative'}>
        {parentNavigates ? (
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
            'absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/[0.08] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50'
          }
        >
          <ChevronDown
            className={cn('size-4.5 transition-transform duration-200', open && 'rotate-180')}
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
              'ml-[1.375rem] flex flex-col gap-0.5 overflow-hidden border-l border-border/60 pl-2',
              drawer ? 'mt-0.5 mb-1' : 'mt-1 mb-1 ml-[1.625rem]'
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
                    className={cn(
                      rowBase,
                      'gap-3 rounded-xl px-3 py-2',
                      child.active
                        ? 'bg-foreground/[0.07] text-foreground'
                        : 'text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground active:bg-foreground/[0.06]'
                    )}
                  >
                    <MenuItemIcon item={child} className={'size-5'} />
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate text-body',
                        child.active ? 'font-bold' : 'font-medium'
                      )}
                    >
                      {childLabel}
                    </span>
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

/** Entry with children in the icon rail: icon button → popover with the children. */
export const MenuRailGroup = ({ item, ctx }: { item: IResolvedMenuEntry; ctx: IMenuContext }) => {
  const text = useMenuText();
  const [open, setOpen] = useState(false);
  const label = text(item.entry.label);
  const close = () => setOpen(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type={'button'}
          aria-label={label}
          aria-haspopup={'menu'}
          className={cn(
            'group relative flex w-full items-center justify-center rounded-full p-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50',
            item.active || open
              ? 'bg-foreground/[0.08] text-foreground'
              : 'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground'
          )}
        >
          <span className={'relative flex'}>
            <MenuItemIcon item={item} />
            <MenuItemBadge item={item} variant={'dot'} className={'absolute -right-1.5 -top-1.5'} />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent side={'right'} align={'start'} sideOffset={8} className={'w-60 p-1.5'}>
        <p className={'px-2.5 pt-1.5 pb-1 text-caption font-semibold text-muted-foreground'}>
          {label}
        </p>
        <ul className={'flex flex-col gap-0.5'}>
          {(item.href || item.entry.onSelect) && (
            <li>
              <MenuItemAction
                item={item}
                ctx={ctx}
                label={label}
                onAfterSelect={close}
                className={cn(
                  rowBase,
                  'gap-3 rounded-lg px-2.5 py-2',
                  item.active && !item.children?.some(c => c.active)
                    ? 'bg-foreground/[0.07] font-bold'
                    : 'hover:bg-foreground/[0.05]'
                )}
              >
                <MenuItemIcon item={item} className={'size-5'} />
                <span className={'min-w-0 flex-1 truncate text-body'}>{label}</span>
              </MenuItemAction>
            </li>
          )}
          {item.children?.map(child => (
            <li key={child.entry.id}>
              <MenuItemAction
                item={child}
                ctx={ctx}
                label={text(child.entry.label)}
                onAfterSelect={close}
                className={cn(
                  rowBase,
                  'gap-3 rounded-lg px-2.5 py-2',
                  child.active ? 'bg-foreground/[0.07] font-bold' : 'hover:bg-foreground/[0.05]'
                )}
              >
                <MenuItemIcon item={child} className={'size-5'} />
                <span className={'min-w-0 flex-1 truncate text-body'}>
                  {text(child.entry.label)}
                </span>
                <MenuItemBadge item={child} />
              </MenuItemAction>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
