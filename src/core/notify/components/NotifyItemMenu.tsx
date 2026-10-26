import { cn } from '@ui/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ui/shad-cn/components/dropdown-menu.tsx';
import { useIsMobile } from '@ui/shad-cn/hooks/use-mobile';
import { type LucideIcon, MoreHorizontal } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NOTIFY_LAYER_DELAY_MS } from '../const';

export interface INotifyMenuItem {
  key: string;
  label: string;
  icon: LucideIcon;
  destructive?: boolean;
  onSelect: () => void;
}

export interface INotifyItemMenuProps {
  /** Header of the mobile action sheet. */
  title: string;
  items: INotifyMenuItem[];
  className?: string;
}

/** "…" of a notification – mobile: bottom action sheet, desktop: dropdown menu. */
export const NotifyItemMenu: React.FC<INotifyItemMenuProps> = ({ title, items, className }) => {
  const { t } = useTranslation('notify');
  const mobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  const trigger = cn(
    'grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
    className
  );

  if (!mobile) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          className={trigger}
          aria-label={t('actions.more')}
          title={t('actions.more')}
          onClick={event => event.stopPropagation()}
        >
          <MoreHorizontal className="size-[18px]" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56 rounded-xl">
          {items.map(item => (
            <DropdownMenuItem
              key={item.key}
              onClick={event => {
                event.stopPropagation();
                item.onSelect();
              }}
              className={cn(
                'gap-2.5 py-2 font-medium',
                item.destructive && 'text-destructive focus:text-destructive'
              )}
            >
              <item.icon className={cn('size-4', item.destructive && 'text-destructive')} />
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Sheet closes first (back-button history), then the action runs.
  const select = (item: INotifyMenuItem) => {
    setOpen(false);
    window.setTimeout(item.onSelect, NOTIFY_LAYER_DELAY_MS);
  };

  return (
    <>
      <button
        type="button"
        className={trigger}
        aria-label={t('actions.more')}
        aria-haspopup="dialog"
        onClick={event => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <MoreHorizontal className="size-[18px]" />
      </button>
      <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
        <DrawerContent className="mx-auto w-full max-w-[640px]">
          <div className="px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="px-2 pt-1 pb-3">
              <DrawerTitle className="line-clamp-2 text-body font-bold">{title}</DrawerTitle>
              <DrawerDescription className="sr-only">{t('actions.more')}</DrawerDescription>
            </div>
            <ul className="overflow-hidden rounded-2xl bg-foreground/[0.04]">
              {items.map(item => (
                <li key={item.key} className="border-b border-border/40 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => select(item)}
                    className={cn(
                      'flex h-14 w-full items-center gap-3.5 px-4 text-left text-body font-semibold outline-none transition-colors focus-visible:bg-foreground/[0.06] active:bg-foreground/[0.06]',
                      item.destructive && 'text-destructive'
                    )}
                  >
                    <item.icon className="size-5 shrink-0" strokeWidth={2} />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 h-12 w-full rounded-2xl bg-foreground/[0.04] text-body font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring active:bg-foreground/[0.08]"
            >
              {t('actions.back')}
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
