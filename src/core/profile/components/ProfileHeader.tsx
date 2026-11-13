import { PageTopBar } from '@core/layout/components/PageTopBar.tsx';
import { AppHeader } from '@ui/components/AppHeader';
import { Button } from '@ui/shad-cn/components/button';
import { X } from 'lucide-react';
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

/** Top bar of a profile: shared `PageTopBar` on the page, `AppHeader` with ✕ in the drawer. */
export const ProfileHeader: React.FC<IProfileHeaderProps> = ({
  title,
  subtitle,
  onBack,
  variant = 'page',
  actions,
  className,
}) => {
  const { t } = useTranslation('profile');
  const shared = {
    'data-slot': 'profile-header',
    className,
    title: title || null,
    subtitle,
  };

  if (variant === 'page') {
    return <PageTopBar {...shared} actions={actions} back={onBack ?? true} backLabel={t('back')} />;
  }

  return (
    <AppHeader
      {...shared}
      safeArea={false}
      actions={
        <>
          {actions}
          {/* Drawer: close (✕) on the right like all drawers. */}
          <Button variant="ghost" size="icon-lg" onClick={onBack} aria-label={t('close')}>
            <X className="size-5" />
          </Button>
        </>
      }
    />
  );
};
