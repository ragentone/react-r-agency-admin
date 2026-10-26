import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CreditsPageHeader, CreditsTabs } from '../components/CreditsUi.tsx';
import { CreditsAdminOverview } from './CreditsAdminOverview.tsx';
import { CreditsAdminSettings } from './CreditsAdminSettings.tsx';
import { CreditsAdminVouchers } from './CreditsAdminVouchers.tsx';

type Tab = 'overview' | 'vouchers' | 'settings';
const TABS: Tab[] = ['overview', 'vouchers', 'settings'];

/** `/admin/credits`: bank, vouchers and settings – no insight into single users. */
export const CreditsAdminView: React.FC = () => {
  const { t } = useTranslation('credits');
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <div data-slot="credits-admin" className="mx-auto flex min-h-dvh w-full flex-col bg-background">
      <CreditsPageHeader title={t('admin.title')} subtitle={t('admin.subtitle')}>
        <CreditsTabs
          tabs={TABS}
          value={tab}
          onChange={setTab}
          labelOf={item => t(`admin.tabs.${item}`)}
          label={t('admin.title')}
          idPrefix="credits-admin-tab"
          panelId="credits-admin-panel"
        />
      </CreditsPageHeader>
      <div
        id="credits-admin-panel"
        role="tabpanel"
        aria-labelledby={`credits-admin-tab-${tab}`}
        className="flex-1 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        {tab === 'overview' && <CreditsAdminOverview />}
        {tab === 'vouchers' && <CreditsAdminVouchers />}
        {tab === 'settings' && <CreditsAdminSettings />}
      </div>
    </div>
  );
};
