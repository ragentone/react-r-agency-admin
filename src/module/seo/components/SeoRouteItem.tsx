import { Link } from '@tanstack/react-router';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { ChevronRight, EyeOff, FileSearch, FolderTree } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { seoRoutePath } from '../const';
import type { ISeoRoute } from '../types';

/** Row of the path list – the whole row links to the edit page. */
export const SeoRouteItem: React.FC<{ route: ISeoRoute }> = ({ route }) => {
  const { t } = useTranslation('seo');
  const prefix = route.path.endsWith('/*');
  return (
    <li>
      <Link
        to={seoRoutePath(route.id)}
        aria-label={t('routes.open', { path: route.path })}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted focus-visible:outline-none active:bg-muted"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted">
          {prefix ? (
            <FolderTree className="size-5" aria-hidden="true" />
          ) : (
            <FileSearch className="size-5" aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-body font-bold text-foreground">
            {route.path}
          </span>
          <span className="block truncate text-caption text-foreground">
            {route.title || <span className="text-muted-foreground">{t('routes.noTitle')}</span>}
          </span>
          <span className="block truncate text-caption text-muted-foreground">
            {route.description || t('routes.noDescription')}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {!route.index ? (
              <Badge variant="default" className="gap-1 rounded-full">
                <EyeOff className="size-3" aria-hidden="true" />
                {t('routes.badge.noindex')}
              </Badge>
            ) : (
              <Badge variant="outline" className="rounded-full">
                {t('routes.badge.index')}
              </Badge>
            )}
            {prefix && (
              <Badge variant="secondary" className="rounded-full">
                {t('routes.badge.prefix')}
              </Badge>
            )}
            {route.index && route.inSitemap && !prefix && (
              <Badge variant="secondary" className="rounded-full tabular-nums">
                {t('routes.badge.sitemap', { priority: route.priority.toFixed(1) })}
              </Badge>
            )}
            {route.schemaType !== 'none' && (
              <Badge variant="secondary" className="rounded-full">
                {route.schemaType}
              </Badge>
            )}
          </span>
        </span>
        <ChevronRight className="mt-3 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>
    </li>
  );
};
