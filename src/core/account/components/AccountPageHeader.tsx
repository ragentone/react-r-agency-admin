import { cn } from '@ui/lib/utils';
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
        'sticky top-0 z-20 border-b border-border/50 bg-background/85 backdrop-blur-md',
        className
      )}
    >
      <div className="flex min-h-[53px] items-center gap-6 px-2 py-4 sm:px-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={t('actions.back')}
            className="grid size-9 shrink-0 place-items-center rounded-full text-foreground outline-none transition-colors hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl leading-6 font-bold tracking-tight text-foreground">
            {t('title')}
          </h1>
          <p className="truncate text-caption leading-4 text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>
    </header>
  );
};
