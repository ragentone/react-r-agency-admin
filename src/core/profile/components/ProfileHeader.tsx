import { CoreVariables } from '@core/core.variables.ts';
import { useRouter } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { ArrowLeft, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface IProfileHeaderProps {
  /** Name in the bar – falls back to "Profile" while loading. */
  title?: string | null;
  subtitle?: React.ReactNode;
  /** Back arrow – e.g. closes the profile dialog. Default: browser back / home. */
  onBack?: () => void;
  /** `drawer`: close (✕) on the right instead of the back arrow, no safe-area inset. */
  variant?: 'page' | 'drawer';
  /** Buttons on the right (before ✕ in the drawer), e.g. call buttons. */
  actions?: React.ReactNode;
  className?: string;
}

/** Sticky, blurred X-style top bar with a back button (same as the account header). */
export const ProfileHeader: React.FC<IProfileHeaderProps> = ({
  title,
  subtitle,
  onBack,
  variant = 'page',
  actions,
  className,
}) => {
  const drawer = variant === 'drawer';
  const { t } = useTranslation('profile');
  const router = useRouter();

  const back = () => {
    if (onBack) return onBack();
    if (window.history.length > 1) router.history.back();
    else void router.navigate({ to: CoreVariables.routePathHome });
  };

  return (
    <header
      data-slot="profile-header"
      className={cn(
        'sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur',
        !drawer && 'pt-[env(safe-area-inset-top)]',
        className
      )}
    >
      <div className={cn('flex h-14 items-center gap-3 px-2', drawer && 'pl-4')}>
        {!drawer && (
          <Button variant="ghost" size="icon-lg" onClick={back} aria-label={t('back')}>
            <ArrowLeft className="size-5" />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-title font-bold text-foreground">{title || t('title')}</h1>
          {subtitle && <p className="truncate text-caption text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
        {/* Drawer: close (✕) on the right like all drawers. */}
        {drawer && (
          <Button variant="ghost" size="icon-lg" onClick={back} aria-label={t('close')}>
            <X className="size-5" />
          </Button>
        )}
      </div>
    </header>
  );
};
