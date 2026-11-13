import { useNavigate } from '@tanstack/react-router';
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

import { ADMIN_SEO_NEW_ROUTE } from '../const';
import { setPendingSeoPath } from '../seo.draft';
import type { SeoAdmin } from '../use.seo.admin';
import { useSeoSuggestions } from '../use.seo.suggestions';
import { SeoRouteItem } from './SeoRouteItem';

/** Tab "Seiten": meta data per path – list, search, "+" creates an entry. */
export const SeoRoutesTab: React.FC<{ admin: SeoAdmin }> = ({ admin }) => {
  const { t } = useTranslation('seo');
  const routes = useMemo(() => admin.data?.routes ?? [], [admin.data?.routes]);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const suggestions = useSeoSuggestions(routes);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return routes;
    return routes.filter(route =>
      [route.path, route.title, route.description].some(value => value.toLowerCase().includes(term))
    );
  }, [routes, query]);

  const openCreate = (path?: string) => {
    setPendingSeoPath(path);
    void navigate({ to: ADMIN_SEO_NEW_ROUTE });
  };

  return (
    <>
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row">
        <div className="relative sm:flex-1">
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
            className="h-10 rounded-lg pl-10 text-base sm:text-body"
          />
        </div>
        <Button
          size="lg"
          fullWidth
          className="font-semibold sm:w-auto"
          onClick={() => openCreate()}
        >
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
            <SeoRouteItem key={route.id} route={route} />
          ))}
        </ul>
      )}

      <p className="px-4 pt-4 text-caption text-muted-foreground">{t('routes.order')}</p>
    </>
  );
};
