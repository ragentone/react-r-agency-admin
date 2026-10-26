import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Lock, RefreshCw, UserX } from 'lucide-react';
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
  <div role={role} className="flex flex-col items-center px-8 py-16 text-center">
    <span className="mb-4 grid size-14 place-items-center rounded-full border border-border/50 text-foreground">
      <Icon className="size-6" aria-hidden="true" />
    </span>
    <h2 className="text-xl leading-6 font-extrabold tracking-tight text-foreground">{title}</h2>
    {hint && <p className="mt-1.5 max-w-xs text-body leading-5 text-muted-foreground">{hint}</p>}
    {children && <div className="mt-6">{children}</div>}
  </div>
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
    <StateBox icon={RefreshCw} role="alert" title={t('states.error')} hint={error?.message}>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-bold text-background transition-opacity hover:opacity-85 active:opacity-75"
        >
          <RefreshCw className="size-3.5" />
          {t('actions.retry')}
        </button>
      )}
    </StateBox>
  );
};
