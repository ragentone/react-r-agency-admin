import { Events } from '@core/event/events.ts';
import { useMenuText } from '@core/menu/components/use.menu.text.ts';
import { useRouter } from '@tanstack/react-router';
import { cn } from '@ui/lib';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/shad-cn/components/dropdown-menu.tsx';
import { LayoutGrid } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useDockMenu } from '../hooks';
import type { IDockMenuContext, IDockMenuItem } from '../types.ts';

const resolveTo = (item: IDockMenuItem, ctx: IDockMenuContext) =>
  typeof item.to === 'function' ? item.to(ctx) : item.to;

/**
 * Dropdown menu on the left of the dock. Items are registered dynamically
 * (`Core.dock.registerMenuItem`) with visibility (`always` / `authenticated` / `guest`),
 * roles and an action (`onClick`, `emit`, `to`). No visible item → not rendered.
 */
const DockMenu = () => {
  const { t } = useTranslation('menu');
  const text = useMenuText();
  const router = useRouter();
  const { ctx, items, groups } = useDockMenu();

  if (items.length === 0) return null;

  const run = (item: IDockMenuItem) => {
    item.onClick?.(ctx);
    if (item.emit) {
      // Custom events are typed per app (`ICustomEventMap`) – registered by name here.
      void Events.custom.emit(item.emit as never, { payload: item.payload } as never);
    }
    const to = resolveTo(item, ctx);
    if (to) void router.navigate({ to: to as '/' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type={'button'}
          aria-label={t('dockMenu.label')}
          className={
            'flex size-11 shrink-0 items-center justify-center rounded-full text-foreground outline-none transition-[background-color,transform] hover:bg-foreground/[0.06] active:scale-95 focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:bg-foreground/[0.08] [-webkit-tap-highlight-color:transparent]'
          }
        >
          <LayoutGrid className={'size-[22px]'} strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={'top'}
        align={'start'}
        sideOffset={10}
        collisionPadding={8}
        className={'max-h-[70dvh] min-w-60 max-w-[calc(100vw-1rem)] rounded-2xl p-1.5'}
      >
        {groups.map((group, groupIndex) => (
          <React.Fragment key={group[0].group ?? `group-${groupIndex}`}>
            {groupIndex > 0 && <DropdownMenuSeparator className={'my-1'} />}
            {group.map(item => {
              const Icon = item.icon;
              const to = resolveTo(item, ctx);
              const active = Boolean(to && to === ctx.pathname);
              return (
                <DropdownMenuItem
                  key={item.id}
                  variant={item.destructive ? 'destructive' : 'default'}
                  onSelect={() => run(item)}
                  aria-current={active ? 'page' : undefined}
                  className={cn('min-h-11 gap-3 rounded-xl px-3 py-2', active && 'bg-accent')}
                >
                  {Icon && <Icon className={'size-[1.125rem]'} />}
                  <span className={'flex min-w-0 flex-1 flex-col'}>
                    <span
                      className={cn('truncate text-body', active ? 'font-bold' : 'font-medium')}
                    >
                      {text(item.label)}
                    </span>
                    {item.description && (
                      <span className={'truncate text-caption text-muted-foreground'}>
                        {text(item.description)}
                      </span>
                    )}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { DockMenu };
