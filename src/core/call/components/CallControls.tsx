import { cn } from '@ui/lib/utils';
import { useIsMobile } from '@ui/shad-cn/hooks/use-mobile';
import {
  type LucideIcon,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  SwitchCamera,
  Video,
  VideoOff,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  acceptCall,
  declineCall,
  flipCamera,
  hangupCall,
  toggleCamera,
  toggleMic,
} from '../call.engine';
import { useCallStore } from '../store';

interface IRoundButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  /** `toggled` = feature switched off (white button, like iOS/WhatsApp). */
  variant?: 'glass' | 'toggled' | 'danger' | 'accept';
  size?: 'md' | 'lg';
  showLabel?: boolean;
  autoFocus?: boolean;
  pulse?: boolean;
}

const VARIANTS: Record<NonNullable<IRoundButtonProps['variant']>, string> = {
  glass: 'bg-white/15 text-white hover:bg-white/25 active:bg-white/30 backdrop-blur-md',
  toggled: 'bg-white text-black hover:bg-white/90',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  accept: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700',
};

const RoundButton: React.FC<IRoundButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  variant = 'glass',
  size = 'md',
  showLabel = true,
  autoFocus,
  pulse,
}) => (
  <div className="flex flex-col items-center gap-2">
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      autoFocus={autoFocus}
      className={cn(
        'relative grid place-items-center rounded-full outline-none transition-[transform,background-color] focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-95',
        size === 'lg' ? 'size-[72px]' : 'size-14',
        VARIANTS[variant]
      )}
    >
      {pulse && (
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40 motion-reduce:hidden" />
      )}
      <Icon className={cn('relative', size === 'lg' ? 'size-8' : 'size-6')} strokeWidth={2} />
    </button>
    {showLabel && <span className="text-caption font-medium text-white/80">{label}</span>}
  </div>
);

/** Bottom controls – accept/decline while ringing, mic/camera/flip/hang up otherwise. */
export const CallControls: React.FC = () => {
  const { t } = useTranslation('call', { useSuspense: false });
  const mobile = useIsMobile();
  const status = useCallStore(state => state.status);
  const video = useCallStore(state => state.video);
  const micOn = useCallStore(state => state.micOn);
  const camOn = useCallStore(state => state.camOn);
  const hasCamera = useCallStore(state => state.hasCamera);

  if (status === 'ended') return null;

  if (status === 'incoming') {
    return (
      <div className="flex items-start justify-center gap-20">
        <RoundButton
          icon={PhoneOff}
          label={t('actions.decline')}
          onClick={declineCall}
          variant="danger"
          size="lg"
        />
        <RoundButton
          icon={video ? Video : Phone}
          label={t('actions.accept')}
          onClick={() => void acceptCall()}
          variant="accept"
          size="lg"
          autoFocus
          pulse
        />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center gap-4 min-[400px]:gap-6">
      <RoundButton
        icon={micOn ? Mic : MicOff}
        label={micOn ? t('actions.mute') : t('actions.unmute')}
        onClick={toggleMic}
        variant={micOn ? 'glass' : 'toggled'}
      />
      {hasCamera && (
        <RoundButton
          icon={camOn ? Video : VideoOff}
          label={camOn ? t('actions.cameraOff') : t('actions.cameraOn')}
          onClick={toggleCamera}
          variant={camOn ? 'glass' : 'toggled'}
        />
      )}
      {hasCamera && mobile && (
        <RoundButton
          icon={SwitchCamera}
          label={t('actions.flip')}
          onClick={() => void flipCamera()}
        />
      )}
      <RoundButton
        icon={PhoneOff}
        label={status === 'outgoing' ? t('actions.cancel') : t('actions.hangup')}
        onClick={hangupCall}
        variant="danger"
      />
    </div>
  );
};
