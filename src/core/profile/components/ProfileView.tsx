import { CmsContainer } from '@core/cms';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { PROFILE_CMS_CONTAINER } from '../const';
import { useProfile } from '../hooks/use.profile';
import { ProfileCallButtons } from './ProfileCallButtons';
import { ProfileCard } from './ProfileCard';
import { ProfileHeader } from './ProfileHeader';
import { ProfileInfo } from './ProfileInfo';
import {
  ProfileErrorState,
  ProfileLoadingState,
  ProfileNotFoundState,
  ProfilePrivateState,
} from './ProfileStates';

export interface IProfileViewProps {
  userId: string;
  /** Back arrow in the header. */
  onBack?: () => void;
  /** `drawer`: header shows close (✕), see ProfileHeader. */
  variant?: 'page' | 'drawer';
}

/**
 * Header (back button), card, information – then the CMS container `page-profile`
 * where apps add sections (e.g. the user's posts). Mount with `key={userId}`.
 */
export const ProfileView: React.FC<IProfileViewProps> = ({ userId, onBack, variant }) => {
  const { t } = useTranslation('profile');
  const { profile, params, relation, error, state, reload } = useProfile(userId);
  const ready = state === 'ready' && profile;
  // Drawer: call a friend directly from the header (not on the own profile).
  const canCall =
    variant === 'drawer' && ready && !params?.isOwen && relation?.status === 'accepted';

  return (
    <div
      data-slot="profile-view"
      className="relative flex min-h-full w-full flex-col bg-background"
    >
      <ProfileHeader
        onBack={onBack}
        variant={variant}
        title={ready ? profile.fullName || profile.alias : null}
        subtitle={ready ? `@${profile.alias}` : state === 'loading' ? t('states.loading') : null}
        actions={
          canCall && profile ? <ProfileCallButtons profile={profile} onLeave={onBack} /> : null
        }
      />

      <div className="w-full">
        {state === 'loading' && <ProfileLoadingState />}
        {state === 'notFound' && <ProfileNotFoundState />}
        {state === 'private' && <ProfilePrivateState />}
        {state === 'error' && <ProfileErrorState error={error} onRetry={() => void reload()} />}
        {ready && (
          <>
            <ProfileCard profile={profile} params={params} relation={relation} />
            <ProfileInfo profile={profile} params={params} />
          </>
        )}
      </div>

      {/* App sections (e.g. the user's posts) – always below header, card and information,
          whatever position they were registered with. */}
      {ready && <CmsContainer name={PROFILE_CMS_CONTAINER} payload={{ userId, profile, params }} />}
    </div>
  );
};
