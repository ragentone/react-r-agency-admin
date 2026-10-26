import { cn } from '@ui/lib/utils';
import { AppDrawer, DrawerTitle } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ui/shad-cn/components/dropdown-menu.tsx';
import { useIsMobile } from '@ui/shad-cn/hooks/use-mobile';
import { type LucideIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FRIENDS_LAYER_DELAY_MS } from '../const';
import { FriendAvatar } from './FriendAvatar';

export interface IFriendMenuItem {
  key: string;
  label: string;
  icon: LucideIcon;
  destructive?: boolean;
  onSelect: () => void;
}

export interface IFriendActionMenuProps {
  /** Shown as header of the mobile action sheet. */
  user: { alias: string; avatarUrl?: string | null; subtitle?: React.ReactNode };
  items: IFriendMenuItem[];
  /** Trigger content + styling (`buttonVariants(...)`). */
  children: React.ReactNode;
  triggerClassName?: string;
  triggerLabel?: string;
  disabled?: boolean;
}

/**
 * Relation actions – mobile: bottom action sheet with big touch targets (stacks on top of the
 * friends drawer), desktop: dropdown menu.
 */
export const FriendActionMenu: React.FC<IFriendActionMenuProps> = ({
  user,
  items,
  children,
  triggerClassName,
  triggerLabel,
  disabled,
}) => {
  const { t } = useTranslation('friends');
  const mobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  if (!mobile) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          className={triggerClassName}
          aria-label={triggerLabel}
          title={triggerLabel}
          disabled={disabled}
        >
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-60 rounded-2xl p-1.5">
          {items.map(item => (
            <DropdownMenuItem
              key={item.key}
              onClick={item.onSelect}
              className={cn(
                'gap-3 rounded-xl px-3 py-2.5 text-sm font-bold',
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

  // Sheet closes first (back-button history), then the action runs (may open a dialog).
  const select = (item: IFriendMenuItem) => {
    setOpen(false);
    window.setTimeout(item.onSelect, FRIENDS_LAYER_DELAY_MS);
  };

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        disabled={disabled}
        onClick={event => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        {children}
      </button>
      <AppDrawer
        open={open}
        onOpenChange={setOpen}
        title={null}
        description={typeof user.subtitle === 'string' ? user.subtitle : t('actions.more')}
        size="auto"
        hideHeader
      >
        <div className="px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3 px-2 pt-1 pb-3">
            <FriendAvatar alias={user.alias} avatarUrl={user.avatarUrl} size="md" />
            <div className="min-w-0">
              <DrawerTitle className="truncate text-body font-bold">@{user.alias}</DrawerTitle>
              <p className="truncate text-caption text-muted-foreground">
                {user.subtitle ?? t('actions.more')}
              </p>
            </div>
          </div>
          <ul className="overflow-hidden rounded-2xl bg-accent/60">
            {items.map(item => (
              <li key={item.key} className="border-b border-border/40 last:border-b-0">
                <Button
                  variant="ghost"
                  size="xl"
                  pill={false}
                  fullWidth
                  clickEffect={false}
                  onClick={() => select(item)}
                  className={cn(
                    'h-14 justify-start gap-3.5 rounded-none px-4',
                    item.destructive && 'text-destructive hover:text-destructive'
                  )}
                >
                  <item.icon />
                  {item.label}
                </Button>
              </li>
            ))}
          </ul>
          <Button
            variant="secondary"
            size="xl"
            fullWidth
            className="mt-2"
            onClick={() => setOpen(false)}
          >
            {t('actions.back')}
          </Button>
        </div>
      </AppDrawer>
    </>
  );
};
