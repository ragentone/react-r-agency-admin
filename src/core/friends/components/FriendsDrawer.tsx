import { ProfileDrawer } from '@core/profile/components/ProfileDrawer';
import { SearchDrawer } from '@core/search/components/SearchDialog';
import { executeSearchItem } from '@core/search/manager.ts';
import type { ISearchItem } from '@core/search/types.ts';
import { useRouter, useRouterState } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import { AppDrawer } from '@ui/patterns';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@ui/shad-cn/components/input-group.tsx';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@ui/shad-cn/components/item.tsx';
import { Spinner } from '@ui/shad-cn/components/spinner.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Ban, ChevronDown, RefreshCw, Search, Send, Users, WifiOff, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FRIENDS_LAYER_DELAY_MS, FRIENDS_TAB_DELAY_MS } from '../const';
import { useFriendsList } from '../hooks/use.friends.list';
import { useLoadMoreSentinel } from '../hooks/use.load.more.sentinel';
import { useFriendsStore } from '../store';
import type { FriendsFilter } from '../types';
import { FriendsEmpty, FriendsList, FriendsListSkeleton, LoadMoreFooter } from './FriendsList';
import { FriendsListItem } from './FriendsListItem';

/** Local filter shows up from this many friends on. */
const FILTER_FROM = 6;

type FriendsTab = 'accepted' | 'incoming' | 'manage';
const TABS: FriendsTab[] = ['accepted', 'incoming', 'manage'];

const tabOf = (focus: FriendsFilter): FriendsTab =>
  focus === 'incoming' ? 'incoming' : focus === 'accepted' ? 'accepted' : 'manage';

/** Tab bar like X: equal width, bold, black underline under the active tab. */
const tabTrigger = cn(
  'relative h-12 flex-1 gap-1.5 rounded-none px-2 text-body font-bold text-muted-foreground',
  'hover:bg-accent/40 hover:text-foreground focus-visible:ring-offset-0',
  'data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none',
  'after:absolute after:bottom-0 after:left-1/2 after:h-1 after:w-12 after:-translate-x-1/2 after:rounded-full after:bg-foreground after:opacity-0 after:transition-opacity',
  'data-[state=active]:after:opacity-100'
);

const CountBadge: React.FC<{ count: number; solid?: boolean }> = ({ count, solid }) =>
  count > 0 ? (
    <Badge
      variant={solid ? 'default' : 'secondary'}
      className="h-5 min-w-5 justify-center rounded-full px-1.5 text-micro font-bold tabular-nums shadow-none"
    >
      {count > 99 ? '99+' : count}
    </Badge>
  ) : null;

