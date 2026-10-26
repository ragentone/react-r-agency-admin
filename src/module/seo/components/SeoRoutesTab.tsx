import { useRouter } from '@tanstack/react-router';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Separator } from '@ui/shad-cn/components/separator.tsx';
import { FileSearch, Plus, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ISeoRoute } from '../types';
import type { SeoAdmin } from '../use.seo.admin';
import { SeoRouteDrawer } from './SeoRouteDrawer';
import { SeoRouteItem } from './SeoRouteItem';

/** Never offered as suggestion (admin, sign-in, codes …). */
const HIDDEN = /^\/(admin|auth|login|logout|user|accept|reject|dev)(\/|$)/;

/** Static routes of the app without an entry yet (no `$params`). */
const useSuggestions = (routes: ISeoRoute[]) => {
  const router = useRouter();
  return useMemo(() => {
    const taken = new Set(routes.map(route => route.path));
    const paths = Object.keys(router.routesByPath ?? {})
      .map(path => (path.length > 1 ? path.replace(/\/$/, '') : path))
      .filter(path => path.startsWith('/') && !path.includes('$') && !HIDDEN.test(path));
    return [...new Set(paths)]
      .filter(path => !taken.has(path))
      .sort()
      .slice(0, 12);
  }, [router, routes]);
};

/** Tab "Seiten": meta data per path – list, search, "+" creates an entry. */
export const SeoRoutesTab: React.FC<{ admin: SeoAdmin }> = ({ admin }) => {
  const { t } = useTranslation('seo');
  const routes = useMemo(() => admin.data?.routes ?? [], [admin.data?.routes]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ISeoRoute | null>(null);
  const [initialPath, setInitialPath] = useState<string | undefined>();
  // New form state per opening (the drawer keeps no state between two entries).
  const [session, setSession] = useState(0);
  const suggestions = useSuggestions(routes);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return routes;
    return routes.filter(route =>
      [route.path, route.title, route.description].some(value => value.toLowerCase().includes(term))
    );
  }, [routes, query]);

  const openCreate = (path?: string) => {
    setEditing(null);
    setInitialPath(path);
    setSession(value => value + 1);
    setOpen(true);
  };
  const openEdit = (route: ISeoRoute) => {
    setEditing(route);
    setInitialPath(undefined);
    setSession(value => value + 1);
    setOpen(true);
  };

  const takenPaths = routes.filter(route => route.id !== editing?.id).map(route => route.path);

  return (
    <>
      <div className="space-y-3 px-4 py-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('routes.search')}
            aria-label={t('routes.search')}
            className="h-11 rounded-full border-transparent bg-foreground/[0.06] pl-10 text-base focus-visible:border-foreground focus-visible:bg-background sm:text-body"
          />
        </div>
        <Button size="lg" pill fullWidth className="font-bold" onClick={() => openCreate()}>
          <Plus aria-hidden="true" />
          {t('routes.create')}
        </Button>
      </div>
      <Separator className="bg-border/50" />

      {routes.length === 0 ? (
        <Empty className="py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileSearch aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>{t('routes.emptyTitle')}</EmptyTitle>
            <EmptyDescription>{t('routes.empty')}</EmptyDescription>
          </EmptyHeader>
          {suggestions.length > 0 && (
            <EmptyContent>
              <p className="text-caption text-muted-foreground">{t('routes.quickStart')}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.slice(0, 6).map(path => (
                  <Button
                    key={path}
                    variant="outline"
                    size="sm"
                    className="rounded-full font-mono"
                    onClick={() => openCreate(path)}
                  >
                    {path}
                  </Button>
                ))}
              </div>
            </EmptyContent>
          )}
        </Empty>
      ) : visible.length === 0 ? (
        <p className="px-8 py-14 text-center text-body text-muted-foreground">
          {t('routes.noResults')}
        </p>
      ) : (
        <ul className="divide-y divide-border/50" aria-label={t('routes.listLabel')}>
          {visible.map(route => (
            <SeoRouteItem key={route.id} route={route} onOpen={openEdit} />
          ))}
        </ul>
      )}

      <p className="px-4 pt-4 text-caption text-muted-foreground">{t('routes.order')}</p>

      <SeoRouteDrawer
        key={session}
        open={open}
        onOpenChange={setOpen}
        route={editing}
        initialPath={initialPath}
        takenPaths={takenPaths}
        suggestions={suggestions}
        settings={admin.data?.settings ?? null}
        saving={admin.saving}
        onSave={admin.saveRoute}
        onDelete={admin.deleteRoute}
      />
    </>
  );
};
