import { AccountProfileForm } from '@core/account/components/forms';
import type { IUserAccount } from '@core/account/types';
import { UserRound } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AccountSection } from '../AccountSection';

export interface AccountProfileAccordionItemProps {
  account: IUserAccount;
  onReload: () => void;
  value?: string;
  className?: string;
}

export const AccountProfileAccordionItem: React.FC<AccountProfileAccordionItemProps> = ({
  account,
  onReload,
  value = 'profile',
  className,
}) => {
  const { t } = useTranslation('account');

  return (
    <AccountSection
      value={value}
      icon={UserRound}
      title={t('tabs.profile')}
      description={t('tabs.profileDesc', {
        defaultValue: 'Persönliche Informationen und Stammdaten',
      })}
      className={className}
    >
      <AccountProfileForm account={account} onSuccess={onReload} />
    </AccountSection>
  );
};
