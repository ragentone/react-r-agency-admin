import { startCall } from '@core/call/call.engine';
import { primeRingAudio } from '@core/call/ringer';
import { CmsContainer } from '@core/cms';
import { Phone, Video } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ICmsProfileButtonsPayload, IUserProfile } from '../types';

const iconButton =
  'grid size-9 shrink-0 place-items-center rounded-full text-foreground outline-none transition-colors hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring';

/** Message + voice + video call buttons for a friend's profile (header of the profile drawer). */
export const ProfileCallButtons: React.FC<{
  profile: IUserProfile;
  /** Closes the profile drawer before the messenger opens. */
  onLeave?: () => void;
}> = ({ profile, onLeave }) => {
  const { t } = useTranslation('call', { useSuspense: false });
  const name = profile.alias;

  const call = (video: boolean) => {
    // Inside the click → the browser allows the ring sound.
    primeRingAudio();
    void startCall(
      { id: profile.userId, alias: profile.alias, avatarUrl: profile.avatarUrl ?? null },
      video
    );
  };

  return (
    <>
      <CmsContainer<ICmsProfileButtonsPayload>
        name={'profile-call-buttons'}
        payload={{ profile, onLeave }}
      >
        <button
          type="button"
          onClick={() => call(false)}
          aria-label={t('actions.voiceCallWith', { name })}
          title={t('actions.voiceCallWith', { name })}
          className={iconButton}
        >
          <Phone className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => call(true)}
          aria-label={t('actions.videoCallWith', { name })}
          title={t('actions.videoCallWith', { name })}
          className={iconButton}
        >
          <Video className="size-5" />
        </button>
      </CmsContainer>
    </>
  );
};
