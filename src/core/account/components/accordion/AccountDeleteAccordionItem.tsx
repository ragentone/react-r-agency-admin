import { useSecurityStore } from '@core/security/store.ts';
import { Checkbox } from '@ui/shad-cn/components/checkbox.tsx';
import { Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AccountSection } from '../AccountSection';

export interface AccountDeleteAccordionItemProps {
  onLogout: () => void;
  value?: string;
  className?: string;
}

export const AccountDeleteAccordionItem: React.FC<AccountDeleteAccordionItemProps> = ({
  value = 'delete',
  className,
}) => {
  const { t } = useTranslation('account');
  const { t: ts } = useTranslation('security');
  const [isConfirmed, setIsConfirmed] = React.useState(false);

  return (
    <AccountSection
      value={value}
      icon={Trash2}
      title={t('tabs.delete')}
      description={t('tabs.deleteDesc')}
      destructive
      className={className}
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-body font-bold text-foreground">
            {t('delete.title', { defaultValue: 'Delete Account' })}
          </h3>
          <p className="mt-1 text-body leading-5 text-muted-foreground">
            {ts('delete.itemText', { days: 30 })}
          </p>
        </div>

        <label
          htmlFor="account-delete-confirm"
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/50 p-3 select-none"
        >
          <Checkbox
            id="account-delete-confirm"
            checked={isConfirmed}
            onCheckedChange={checked => setIsConfirmed(checked === true)}
            className="mt-0.5"
          />
          <span className="text-body leading-5 font-medium text-foreground">
            {t('delete.confirm', { defaultValue: 'I understand the consequences' })}
          </span>
        </label>

        <button
          type="button"
          disabled={!isConfirmed}
          onClick={() => useSecurityStore.getState().openDrawer('delete')}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-destructive px-5 text-body font-bold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          <Trash2 className="size-4" />
          {t('delete.title', { defaultValue: 'Delete Account' })}
        </button>
      </div>
    </AccountSection>
  );
};
