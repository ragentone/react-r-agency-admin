import { CoreVariables } from '@core/core.variables.ts';
import { useRouter } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
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

/** Sticky, blurred X-style top bar with a back button. */
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
        'sticky top-0 z-20 border-b border-border/50 bg-background backdrop-blur-md',
        !drawer && 'pt-[env(safe-area-inset-top)]',
        className
      )}
    >
      <div
        className={cn(
          'flex min-h-13.25 items-center px-2 py-4 sm:px-3',
          drawer ? 'gap-3' : 'gap-6'
        )}
      >
        {!drawer && (
          <button
            type="button"
            onClick={back}
            aria-label={t('back')}
            className="grid size-9 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-foreground/10"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}
        <div className={cn('min-w-0', drawer && 'flex-1 pl-2')}>
          <h1 className="truncate text-xl leading-6 font-bold tracking-tight text-foreground">
            {title || t('title')}
          </h1>
          {subtitle && (
            <p className="truncate text-caption leading-4 text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
        {/* Drawer: close (✕) on the right like all drawers. */}
        {drawer && (
          <button
            type="button"
            onClick={back}
            aria-label={t('close')}
            className="grid size-9 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-foreground/10"
          >
            <X className="size-5" />
          </button>
        )}
      </div>
    </header>
  );
};
