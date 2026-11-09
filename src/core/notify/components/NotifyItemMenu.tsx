import { cn } from '@ui/lib/utils';
import { AppDrawer } from '@ui/patterns';
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
  /** Title of the mobile action drawer. */
  title: string;
  items: INotifyMenuItem[];
  className?: string;
}

/** "…" of a notification – mobile: bottom drawer with flat rows, desktop: dropdown menu. */
export const NotifyItemMenu: React.FC<INotifyItemMenuProps> = ({ title, items, className }) => {
  const { t } = useTranslation('notify');
  const mobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  const trigger = cn(
    'grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/6 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
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
          <MoreHorizontal className="size-5" />
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

  // Drawer closes first (back-button history), then the action runs.
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
        <MoreHorizontal className="size-5" />
      </button>
      <AppDrawer
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={t('actions.more')}
        size="auto"
        bodyClassName="px-0 pt-0"
      >
        <ul className="flex flex-col">
          {items.map(item => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => select(item)}
                className={cn(
                  'flex h-12 w-full items-center gap-3 px-4 text-left text-body font-medium outline-none transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 active:bg-accent',
                  item.destructive ? 'text-destructive' : 'text-foreground'
                )}
              >
                <item.icon className="size-5 shrink-0" aria-hidden="true" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </AppDrawer>
    </>
  );
};
