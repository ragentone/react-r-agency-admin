import { startCall } from '@core/call/call.engine';
import { primeRingAudio } from '@core/call/ringer';
import { CmsContainer } from '@core/cms';
import { Button } from '@ui/shad-cn/components/button';
import { Phone, Video } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ICmsProfileButtonsPayload, IUserProfile } from '../types';

/** Message + voice + video call buttons for a friend's profile (header of the profile drawer). */
export const ProfileCallButtons: React.FC<{
  profile: IUserProfile;
  /** Closes the profile drawer before another drawer opens. */
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
    <CmsContainer<ICmsProfileButtonsPayload>
      name={'profile-call-buttons'}
      payload={{ profile, onLeave }}
    >
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={() => call(false)}
        aria-label={t('actions.voiceCallWith', { name })}
        title={t('actions.voiceCallWith', { name })}
      >
        <Phone className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={() => call(true)}
        aria-label={t('actions.videoCallWith', { name })}
        title={t('actions.videoCallWith', { name })}
      >
        <Video className="size-5" />
      </Button>
    </CmsContainer>
  );
};
