import { Delayed } from '@ui/patterns/loading';
import { Button } from '@ui/shad-cn/components/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty';
import { Skeleton } from '@ui/shad-cn/components/skeleton';
import { CloudOff, Search, SearchX } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import { SEARCH_MIN_LENGTH } from '../const';

interface IStateProps {
  icon: React.ReactNode;
  title: string;
  text: string;
  action?: React.ReactNode;
  alert?: boolean;
}

const SearchState: React.FC<IStateProps> = ({ icon, title, text, action, alert }) => (
  <Empty role={alert ? 'alert' : undefined} className="gap-4 px-8 py-12 md:py-16">
    <EmptyHeader>
      <EmptyMedia variant="icon" className="size-12 rounded-full">
        {icon}
      </EmptyMedia>
      <EmptyTitle className="text-title font-bold">{title}</EmptyTitle>
      <EmptyDescription className="text-body">{text}</EmptyDescription>
    </EmptyHeader>
    {action && <EmptyContent>{action}</EmptyContent>}
  </Empty>
);

/** Nothing typed yet (and no recent terms) – or too few characters. */
export const SearchIdle: React.FC<{ typing: boolean }> = ({ typing }) => {
  const { t } = useTranslation('search');
  return (
    <SearchState
      icon={<Search />}
      title={t('idleTitle')}
      text={typing ? t('hint', { count: SEARCH_MIN_LENGTH }) : t('idleText')}
    />
  );
};

export const SearchEmpty: React.FC<{
  term: string;
  /** Not all search areas are selected → offer to search everywhere. */
  onWiden?: () => void;
  onClear: () => void;
}> = ({ term, onWiden, onClear }) => {
  const { t } = useTranslation('search');
  return (
    <SearchState
      icon={<SearchX />}
      title={t('emptyTitle', { term })}
      text={t('emptyText')}
      action={
        onWiden ? (
          <Button onClick={onWiden}>{t('searchEverywhere')}</Button>
        ) : (
          <Button variant="outline" onClick={onClear}>
            {t('newSearch')}
          </Button>
        )
      }
    />
  );
};

export const SearchError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const { t } = useTranslation('search');
  return (
    <SearchState
      alert
      icon={<CloudOff />}
      title={t('errorTitle')}
      text={t('error')}
      action={<Button onClick={onRetry}>{t('retry')}</Button>}
    />
  );
};

/** Rows in the shape of real hits; shown only if loading takes a moment. */
export const SearchSkeleton: React.FC = () => {
  const { t } = useTranslation('search');
  return (
    <Delayed delay={150} label={t('loading')}>
      <Skeleton className="mx-4 mt-4 mb-2 h-4 w-24 rounded-full" />
      <ul aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="flex min-h-16 items-center gap-3 px-4 py-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton
                className="h-3.5 rounded-full"
                style={{ width: `${40 + ((i * 17) % 35)}%` }}
              />
              <Skeleton className="h-3 w-1/3 rounded-full" />
            </div>
          </li>
        ))}
      </ul>
    </Delayed>
  );
};
