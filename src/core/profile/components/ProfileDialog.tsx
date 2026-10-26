import { FullscreenPage } from '@ui/base/FullscreenPage.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ProfileView } from './ProfileView';

export interface IProfileDialogProps {
  userId: string | null;
  /** Back arrow, Escape, browser back – the caller restores the URL. */
  onClose: () => void;
}

/**
 * Profile as full screen page (all sizes) – same frame as the timeline entry detail:
 * 600px column, the page below stays mounted (scroll position kept).
 */
export const ProfileDialog: React.FC<IProfileDialogProps> = ({ userId, onClose }) => {
  const { t } = useTranslation('profile');

  return (
    <FullscreenPage
      open={Boolean(userId)}
      onClose={onClose}
      title={t('title')}
      slot="profile-dialog"
      contentClassName="overflow-y-auto overscroll-contain pb-[max(2rem,env(safe-area-inset-bottom))]"
    >
      {userId && <ProfileView key={userId} userId={userId} onBack={onClose} />}
    </FullscreenPage>
  );
};
