import { useAccount } from '@core/account/hooks';
import { CmsContainer } from '@core/cms';
import { PluginSlot } from '@core/plugin';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AuthProgressBar } from '../../auth/components/AuthProgressBar.tsx';
import { useAuth } from '../../auth/components/use.auth.ts';
import { PageScrollTopBlock } from '../../layout/components/PageScrollTopBlock.tsx';
import { AccountErrorState } from './AccountErrorState';
import { AccountLoadingState } from './AccountLoadingState';
import { AccountPageHeader } from './AccountPageHeader';
import { AccountProfileOverview } from './AccountProfileCard';
import { AccountSectionsAccordion } from './AccountSectionsAccordion';

export interface IAccountViewProps {
  /** Back arrow in the header. */
  onBack?: () => void;
  /** Scroll container of the surrounding dialog ("back to top"). */
  onScrollTop?: () => void;
}

/** Content of the account page (header, profile card, sections) – rendered by `PageAccount` (regular page). */
export const AccountView: React.FC<IAccountViewProps> = ({ onBack, onScrollTop }) => {
  const { t } = useTranslation('account');
  const { logout, isLoggingOut } = useAuth();
  const { account, loading, error, loadAccount } = useAccount(true);

  return (
    <CmsContainer
      wrapper={true}
      style={{ height: 'auto' }}
      className="relative flex min-h-full w-full flex-col bg-background"
      name="page-account"
      payload={{ account }}
    >
      <AccountPageHeader onBack={onBack} onScrollTop={onScrollTop} />

      <div className="w-full grow">
        {isLoggingOut && (
          <AuthProgressBar
            active={isLoggingOut}
            position="relative"
            className="overflow-hidden border-b border-border/50"
            message={t('messages.loggingOut', { defaultValue: 'Sie werden abgemeldet...' })}
          />
        )}

        {loading && !account && <AccountLoadingState />}

        {error && !account && <AccountErrorState error={error} onRetry={() => loadAccount()} />}

        {account && (
          <div className={'w-full relative flex flex-col'}>
            <AccountProfileOverview
              account={account}
              onAvatarUpdated={() => {
                void loadAccount();
              }}
            />
            <PluginSlot scope={'frontend'} name={'account_before.widget'} />
            <AccountSectionsAccordion
              account={account}
              onReload={() => loadAccount()}
              onLogout={() => logout()}
            />
            <PluginSlot scope={'frontend'} name={'account_after.widget'} />
          </div>
        )}
      </div>
      <PageScrollTopBlock smooth={true} onScrollTop={onScrollTop} />
    </CmsContainer>
  );
};
