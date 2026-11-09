import { useSecurityStore } from '@core/security/store.ts';
import { Button } from '@ui/shad-cn/components/button';
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
        <p className="text-body text-muted-foreground">{ts('delete.itemText', { days: 30 })}</p>

        {/* Whole row is the label: tapping anywhere ticks the checkbox (min. 44 px). */}
        <label
          htmlFor="account-delete-confirm"
          className="-mx-4 flex min-h-12 cursor-pointer items-center gap-3 border-y border-border/50 px-4 py-3 transition-colors select-none hover:bg-accent/50"
        >
          <Checkbox
            id="account-delete-confirm"
            checked={isConfirmed}
            onCheckedChange={checked => setIsConfirmed(checked === true)}
          />
          <span className="text-body font-medium text-foreground">
            {t('delete.confirm', { defaultValue: 'I understand the consequences' })}
          </span>
        </label>

        <Button
          variant="destructive"
          size="lg"
          disabled={!isConfirmed}
          onClick={() => useSecurityStore.getState().openDrawer('delete')}
          className="w-full sm:w-auto"
        >
          <Trash2 className="size-4" />
          {t('delete.title', { defaultValue: 'Delete Account' })}
        </Button>
      </div>
    </AccountSection>
  );
};
