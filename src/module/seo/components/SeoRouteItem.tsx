import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { ChevronRight, EyeOff, FileSearch, FolderTree } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ISeoRoute } from '../types';

/** Row of the path list – tap opens the editor. */
export const SeoRouteItem: React.FC<{ route: ISeoRoute; onOpen: (route: ISeoRoute) => void }> = ({
  route,
  onOpen,
}) => {
  const { t } = useTranslation('seo');
  const prefix = route.path.endsWith('/*');
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(route)}
        aria-label={t('routes.open', { path: route.path })}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.05] focus-visible:outline-none active:bg-foreground/[0.06]"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-foreground/[0.07]">
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
      </button>
    </li>
  );
};
