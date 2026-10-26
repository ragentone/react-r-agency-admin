import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface AccountLoadingStateProps {
  message?: string;
}

/** Skeleton in the exact shape of the profile header and the flat settings list (no layout shift). */
export const AccountLoadingState: React.FC<AccountLoadingStateProps> = ({ message }) => {
  const { t } = useTranslation('account');

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={
        message ?? t('messages.loading', { defaultValue: 'Kontodaten werden geladen...' })
      }
    >
      <Skeleton className="h-32 rounded-none sm:h-48" />
      <div className="px-4 pb-4">
        <div className="-mt-12 mb-3 flex items-end justify-between sm:-mt-16">
          <Skeleton className="size-24 rounded-full border-4 border-background sm:size-32" />
          <Skeleton className="mb-1 h-9 w-36 rounded-full" />
        </div>
        <Skeleton className="h-6 w-48 rounded-full" />
        <Skeleton className="mt-1.5 h-4 w-24 rounded-full" />
      </div>
      <div className="border-t border-border/50 pt-1">
        <Skeleton className="mx-4 mt-4 mb-2 h-5 w-32 rounded-full" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex min-h-15 items-center gap-4 border-b border-border/50 px-4 py-3"
          >
            <Skeleton className="size-5 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-36 rounded-full" />
              <Skeleton className="h-3 w-56 max-w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
