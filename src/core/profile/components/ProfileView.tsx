import { CmsContainer } from '@core/cms';
import { PluginSlot } from '@core/plugin';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { PROFILE_CMS_CONTAINER } from '../const';
import { useProfile } from '../hooks/use.profile';
import { ProfileCard } from './ProfileCard';
import { ProfileHeader } from './ProfileHeader';
import { ProfileInfo } from './ProfileInfo';
import { ProfileMenuButton } from './ProfileMenuButton';
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
  // Context of every profile slot: plugins type what they need themselves.
  const pluginContext = { userId, profile, params, relation, state };

  return (
    <div
      data-slot="profile-view"
      className="relative flex min-h-full w-full flex-col bg-background"
    >
      <ProfileHeader
        onBack={onBack}
        variant={variant}
        title={ready ? `@${profile.alias}` : state === 'loading' ? t('states.loading') : null}
        actions={
          ready ? (
            <>
              <PluginSlot name="profile.header.actions" className="flex items-center gap-1" context={pluginContext} />
              <ProfileMenuButton context={pluginContext} />
            </>
          ) : null
        }
      />

      <div className="w-full">
        {state === 'loading' && <ProfileLoadingState />}
        {state === 'notFound' && <ProfileNotFoundState />}
        {state === 'private' && <ProfilePrivateState />}
        {(state === 'private' || state === 'notFound') && (
          <PluginSlot name="profile.empty.widget" context={pluginContext} />
        )}
        {state === 'error' && <ProfileErrorState error={error} onRetry={() => void reload()} />}
        {ready && (
          <>
            <ProfileCard profile={profile} params={params} relation={relation} />
            <PluginSlot name="profile.card.widget" context={pluginContext} />
            <ProfileInfo profile={profile} params={params} />
            <PluginSlot name="profile.info.widget" context={pluginContext} />
          </>
        )}
      </div>

      {/* App sections (e.g. the user's posts) – always below header, card and information,
          whatever position they were registered with. */}
      {ready && <CmsContainer name={PROFILE_CMS_CONTAINER} payload={{ userId, profile, params }} />}
    </div>
  );
};
