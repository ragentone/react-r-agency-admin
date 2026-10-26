import { useAccount } from '@core/account/hooks';
import { CmsContainer } from '@core/cms';
import React, { useState } from 'react';
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
  const [openSections, setOpenSections] = useState<string[]>([]);

  return (
    <CmsContainer
      wrapper={true}
      style={{ height: 'auto' }}
      className="relative flex min-h-full w-full flex-col bg-background"
      name="page-account"
      payload={{ account }}
    >
      <AccountPageHeader onBack={onBack} />

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
          <div>
            <AccountProfileOverview
              account={account}
              onAvatarUpdated={() => {
                void loadAccount();
              }}
            />

            <AccountSectionsAccordion
              account={account}
              openSections={openSections}
              onOpenSectionsChange={setOpenSections}
              onReload={() => loadAccount()}
              onLogout={() => logout()}
            />
          </div>
        )}
      </div>
      <PageScrollTopBlock smooth={true} onScrollTop={onScrollTop} />
    </CmsContainer>
  );
};
