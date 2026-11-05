import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IAdminDoc } from '../types';

export interface IAdminDocsListProps {
  docs: IAdminDoc[];
  loading: boolean;
  error: boolean;
  onOpen: (slug: string) => void;
  onRetry: () => void;
}

/** One row per doc (title + file name); loading, error and empty states. */
export const AdminDocsList: React.FC<IAdminDocsListProps> = ({
  docs,
  loading,
  error,
  onOpen,
  onRetry,
}) => {
  const { t } = useTranslation('admin');

  if (loading && docs.length === 0) {
    return (
      <div className="flex flex-col gap-2 px-4">
        {[0, 1, 2].map(index => (
          <Skeleton key={index} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 px-4 py-6">
        <p className="text-body text-muted-foreground">{t('docs.error')}</p>
        <Button variant="outline" onClick={onRetry}>
          {t('retry')}
        </Button>
      </div>
    );
  }
  if (docs.length === 0) {
    return <p className="px-4 py-6 text-body text-muted-foreground">{t('docs.empty')}</p>;
  }

  return (
    <ul className="divide-y divide-border/50 border-y border-border/50">
      {docs.map(doc => (
        <li key={doc.slug}>
          <Button
            variant="ghost"
            className="h-auto w-full justify-start gap-3 rounded-none px-4 py-3 text-left"
            onClick={() => onOpen(doc.slug)}
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body font-bold text-foreground">{doc.title}</span>
              <span className="block truncate text-caption text-muted-foreground">
                {doc.slug}.md
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
          </Button>
        </li>
      ))}
    </ul>
  );
};
