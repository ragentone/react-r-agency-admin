import { cn } from '@ui/lib';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/shad-cn/components/tooltip.tsx';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronUp, LayoutGrid, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type IResolvedMenuEntry, type IResolvedMenuSection, useMenu } from '../hooks';
import { openMenuSection, useMenuSectionDrawerStore, useMenuSheetOpen } from '../store.ts';
import type { IMenuContext } from '../types.ts';
import { MenuComponentSlot } from './MenuComponentSlot.tsx';
import { MenuGroupDrawerList } from './MenuGroupDrawer.tsx';
import { MenuItemAction, MenuItemBadge, MenuItemIcon } from './MenuParts.tsx';
import { useMenuText } from './use.menu.text.ts';

/** Entries of a section as flat tiles: groups contribute their (navigating) parent + children. */
const tilesOf = (section: IResolvedMenuSection): IResolvedMenuEntry[] =>
  section.items.flatMap(item =>
    item.children?.length
      ? [
          ...(item.href || item.entry.onSelect ? [{ ...item, children: undefined }] : []),
          ...item.children,
        ]
      : [item]
  );

/** Synthetic group entry for the trigger (icon, active state, summed badges of the apps). */
const triggerItemOf = (section: IResolvedMenuSection): IResolvedMenuEntry => {
  const tiles = tilesOf(section);
  return {
    entry: {
      id: `section:${section.id}`,
      label: section.config.label,
      description: section.config.description,
      icon: section.config.icon ?? LayoutGrid,
    },
    active: tiles.some(tile => tile.active),
    children: tiles,
  };
};

interface IMenuSectionTriggerProps {
  section: IResolvedMenuSection;
  /** `drawer` = mobile menu row, `sidebar` = expanded desktop sidebar, `rail` = icon rail. */
  variant: 'drawer' | 'sidebar' | 'rail';
  /** Called before the section drawer opens (mobile: closes the main menu). */
  onBeforeOpen?: () => void;
}

/**
 * Section with `display: 'drawer'` (e.g. the apps): the only row of that section in the menu.
 * Opens the section's entries in the bottom drawer (`MenuSectionDrawerHost`).
 */
export const MenuSectionTrigger = ({
  section,
  variant,
  onBeforeOpen,
}: IMenuSectionTriggerProps) => {
  const text = useMenuText();
  const isOpen = useMenuSheetOpen('section', section.id);
  const item = triggerItemOf(section);
  const label = text(section.config.label);
  const description = section.config.description ? text(section.config.description) : null;
  const count = item.children?.length ?? 0;

  const common = {
    type: 'button' as const,
    onClick: () => {
      onBeforeOpen?.();
      openMenuSection(section.id);
    },
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': isOpen,
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
              item.active || isOpen
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

  const drawer = variant === 'drawer';
  return (
    <button
      {...common}
      className={cn(
        'relative flex w-full items-center gap-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 [-webkit-tap-highlight-color:transparent]',
        drawer ? 'rounded-2xl px-3 py-2.5' : 'rounded-full px-4 py-3',
        item.active || isOpen
          ? 'bg-foreground/[0.07] text-foreground'
          : drawer
            ? 'text-foreground/90 active:bg-foreground/[0.06]'
            : 'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground'
      )}
    >
      <MenuItemIcon item={item} />
      <span className={'flex min-w-0 flex-1 flex-col'}>
        <span className={cn('truncate text-title', item.active ? 'font-bold' : 'font-medium')}>
          {label}
        </span>
        {drawer && description && (
          <span className={'truncate text-caption text-muted-foreground'}>{description}</span>
        )}
      </span>
      <MenuItemBadge item={item} />
      {count > 0 && (
        <span className={'shrink-0 text-caption tabular-nums text-muted-foreground'}>{count}</span>
      )}
      <ChevronUp className={'size-4.5 shrink-0 text-muted-foreground'} aria-hidden />
    </button>
  );
};

/** One app tile of the grid: icon in a rounded square, label below. */
const SectionTile = ({
  item,
  ctx,
  index,
  onAfterSelect,
}: {
  item: IResolvedMenuEntry;
  ctx: IMenuContext;
  index: number;
  onAfterSelect: () => void;
}) => {
  const text = useMenuText();
  const reduceMotion = useReducedMotion();
  const label = text(item.entry.label);

  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + Math.min(index, 16) * 0.025, duration: 0.25, ease: 'easeOut' }}
    >
      <MenuItemAction
        item={item}
        ctx={ctx}
        label={label}
        onAfterSelect={onAfterSelect}
        className={
          'group flex w-full flex-col items-center gap-2 rounded-2xl px-1 py-3 text-center outline-none transition-colors hover:bg-foreground/[0.04] active:bg-foreground/[0.06] focus-visible:ring-2 focus-visible:ring-ring/50 [-webkit-tap-highlight-color:transparent]'
        }
      >
        <span
          className={cn(
            'relative grid size-14 place-items-center rounded-2xl border transition-[transform,background-color,border-color] group-active:scale-95',
            item.active
              ? 'border-foreground bg-foreground text-background'
              : 'border-border/60 bg-foreground/[0.03] text-foreground'
          )}
        >
          <MenuItemIcon item={item} />
          <MenuItemBadge item={item} variant={'dot'} className={'absolute -right-1 -top-1'} />
        </span>
        <span
          className={cn(
            'line-clamp-2 w-full text-caption leading-tight',
            item.active ? 'font-bold text-foreground' : 'font-medium text-foreground/90'
          )}
        >
          {label}
        </span>
      </MenuItemAction>
    </motion.li>
  );
};

