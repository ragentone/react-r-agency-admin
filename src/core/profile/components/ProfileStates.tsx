import { Button } from '@ui/shad-cn/components/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { CloudOff, Lock, RefreshCw, UserX } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** Skeleton in the shape of the profile card. */
export const ProfileLoadingState: React.FC = () => {
  const { t } = useTranslation('profile');
  return (
    <div role="status" aria-busy="true" aria-label={t('states.loading')}>
      <Skeleton className="h-32 rounded-none sm:h-48" />
      <div className="border-b border-border/50 px-4 pb-4">
        <Skeleton className="-mt-12 mb-3 size-24 rounded-full border-4 border-background sm:-mt-16 sm:size-32" />
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="mt-2 h-4 w-24 rounded-full" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-4 h-4 w-full rounded-full" />
        <Skeleton className="mt-2 h-4 w-2/3 rounded-full" />
      </div>
    </div>
  );
};

const StateBox: React.FC<{
  icon: React.ElementType;
  title: string;
  hint?: string;
  role?: 'alert' | 'status';
  children?: React.ReactNode;
}> = ({ icon: Icon, title, hint, role = 'status', children }) => (
  <Empty role={role} className="px-8 py-16">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Icon aria-hidden="true" />
      </EmptyMedia>
      <EmptyTitle>{title}</EmptyTitle>
      {hint && <EmptyDescription>{hint}</EmptyDescription>}
    </EmptyHeader>
    {children && <EmptyContent>{children}</EmptyContent>}
  </Empty>
);

export const ProfileNotFoundState: React.FC = () => {
  const { t } = useTranslation('profile');
  return <StateBox icon={UserX} title={t('states.notFound')} hint={t('states.notFoundHint')} />;
};

export const ProfilePrivateState: React.FC = () => {
  const { t } = useTranslation('profile');
  return <StateBox icon={Lock} title={t('states.private')} hint={t('states.privateHint')} />;
};

export const ProfileErrorState: React.FC<{ error?: Error | null; onRetry?: () => void }> = ({
  error,
  onRetry,
}) => {
  const { t } = useTranslation('profile');
  return (
    <StateBox icon={CloudOff} role="alert" title={t('states.error')} hint={error?.message}>
      {onRetry && (
        <Button size="lg" onClick={onRetry}>
          <RefreshCw className="size-4" />
          {t('actions.retry')}
        </Button>
      )}
    </StateBox>
  );
};
