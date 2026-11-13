import { PageTopBar } from '@core/layout/components/PageTopBar.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface AccountPageHeaderProps {
  className?: string;
  /** Shows a back arrow (dialog mode). */
  onBack?: () => void;
  /** Tap on the title (e.g. inside a dialog); default scrolls the page content to the top. */
  onScrollTop?: () => void;
}

/** Top bar of the account – the shared `PageTopBar` with the account texts. */
export const AccountPageHeader: React.FC<AccountPageHeaderProps> = ({
  className,
  onBack,
  onScrollTop,
}) => {
  const { t } = useTranslation('account');

  return (
    <PageTopBar
      data-slot="account-header"
      className={className}
      title={t('title')}
      subtitle={t('subtitle')}
      back={onBack}
      backLabel={t('actions.back')}
      onScrollTop={onScrollTop}
      safeArea={!onBack}
    />
  );
};
