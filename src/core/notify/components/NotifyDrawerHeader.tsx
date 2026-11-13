import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { DrawerTitle } from '@ui/shad-cn/components/drawer.tsx';
import { CheckCheck, Trash2, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { NotifyFilter } from '../types';
import { badgeText } from '../utils';
import { NotifyItemMenu } from './NotifyItemMenu';

const TABS: NotifyFilter[] = ['all', 'unread'];

export interface INotifyDrawerHeaderProps {
  filter: NotifyFilter;
  unread: number;
  total: number;
  onSelectTab: (tab: NotifyFilter) => void;
  onMarkAll: () => void;
  /** "Delete all" in the menu (asks for confirmation). */
  onClear: () => void;
  onClose: () => void;
}

/** Title bar (title, unread count, mark all read, menu, close) and the tabs all / unread. */
export const NotifyDrawerHeader: React.FC<INotifyDrawerHeaderProps> = ({
  filter,
  unread,
  total,
  onSelectTab,
  onMarkAll,
  onClear,
  onClose,
}) => {
  const { t } = useTranslation('notify');

  return (
    <>
      <header className="flex min-h-13 items-center gap-1 pr-3 py-2 pl-4 border-b border-border/50">
        <div className="min-w-0 flex-1">
          <DrawerTitle className="truncate text-title font-bold">{t('title')}</DrawerTitle>
        </div>
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={onMarkAll}
          disabled={unread === 0}
          aria-label={t('actions.markAllRead')}
          title={t('actions.markAllRead')}
        >
          <CheckCheck className="size-5" />
        </Button>
        {total > 0 && (
          <NotifyItemMenu
            title={t('title')}
            items={[
              {
                key: 'clear',
                label: t('actions.clearAll'),
                icon: Trash2,
                destructive: true,
                onSelect: onClear,
              },
            ]}
          />
        )}
        <Button variant="ghost" size="icon-lg" onClick={onClose} aria-label={t('actions.close')}>
          <X className="size-5" />
        </Button>
      </header>

      {/* Tabs (like X): the underline marks the active one. */}
      <div role="tablist" aria-label={t('title')} className="flex border-b border-border/50">
        {TABS.map(tab => {
          const active = tab === filter;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              id={`notify-tab-${tab}`}
              aria-selected={active}
              aria-controls="notify-panel"
              onClick={() => onSelectTab(tab)}
              className={cn(
                'relative flex h-12 flex-1 items-center justify-center gap-2 text-body outline-none transition-colors hover:bg-accent/50 focus-visible:bg-accent/50',
                active ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'
              )}
            >
              {t(`tabs.${tab}`)}
              {tab === 'unread' && unread > 0 && (
                <span className="min-w-5 rounded-full bg-foreground px-1.5 text-center text-micro leading-5 font-bold text-background tabular-nums">
                  {badgeText(unread)}
                </span>
              )}
              {active && (
                <span className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-foreground" />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};
