import { ProfileDrawer } from '@core/profile/components/ProfileDrawer';
import { useRouter, useRouterState } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog.tsx';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { type INotifyActionConfirm, NotifyActions } from '../actions';
import { type INotifyActivity, useNotifyActivityStore } from '../activity';
import { NOTIFY_LAYER_DELAY_MS } from '../const';
import { useNotifyStore } from '../store';
import type { INotifyAction, INotifyItem, NotifyFilter } from '../types';
import { badgeText, notifyText } from '../utils';
import { NotifyActivityList } from './NotifyActivityList';
import { NotifyItemMenu } from './NotifyItemMenu';
import { NotifyList } from './NotifyList';
import { NotifySystemBanner } from './NotifySystemBanner';

const TABS: NotifyFilter[] = ['all', 'unread'];

/** In-app path a notification may carry in its args (`path` / `url` starting with `/`). */
const pathOf = (item: INotifyItem) => {
  const value = item.args.path ?? item.args.url;
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : null;
};

/** Notification center (bottom sheet, like the friends drawer): tabs all / unread. */
export const NotifyDrawer: React.FC = () => {
  const { t } = useTranslation('notify');
  const router = useRouter();
  const open = useNotifyStore(state => state.drawerOpen);
  const filter = useNotifyStore(state => state.filter);
  const unread = useNotifyStore(state => state.state.unread);
  const total = useNotifyStore(state => state.state.total);
  const { closeDrawer, setFilter, refreshState, markSeen, markAllSeen, remove, clearAll, setBusy } =
    useNotifyStore.getState();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  /** Action waiting for its confirm dialog (e.g. "block"). */
  const [confirmAction, setConfirmAction] = useState<{
    item: INotifyItem;
    action: INotifyAction;
    texts: INotifyActionConfirm;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Closed → nested layers close too.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) {
      setProfileId(null);
      setConfirmClear(false);
      setConfirmAction(null);
    }
  }

  // Navigated away (e.g. from the nested profile) → close the drawer as well.
  const pathname = useRouterState({ select: s => s.location.pathname });
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) closeDrawer();
  }

  // Fresh counters every time the drawer opens.
  useEffect(() => {
    if (open) void refreshState();
  }, [open, refreshState]);

  // Live activities: seen while the drawer is open (badge), finished + seen ones go on close.
  const activities = useNotifyActivityStore(state => state.items);
  useEffect(() => {
    const store = useNotifyActivityStore.getState();
    if (open) store.markAllSeen();
    else store.pruneSeen();
  }, [open, activities]);

  const selectTab = (next: NotifyFilter) => {
    if (next === filter) {
      // Tap on the active tab → back to the top (like X).
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setFilter(next);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  /** Leave the drawer first, then run `next` (back-button history stays clean). */
  const closeThen = (next: () => void) => {
    closeDrawer();
    window.setTimeout(next, NOTIFY_LAYER_DELAY_MS);
  };

  /** Button of a live activity (e.g. "View" the created post) – after the drawer closed. */
  const onActivityAction = (activity: INotifyActivity) => {
    const run = activity.action?.onSelect;
    useNotifyActivityStore.getState().remove(activity.id);
    if (run) closeThen(run);
  };

  /** Tap on a notification: mark as read, then its path or the sender's profile. */
  const onOpen = (item: INotifyItem) => {
    if (!item.seen) void markSeen(item.id);
    const path = pathOf(item);
    if (path) {
      closeThen(() => void router.navigate({ to: path as '/' }));
    } else if (item.from) {
      setProfileId(item.from.id);
    }
  };

  /**
   * Deleted right away on the backend – a delayed delete (undo window) got lost when the page
   * was reloaded / closed within that window, and the notification came back.
   */
  const onDelete = (item: INotifyItem) => {
    remove(item.id, true);
    toast(t('toast.deleted'), { id: `notify-delete-${item.id}` });
  };

  const runAction = async (item: INotifyItem, action: INotifyAction) => {
    setBusy(item.id, action.emit);
    const outcome = await NotifyActions.run({ item, action, close: closeDrawer });
    setBusy(item.id, null);
    if (outcome === 'failed') {
      toast.error(t('errors.action'), { description: notifyText(t, action.label, item) });
      return;
    }
    if (outcome === 'stale') {
      // Nothing left to do (e.g. request already answered) → the notification goes away.
      toast(t('toast.stale'));
      if (item.removable) remove(item.id, true);
      return;
    }
    // Done → the notification has served its purpose.
    if (action.delete && item.removable) remove(item.id, true);
    else if (!item.seen) void markSeen(item.id);
    if (action.close) closeDrawer();
  };

  /** Button of a notification – asks first when its handler wants a confirmation. */
  const onAction = (item: INotifyItem, action: INotifyAction) => {
    const texts = NotifyActions.confirmOf({ item, action });
    if (texts) setConfirmAction({ item, action, texts });
    else void runAction(item, action);
  };

  const onMarkAll = async () => {
    try {
      await markAllSeen();
    } catch {
      toast.error(t('errors.action'));
    }
  };

  const onClear = async () => {
    setConfirmClear(false);
    const ok = await clearAll();
    if (ok) toast.success(t('toast.cleared'));
    else toast.error(t('errors.action'));
  };

  return (
    <Drawer open={open} onOpenChange={next => !next && closeDrawer()} showSwipeHandle>
      <DrawerContent className="mx-auto w-full max-w-[640px] [--drawer-height:92dvh] sm:[--drawer-height:82dvh]">
        <div className="flex h-full min-h-0 flex-col">
          <header className="flex items-center gap-3 px-4 pt-1 pb-2">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-foreground text-background">
              <Bell className="size-5" strokeWidth={2.25} />
            </span>
            <div className="min-w-0 flex-1">
              <DrawerTitle className="text-title leading-6 font-extrabold tracking-tight">
                {t('title')}
              </DrawerTitle>
              <DrawerDescription className="text-caption text-muted-foreground" aria-live="polite">
                {unread > 0 ? t('subtitle', { count: unread }) : t('subtitleNone')}
              </DrawerDescription>
            </div>
            <button
              type="button"
              onClick={() => void onMarkAll()}
              disabled={unread === 0}
              title={t('actions.markAllRead')}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-foreground/[0.06] px-3.5 text-sm font-bold text-foreground transition-[opacity,background-color] hover:bg-foreground/[0.1] disabled:opacity-40"
            >
              <CheckCheck className="size-4" />
              <span className="hidden min-[400px]:inline">{t('actions.markAllReadShort')}</span>
              <span className="sr-only min-[400px]:hidden">{t('actions.markAllRead')}</span>
            </button>
            {total > 0 && (
              <NotifyItemMenu
                title={t('title')}
                className="size-10"
                items={[
                  {
                    key: 'clear',
                    label: t('actions.clearAll'),
                    icon: Trash2,
                    destructive: true,
                    onSelect: () => setConfirmClear(true),
                  },
                ]}
              />
            )}
            <button
              type="button"
              onClick={closeDrawer}
              aria-label={t('actions.close')}
              className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              <X className="size-5" />
            </button>
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
                  onClick={() => selectTab(tab)}
                  className={cn(
                    'relative flex h-12 flex-1 items-center justify-center gap-2 text-body outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.05]',
                    active ? 'font-bold text-foreground' : 'font-semibold text-muted-foreground'
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

          <div
            ref={scrollRef}
            id="notify-panel"
            role="tabpanel"
            aria-labelledby={`notify-tab-${filter}`}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            {open && <NotifyActivityList onAction={onActivityAction} />}
            {open && <NotifySystemBanner />}
            {open && (
              <NotifyList
                key={filter}
                filter={filter}
                onOpen={onOpen}
                onOpenProfile={setProfileId}
                onAction={onAction}
                onDelete={onDelete}
              />
            )}
          </div>
        </div>

        {/* Nested inside the drawer → stacks on top (base-ui nested drawers). */}
        <ProfileDrawer userId={profileId} onClose={() => setProfileId(null)} />

        <AlertDialog
          open={confirmAction !== null}
          onOpenChange={next => !next && setConfirmAction(null)}
        >
          <AlertDialogContent className="max-w-sm rounded-3xl">
            {confirmAction && (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle>{confirmAction.texts.title}</AlertDialogTitle>
                  <AlertDialogDescription>{confirmAction.texts.text}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:flex-col sm:space-x-0">
                  <AlertDialogAction
                    onClick={() => {
                      const { item, action } = confirmAction;
                      setConfirmAction(null);
                      void runAction(item, action);
                    }}
                    className={cn(
                      'h-11 w-full rounded-full font-bold',
                      confirmAction.texts.destructive &&
                        'bg-destructive text-white hover:bg-destructive/90'
                    )}
                  >
                    {confirmAction.texts.action}
                  </AlertDialogAction>
                  <AlertDialogCancel className="mt-0 h-11 w-full rounded-full font-bold">
                    {t('actions.back')}
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </>
            )}
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={confirmClear} onOpenChange={next => !next && setConfirmClear(false)}>
          <AlertDialogContent className="max-w-sm rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirm.clear.title')}</AlertDialogTitle>
              <AlertDialogDescription>{t('confirm.clear.text')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:flex-col sm:space-x-0">
              <AlertDialogAction
                onClick={() => void onClear()}
                className="h-11 w-full rounded-full bg-destructive font-bold text-white hover:bg-destructive/90"
              >
                {t('confirm.clear.action')}
              </AlertDialogAction>
              <AlertDialogCancel className="mt-0 h-11 w-full rounded-full font-bold">
                {t('actions.back')}
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DrawerContent>
    </Drawer>
  );
};
