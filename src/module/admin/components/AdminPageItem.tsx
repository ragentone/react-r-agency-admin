import { cn } from '@ui/lib/utils';
import { ChevronRight, EyeOff, FileText, Lock } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { sitePagePath } from '../const';
import type { ISitePage } from '../types';
import { formatDate } from '../utils';

/** Status chip: published (green) / draft. */
export const SitePageStatus: React.FC<{ published: boolean; className?: string }> = ({
  published,
  className,
}) => {
  const { t } = useTranslation('admin');
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center gap-1 rounded-full px-2 text-[11px] font-semibold',
        published
          ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400'
          : 'bg-foreground/[0.07] text-muted-foreground',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-1.5 rounded-full', published ? 'bg-emerald-500' : 'bg-current')}
      />
      {published ? t('pages.status.published') : t('pages.status.draft')}
    </span>
  );
};

/** Row of the page list – tap opens the editor. */
export const AdminPageItem: React.FC<{ page: ISitePage; onOpen: (page: ISitePage) => void }> = ({
  page,
  onOpen,
}) => {
  const { t, i18n } = useTranslation('admin');
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(page)}
        aria-label={t('pages.open', { title: page.title })}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03] active:bg-foreground/[0.06]"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-foreground/[0.07]">
          <FileText className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body font-bold text-foreground">{page.title}</span>
          <span className="block truncate text-caption text-muted-foreground">
            {sitePagePath(page.slug)}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <SitePageStatus published={page.published} />
            {page.visibility === 'authenticated' && (
              <span className="inline-flex h-5 items-center gap-1 rounded-full bg-foreground/[0.07] px-2 text-[11px] font-semibold text-muted-foreground">
                <Lock className="size-3" aria-hidden="true" />
                {page.roles?.length
                  ? t('pages.access.badgeRoles', { count: page.roles.length })
                  : t('pages.access.badge')}
              </span>
            )}
            {page.seoIndex === false && page.visibility !== 'authenticated' && (
              <span className="inline-flex h-5 items-center gap-1 rounded-full bg-foreground/[0.07] px-2 text-[11px] font-semibold text-muted-foreground">
                <EyeOff className="size-3" aria-hidden="true" />
                {t('pages.noindexBadge')}
              </span>
            )}
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {t('pages.updated', { date: formatDate(page.updatedAt, i18n.language) })}
            </span>
          </span>
        </span>
        <ChevronRight className="mt-3 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
    </li>
  );
};
