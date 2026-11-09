import { Button } from '@ui/shad-cn/components/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty';
import { CloudOff, RefreshCw } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface AccountErrorStateProps {
  error: Error | { message?: string };
  onRetry?: () => void;
}

/** The account could not be loaded: short explanation and one action (retry). */
export const AccountErrorState: React.FC<AccountErrorStateProps> = ({ error, onRetry }) => {
  const { t } = useTranslation('account');

  return (
    <Empty role="alert" className="px-8 py-20">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CloudOff />
        </EmptyMedia>
        <EmptyTitle>{t('messages.loadError')}</EmptyTitle>
        {error.message && <EmptyDescription>{error.message}</EmptyDescription>}
      </EmptyHeader>
      {onRetry && (
        <EmptyContent>
          <Button size="lg" onClick={onRetry}>
            <RefreshCw className="size-4" />
            {t('actions.retry', { defaultValue: 'Erneut versuchen' })}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
};
