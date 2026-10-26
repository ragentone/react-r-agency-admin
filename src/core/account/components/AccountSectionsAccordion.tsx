import {
  AccountDeleteAccordionItem,
  AccountIdentifiersAccordionItem,
  AccountPrivacyAccordionItem,
  AccountProfileAccordionItem,
  AccountRolesAccordionItem,
} from '@core/account/components/accordion';
import type { IUserAccount } from '@core/account/types';
import { CmsContainer } from '@core/cms';
import { SecuritySection } from '@core/security/components/SecuritySection.tsx';
import { Accordion } from '@ui/shad-cn/components/accordion';
import { LogOut } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../auth/components/use.auth.ts';

export interface AccountSectionsAccordionProps {
  account: IUserAccount;
  openSections: string[];
  onOpenSectionsChange: (sections: string[]) => void;
  onReload: () => void;
  onLogout: () => void;
}

/** X-style section heading (same as the profile's "About" headings). */
const GroupLabel: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <h2
    id={id}
    className="px-4 pt-4 pb-1 text-title leading-6 font-extrabold tracking-tight text-foreground"
  >
    {children}
  </h2>
);

/** Settings: flat, full-width X-style lists (account · session · danger zone). */
export const AccountSectionsAccordion: React.FC<AccountSectionsAccordionProps> = ({
  account,
  openSections,
  onOpenSectionsChange,
  onReload,
  onLogout,
}) => {
  const { t } = useTranslation('account');
  const { preLogout, isLoggingOut } = useAuth();

  return (
    <Accordion
      value={openSections}
      onValueChange={onOpenSectionsChange}
      className="flex w-full flex-col border-t border-border/50 pt-1 pb-6"
    >
      <section aria-labelledby="account-group-settings">
        <GroupLabel id="account-group-settings">
          {t('settings', { defaultValue: 'Einstellungen' })}
        </GroupLabel>
        <CmsContainer name={'user-account-accordion'}>
          <AccountProfileAccordionItem account={account} onReload={onReload} />
          <AccountPrivacyAccordionItem account={account} onReload={onReload} />
          <AccountRolesAccordionItem />
          <AccountIdentifiersAccordionItem userId={account.id} />
        </CmsContainer>
      </section>

      <SecuritySection onEmailChanged={onReload} />

      <section aria-labelledby="account-group-session">
        <GroupLabel id="account-group-session">
          {t('groups.session', { defaultValue: 'Sitzung' })}
        </GroupLabel>
        <button
          type="button"
          onClick={() => preLogout()}
          disabled={isLoggingOut}
          className="group flex min-h-15 w-full items-center gap-4 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.05] focus-visible:outline-none active:bg-foreground/[0.06] disabled:opacity-50"
        >
          <LogOut
            aria-hidden="true"
            className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            strokeWidth={1.75}
          />
          <span className="min-w-0 flex-1">
            <span className="block text-body leading-5 text-foreground">{t('actions.logout')}</span>
            <span className="mt-0.5 block truncate text-caption leading-4 text-muted-foreground">
              {t('groups.sessionDesc', {
                alias: account.alias,
                defaultValue: `Angemeldet als @${account.alias}`,
              })}
            </span>
          </span>
        </button>
      </section>

      <section aria-labelledby="account-group-danger">
        <GroupLabel id="account-group-danger">
          {t('groups.danger', { defaultValue: 'Gefahrenzone' })}
        </GroupLabel>
        <AccountDeleteAccordionItem onLogout={onLogout} />
      </section>
    </Accordion>
  );
};
