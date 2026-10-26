import { AccountPrivacyForm } from '@core/account/components/forms';
import type { IUserAccount } from '@core/account/types';
import { ShieldCheck } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AccountSection } from '../AccountSection';

export interface AccountPrivacyAccordionItemProps {
  account: IUserAccount;
  onReload: () => void;
  value?: string;
  className?: string;
}

export const AccountPrivacyAccordionItem: React.FC<AccountPrivacyAccordionItemProps> = ({
  account,
  onReload,
  value = 'privacy',
  className,
}) => {
  const { t } = useTranslation('account');

  return (
    <AccountSection
      value={value}
      icon={ShieldCheck}
      title={t('tabs.privacy')}
      description={t('tabs.privacyDesc', {
        defaultValue: 'Sichtbarkeit im Netzwerk und Profil-Datenschutz',
      })}
      className={className}
    >
      <AccountPrivacyForm account={account} onSuccess={onReload} />
    </AccountSection>
  );
};