/** Tab "Friends": all friends (online first) + filter by name across all pages. */
const FriendsTabPanel: React.FC<{
  delayMs: number;
  onOpenProfile: (id: string) => void;
  onDiscover: () => void;
}> = ({ delayMs, onOpenProfile, onDiscover }) => {
  const { t } = useTranslation('friends');
  const list = useFriendsList('accepted', true, delayMs);
  const [filter, setFilter] = useState('');
  const { hasMore, loadMore, loading, loadingMore, error } = list;
  const query = filter.trim().toLowerCase();

  // Filtering must see every friend, not just the loaded pages → page through the rest.
  useEffect(() => {
    if (query && hasMore && !loading && !loadingMore && !error) void loadMore();
  }, [error, hasMore, loadMore, loading, loadingMore, query]);

  const sentinel = useLoadMoreSentinel(
    !query && hasMore && !loading && !loadingMore && !error,
    loadMore,
    '200px'
  );

  const sorted = useMemo(
    // Stable: online friends first, otherwise backend order.
    () => [...list.items].sort((a, b) => Number(!!b.online) - Number(!!a.online)),
    [list.items]
  );
  const visible = useMemo(
    () => (query ? sorted.filter(item => item.alias.toLowerCase().includes(query)) : sorted),
    [query, sorted]
  );
  const online = list.items.filter(item => item.online).length;
  const searchingRest = !!query && hasMore;

  if (!list.loaded) return <FriendsListSkeleton count={7} />;

  if (list.error && list.items.length === 0) {
    return (
      <FriendsEmpty
        role="alert"
        icon={WifiOff}
        title={t('errors.loadTitle')}
        text={t('errors.loadText')}
        action={
          <Button size="lg" onClick={() => void list.reload()}>
            <RefreshCw />
            {t('actions.retry')}
          </Button>
        }
      />
    );
  }

  if (list.items.length === 0) {
    return (
      <FriendsEmpty
        icon={Users}
        title={t('empty.accepted.title')}
        text={t('empty.accepted.text')}
        action={
          <Button size="lg" onClick={onDiscover}>
            <Search />
            {t('empty.accepted.action')}
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="space-y-2 px-4 pt-3 pb-2">
        {list.total >= FILTER_FROM && (
          <InputGroup className="h-11 rounded-full border-transparent bg-accent/70 shadow-none focus-within:border-foreground focus-within:bg-background focus-within:ring-0 dark:bg-accent/70">
            <InputGroupAddon className="ps-4">
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              onKeyDown={e => {
                // Esc clears the filter first instead of closing the drawer.
                if (e.key === 'Escape' && filter) {
                  e.stopPropagation();
                  setFilter('');
                }
              }}
              placeholder={t('filterPlaceholder')}
              aria-label={t('filterPlaceholder')}
              enterKeyHint="search"
              autoComplete="off"
              className="h-full text-base sm:text-body [&::-webkit-search-cancel-button]:hidden"
            />
            {(searchingRest || filter) && (
              <InputGroupAddon align="inline-end" className="pe-2">
                {searchingRest && <Spinner />}
                {filter && (
                  <InputGroupButton
                    size="icon-sm"
                    className="rounded-full"
                    onClick={() => setFilter('')}
                    aria-label={t('actions.clearFilter')}
                  >
                    <X />
                  </InputGroupButton>
                )}
              </InputGroupAddon>
            )}
          </InputGroup>
        )}
        <p className="flex items-center gap-1.5 px-1 text-caption text-muted-foreground">
          {t('subtitle', { count: list.total })}
          {online > 0 && (
            <>
              <span aria-hidden>·</span>
              <span className="size-2 rounded-full bg-foreground" aria-hidden />
              {t('onlineCount', { count: online })}
            </>
          )}
        </p>
      </div>

      {visible.length === 0 && !searchingRest ? (
        <FriendsEmpty
          icon={Search}
          title={t('filterEmpty', { term: filter.trim() })}
          className="py-8"
          action={
            <Button variant="outline" onClick={onDiscover}>
              <Search />
              {t('actions.discover')}
            </Button>
          }
        />
      ) : (
        <>
          <ul className="divide-y divide-border/50 border-t border-border/50">
            <AnimatePresence initial={false}>
              {visible.map((item, index) => (
                <FriendsListItem
                  key={item.relation.relationId}
                  item={item}
                  filter="accepted"
                  index={index}
                  onOpenProfile={onOpenProfile}
                />
              ))}
            </AnimatePresence>
          </ul>
          {hasMore && !query && <div ref={sentinel} aria-hidden className="h-px" />}
          <LoadMoreFooter
            loadingMore={loadingMore && !query}
            error={error}
            onRetry={() => void loadMore()}
          />
        </>
      )}
    </>
  );
};

/** "Sent requests" / "Blocked" – collapsible rows, the list loads when opened. */
const ManageRow: React.FC<{
  filter: Extract<FriendsFilter, 'outgoing' | 'blocked'>;
  count: number;
  open: boolean;
  delayMs: number;
  onToggle: () => void;
  onOpenProfile: (id: string) => void;
}> = ({ filter, count, open, delayMs, onToggle, onOpenProfile }) => {
  const { t } = useTranslation('friends');
  const Icon = filter === 'outgoing' ? Send : Ban;
  const panelId = `friends-manage-${filter}`;
  return (
    <div className="border-b border-border/50">
      <Item
        asChild
        size="sm"
        className="min-h-16 w-full flex-nowrap gap-3.5 rounded-none border-0 text-left hover:bg-accent/40 active:bg-accent/60"
      >
        <button type="button" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
          <ItemMedia className="size-10 rounded-full bg-accent">
            <Icon className="size-[18px]" />
          </ItemMedia>
          <ItemContent className="min-w-0 gap-0">
            <ItemTitle className="text-body font-bold">{t(`sections.${filter}`)}</ItemTitle>
            <ItemDescription className="text-caption">
              {t(`sections.${filter}Hint`, { count })}
            </ItemDescription>
          </ItemContent>
          <ChevronDown
            className={cn(
              'size-5 shrink-0 text-muted-foreground transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </button>
      </Item>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border/50"
          >
            <FriendsList filter={filter} initialDelayMs={delayMs} onOpenProfile={onOpenProfile} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Friends drawer: tabs Friends · Requests · Manage (sent / blocked). */
export const FriendsDrawer: React.FC = () => {
  const { t } = useTranslation('friends');
  const open = useFriendsStore(state => state.drawerOpen);
  const focus = useFriendsStore(state => state.drawerTab);
  const counts = useFriendsStore(state => state.counts);
  const { closeDrawer, refreshCounts } = useFriendsStore.getState();
  const [tab, setTab] = useState<FriendsTab>('accepted');
  // First open loads right away; after a tab switch the skeleton shows briefly.
  const [delayMs, setDelayMs] = useState(0);
  const [expanded, setExpanded] = useState<FriendsFilter | null>(null);
  // Search ("find people") – also nested on top of the friends drawer.
  const [searchOpen, setSearchOpen] = useState(false);
  // Profile as nested drawer on top – no routing, the friends list stays below.
  const [profileId, setProfileId] = useState<string | null>(null);
  const router = useRouter();

  // Opened with a focus → that tab (and for "sent" / "blocked" that row expanded).
  const [wasOpen, setWasOpen] = useState(false);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setTab(tabOf(focus));
      setDelayMs(0);
      setExpanded(focus === 'outgoing' || focus === 'blocked' ? focus : null);
    } else {
      setSearchOpen(false);
      setProfileId(null);
    }
  }

  // Navigated away (e.g. "Edit profile" in the nested profile) → close the friends drawer too.
  const pathname = useRouterState({ select: s => s.location.pathname });
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) closeDrawer();
  }

  // Fresh counters every time the drawer opens (the interval may be up to a minute old).
  useEffect(() => {
    if (open) void refreshCounts();
  }, [open, refreshCounts]);

  const changeTab = (next: string) => {
    if (next === tab) return;
    setDelayMs(FRIENDS_TAB_DELAY_MS);
    setTab(next as FriendsTab);
    // "Manage": open the row that has entries (sent requests first).
    if (next === 'manage' && !expanded) {
      setExpanded(counts.outgoing > 0 ? 'outgoing' : counts.blocked > 0 ? 'blocked' : null);
    }
  };

  /** Leave the friends drawer first, then run `next` (back-button history stays clean). */
  const closeThen = (next: () => void) => {
    closeDrawer();
    window.setTimeout(next, FRIENDS_LAYER_DELAY_MS);
  };
  const openProfile = (userId: string) => setProfileId(userId);
  const discover = () => setSearchOpen(true);

  /** Hits from the nested search: people → nested profile drawer, others leave the friends drawer first. */
  const selectSearchItem = (item: ISearchItem) => {
    setSearchOpen(false);
    // People: profile drawer on top of the friends drawer (search closes first).
    const userId = item.emit === 'user::show_profile' ? item.payload?.id : undefined;
    if (typeof userId === 'string') {
      window.setTimeout(() => setProfileId(userId), FRIENDS_LAYER_DELAY_MS);
      return true;
    }
    closeThen(() => executeSearchItem(item, { router }));
    return true;
  };

  const subtitle =
    counts.incoming > 0
      ? t('subtitleWithRequests', { count: counts.accepted, requests: counts.incoming })
      : t('subtitle', { count: counts.accepted });

  return (
    <AppDrawer
      open={open}
      onOpenChange={next => !next && closeDrawer()}
      title={t('title')}
      description={subtitle}
      closeLabel={t('actions.close')}
      bodyKey={tab}
      bodyClassName="px-0 pt-0"
      wrapper={children => (
        <Tabs value={tab} onValueChange={changeTab} className="flex min-h-0 flex-1 flex-col">
          {children}
        </Tabs>
      )}
      action={
        <Button variant="outline" size="sm" onClick={discover} aria-label={t('actions.discover')}>
          <Search />
          <span className="hidden min-[380px]:inline">{t('actions.discoverShort')}</span>
        </Button>
      }
      subHeader={
        <TabsList className="flex h-auto w-full rounded-none bg-transparent p-0">
          {TABS.map(value => (
            <TabsTrigger key={value} value={value} className={tabTrigger}>
              {t(`tabs.${value}`)}
              {value === 'incoming' && <CountBadge count={counts.incoming} solid />}
            </TabsTrigger>
          ))}
        </TabsList>
      }
    >
      {open && (
        <>
          <TabsContent value="accepted" className="mt-0">
            <FriendsTabPanel delayMs={delayMs} onOpenProfile={openProfile} onDiscover={discover} />
          </TabsContent>
          <TabsContent value="incoming" className="mt-0">
            <FriendsList filter="incoming" initialDelayMs={delayMs} onOpenProfile={openProfile} />
          </TabsContent>
          <TabsContent value="manage" className="mt-0">
            {(['outgoing', 'blocked'] as const).map(filter => (
              <ManageRow
                key={filter}
                filter={filter}
                count={counts[filter]}
                open={expanded === filter}
                delayMs={delayMs}
                onToggle={() => setExpanded(current => (current === filter ? null : filter))}
                onOpenProfile={openProfile}
              />
            ))}
          </TabsContent>
        </>
      )}
      {/* Nested inside the friends drawer → stack on top (base-ui nested drawers, portalled). */}
      <ProfileDrawer userId={profileId} onClose={() => setProfileId(null)} />
      <SearchDrawer
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectItem={selectSearchItem}
      />
    </AppDrawer>
  );
};
