import { CloudOff, RefreshCw } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface AccountErrorStateProps {
  error: Error | { message?: string };
  onRetry?: () => void;
}

export const AccountErrorState: React.FC<AccountErrorStateProps> = ({ error, onRetry }) => {
  const { t } = useTranslation('account');

  return (
    <div role="alert" className="flex flex-col items-center px-8 py-20 text-center">
      <span className="mb-5 grid size-16 place-items-center rounded-2xl bg-foreground/[0.05]">
        <CloudOff className="size-7 text-foreground" strokeWidth={1.75} />
      </span>
      <h2 className="text-title font-bold text-foreground">{t('messages.loadError')}</h2>
      {error.message && (
        <p className="mt-1.5 max-w-xs text-body text-pretty text-muted-foreground">
          {error.message}
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-body font-bold text-background transition-opacity hover:opacity-90 active:opacity-80"
        >
          <RefreshCw className="size-4" />
          {t('actions.retry', { defaultValue: 'Erneut versuchen' })}
        </button>
      )}
    </div>
  );
};
