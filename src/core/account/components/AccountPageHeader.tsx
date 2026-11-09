import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface AccountPageHeaderProps {
  className?: string;
  /** Shows a back arrow (dialog mode). */
  onBack?: () => void;
}

/** Sticky, blurred X-style top bar of the account (same as the profile header). */
export const AccountPageHeader: React.FC<AccountPageHeaderProps> = ({ className, onBack }) => {
  const { t } = useTranslation('account');

  return (
    <header
      data-slot="account-header"
      className={cn(
        'sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 px-2 backdrop-blur',
        !onBack && 'px-4',
        className
      )}
    >
      {onBack && (
        <Button variant="ghost" size="icon-lg" onClick={onBack} aria-label={t('actions.back')}>
          <ArrowLeft className="size-5" />
        </Button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-title font-bold text-foreground">{t('title')}</h1>
        <p className="truncate text-caption text-muted-foreground">{t('subtitle')}</p>
      </div>
    </header>
  );
};