/** Resolved content of the bottom drawer (section grid or group list). */
type SheetContent =
  { type: 'section'; section: IResolvedMenuSection } | { type: 'group'; item: IResolvedMenuEntry };

/**
 * Bottom drawer (centered, max. width) for sections with `display: 'drawer'` (grid, e.g. apps)
 * and group entries with `display: 'drawer'` (list, e.g. user) – rendered once in the layout,
 * opened by the triggers / `openMenuSection(id)` / `openMenuGroup(id)`.
 */
export const MenuSectionDrawerHost = () => {
  const { t } = useTranslation('menu');
  const text = useMenuText();
  const target = useMenuSectionDrawerStore(state => state.target);
  const close = useMenuSectionDrawerStore(state => state.close);
  const { sections, items, ctx } = useMenu();

  const resolved = useMemo<SheetContent | null>(() => {
    if (!target) return null;
    if (target.type === 'section') {
      const section = sections.find(s => s.id === target.id);
      return section ? { type: 'section', section } : null;
    }
    const item = items.find(i => i.entry.id === target.id);
    return item?.children?.length ? { type: 'group', item } : null;
  }, [target, sections, items]);

  // Keep the last content while the drawer animates out.
  const [shown, setShown] = useState<SheetContent | null>(null);
  if (resolved && resolved !== shown) setShown(resolved);
  const current = resolved ?? shown;

  const config =
    current?.type === 'section'
      ? { label: current.section.config.label, description: current.section.config.description }
      : current?.type === 'group'
        ? { label: current.item.entry.label, description: current.item.entry.description }
        : null;
  const label = config ? text(config.label) : '';
  const description = config?.description ? text(config.description) : null;

  const tiles = current?.type === 'section' ? tilesOf(current.section) : [];
  const components =
    current?.type === 'section'
      ? current.section.nodes.flatMap(node => (node.type === 'component' ? [node.component] : []))
      : [];

  return (
    <Drawer
      open={Boolean(resolved)}
      onOpenChange={next => {
        if (!next) close();
      }}
      swipeDirection={'down'}
      showSwipeHandle
    >
      <DrawerContent
        className={
          'md:mx-auto md:mb-4 md:w-full md:max-w-xl border-border/50 bg-background dark:bg-background'
        }
      >
        <div className={'flex min-h-0 flex-1 flex-col pb-[env(safe-area-inset-bottom)]'}>
          <div className={'flex items-center gap-2 pt-1 pr-3 pb-2 pl-6'}>
            <div className={'min-w-0 flex-1'}>
              <DrawerTitle className={'truncate text-title font-bold tracking-tight'}>
                {label}
              </DrawerTitle>
              <DrawerDescription
                className={cn(
                  'truncate text-caption text-muted-foreground',
                  !description && 'sr-only'
                )}
              >
                {description ?? label}
              </DrawerDescription>
            </div>
            <button
              type={'button'}
              aria-label={t('sheet.close', { label })}
              onClick={close}
              className={
                'flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50'
              }
            >
              <X className={'size-5'} />
            </button>
          </div>

          <nav
            aria-label={label}
            className={
              'min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-border/50 px-3 py-3'
            }
          >
            {current?.type === 'group' && (
              <MenuGroupDrawerList item={current.item} ctx={ctx} close={close} />
            )}
            {current?.type === 'section' && tiles.length === 0 && components.length === 0 && (
              <p className={'px-3 py-8 text-center text-body text-muted-foreground'}>
                {t('apps.empty')}
              </p>
            )}
            {tiles.length > 0 && (
              <ul className={'grid grid-cols-4 gap-1 sm:grid-cols-5'}>
                {tiles.map((tile, i) => (
                  <SectionTile
                    key={tile.entry.id}
                    item={tile}
                    ctx={ctx}
                    index={i}
                    onAfterSelect={close}
                  />
                ))}
              </ul>
            )}
            {components.length > 0 && (
              <div className={'mt-2 flex flex-col gap-0.5 border-t border-border/50 pt-2'}>
                {components.map(entry => (
                  <MenuComponentSlot
                    key={entry.id}
                    entry={entry}
                    variant={'drawer'}
                    ctx={ctx}
                    close={close}
                  />
                ))}
              </div>
            )}
          </nav>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
