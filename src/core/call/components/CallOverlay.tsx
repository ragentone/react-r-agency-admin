import { cn } from '@ui/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar.tsx';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MicOff, Settings2, UserRound, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { dismissCall } from '../call.engine';
import { useCallStore } from '../store';
import { CallControls } from './CallControls';
import { CallDeviceDrawer } from './CallDeviceDrawer';
import { CallAudio, CallVideo } from './CallVideo';
import { useCallDuration } from './use.call.duration';

/** Pulsing rings around the avatar while it rings. */
const RingWaves: React.FC = () => (
  <>
    {[0, 0.6, 1.2].map(delay => (
      <motion.span
        key={delay}
        aria-hidden
        className="absolute inset-0 rounded-full border border-white/40"
        initial={{ scale: 1, opacity: 0.6 }}
        animate={{ scale: 1.9, opacity: 0 }}
        transition={{ duration: 1.8, delay, repeat: Infinity, ease: 'easeOut' }}
      />
    ))}
  </>
);

/** Fullscreen sizing of the drawer popup (inline → wins over the drawer's default vars). */
const fullscreenStyle = {
  '--drawer-inset': '0px',
  '--drawer-content-height': '100dvh',
  '--drawer-content-max-height': '100dvh',
  '--drawer-bleed-background': '#000',
} as React.CSSProperties;

/**
 * Full-screen call UI as a fullscreen drawer (slides up, mounted while a call exists).
 * While ringing / connecting / active it can't be dismissed (no swipe, back, Escape) – only
 * the call controls end it. After the call ended: swipe down / back / Escape / ✕ closes it.
 */
export const CallOverlay: React.FC = () => {
  const status = useCallStore(state => state.status);
  const open = status !== 'idle';
  const ended = status === 'ended';

  return (
    <Drawer
      open={open}
      onOpenChange={next => {
        if (!next && useCallStore.getState().status === 'ended') dismissCall();
      }}
      swipeDirection="down"
      backClose={ended}
      disablePointerDismissal
    >
      <DrawerContent
        style={fullscreenStyle}
        // Above everything else (dock, header, other drawers).
        layerClassName="z-[200]"
        className={cn(
          'rounded-none h-full! max-h-full max-w-full border-0 bg-neutral-950 text-white shadow-none &>div:first-child]:hidden',
          {
            'sm:w-96 mx-auto sm:rounded-4xl': status !== 'active',
          }
        )}
      >
        <CallScreen />
      </DrawerContent>
    </Drawer>
  );
};

/** Mobile first, works as a centered stage on desktop. */
const CallScreen: React.FC = () => {
  const { t } = useTranslation('call', { useSuspense: false });
  const reduceMotion = useReducedMotion();
  // Drag area of the own camera (picture in picture).
  const rootRef = useRef<HTMLDivElement>(null);

  const status = useCallStore(state => state.status);
  const callId = useCallStore(state => state.callId);
  const peer = useCallStore(state => state.peer);
  const video = useCallStore(state => state.video);
  const localStream = useCallStore(state => state.localStream);
  const remoteStream = useCallStore(state => state.remoteStream);
  const camOn = useCallStore(state => state.camOn);
  const hasCamera = useCallStore(state => state.hasCamera);
  const facing = useCallStore(state => state.facing);
  const remoteCamOn = useCallStore(state => state.remoteCamOn);
  const remoteMicOn = useCallStore(state => state.remoteMicOn);
  const startedAt = useCallStore(state => state.startedAt);
  const endReason = useCallStore(state => state.endReason);
  const direction = useCallStore(state => state.direction);
  const duration = useCallDuration(status === 'active' ? startedAt : null);
  const [devicesOpen, setDevicesOpen] = useState(false);
  // Own media is running → mic / camera can be changed.
  const canPickDevices = !!localStream && status !== 'incoming' && status !== 'ended';

  const remoteHasVideo = !!remoteStream && remoteStream.getVideoTracks().length > 0;
  const showRemoteVideo = status === 'active' && video && remoteHasVideo && remoteCamOn;
  const showLocal = !!localStream && hasCamera && camOn && status !== 'ended';
  // Before the other side is there, the own camera fills the screen (like FaceTime).
  const localAsBackground = showLocal && !showRemoteVideo;
  const name = peer?.alias ? `@${peer.alias}` : t('unknown');

  const statusText = (() => {
    switch (status) {
      case 'outgoing':
        return callId ? t('status.ringing') : t('status.calling');
      case 'incoming':
        return video ? t('status.incomingVideo') : t('status.incomingVoice');
      case 'connecting':
        return t('status.connecting');
      case 'active':
        return duration;
      case 'ended':
        // The caller sees "no answer", the callee "missed call".
        return t(
          `ended.${endReason === 'missed' && direction === 'out' ? 'noAnswer' : (endReason ?? 'self')}`,
          { defaultValue: t('ended.self'), name }
        );
      default:
        return null;
    }
  })();

  const avatar = (
    <Avatar className="size-28 ring-4 ring-white/10">
      {peer?.avatarUrl && <AvatarImage src={peer.avatarUrl} alt={name} className="object-cover" />}
      <AvatarFallback className="bg-white/10 text-white">
        <UserRound className="size-12" />
      </AvatarFallback>
    </Avatar>
  );

  const ringing = status === 'incoming' || status === 'outgoing';

  const devicesButton = canPickDevices && (
    <button
      type="button"
      onClick={() => setDevicesOpen(true)}
      aria-label={t('devices.open')}
      aria-haspopup="dialog"
      aria-expanded={devicesOpen}
      title={t('devices.open')}
      className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 backdrop-blur-md outline-none transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/80"
    >
      <Settings2 className="size-5" />
    </button>
  );

  return (
    <div
      ref={rootRef}
      // Swipe down only closes the screen after the call ended (not by accident mid-call).
      data-base-ui-swipe-ignore={status === 'ended' ? undefined : ''}
      className="relative flex h-full min-h-0 flex-col overflow-hidden select-none"
    >
      <DrawerTitle className="sr-only">{t('aria.dialog', { name })}</DrawerTitle>
      <DrawerDescription className="sr-only">{statusText}</DrawerDescription>

      {/* ---- background ---- */}
      <div className="absolute inset-0">
        {showRemoteVideo ? (
          <CallVideo stream={remoteStream} muted className="size-full" />
        ) : localAsBackground ? (
          <>
            <CallVideo
              stream={localStream}
              muted
              mirrored={facing === 'user'}
              className="size-full"
            />
            <div className="absolute inset-0 bg-black/45" />
          </>
        ) : (
          <>
            {peer?.avatarUrl && (
              <img
                src={peer.avatarUrl}
                alt=""
                aria-hidden
                className="size-full scale-125 object-cover opacity-40 blur-3xl"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-b from-neutral-900/60 via-neutral-950/80 to-black" />
          </>
        )}
      </div>

      {/* Remote sound – always via <audio>, independent of the camera. */}
      <CallAudio stream={remoteStream} />

      {/* ---- header (video running): name + timer ---- */}
      <div className="relative z-10 bg-linear-to-b from-black/60 to-transparent px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-8">
        {showRemoteVideo ? (
          <div className="flex items-center gap-2">
            <span className="truncate text-body font-bold">{name}</span>
            {!remoteMicOn && (
              <MicOff className="size-4 shrink-0 text-white/80" aria-label={t('remoteMuted')} />
            )}
            <span className="ml-auto text-caption tabular-nums text-white/80">{duration}</span>
            {devicesButton}
          </div>
        ) : (
          <div className="flex min-h-10 items-center justify-between">
            <span />
            {status === 'ended' ? (
              <button
                type="button"
                onClick={dismissCall}
                aria-label={t('actions.close')}
                className="grid size-10 place-items-center rounded-full bg-white/10 outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/80"
              >
                <X className="size-5" />
              </button>
            ) : (
              <>{devicesButton}</>
            )}
          </div>
        )}
      </div>

      {/* ---- center: avatar, name, status ---- */}
      {!showRemoteVideo && (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-6 pb-10 text-center">
          <div className="relative">
            {ringing && !reduceMotion && <RingWaves />}
            {avatar}
          </div>
          <div className="min-w-0 max-w-full space-y-1.5">
            <h2 className="truncate text-2xl font-extrabold tracking-tight">{name}</h2>
            <p
              className={cn(
                'text-body text-white/70',
                status === 'active' && 'tabular-nums',
                status === 'ended' && 'text-white'
              )}
              aria-live="polite"
            >
              {statusText}
            </p>
            {status === 'active' && !remoteMicOn && (
              <p className="inline-flex items-center gap-1.5 text-caption text-white/60">
                <MicOff className="size-3.5" /> {t('remoteMuted')}
              </p>
            )}
          </div>
        </div>
      )}
      {showRemoteVideo && <div className="flex-1" />}

      {/* ---- own camera (picture in picture, draggable) ---- */}
      <AnimatePresence>
        {showLocal && showRemoteVideo && (
          <motion.div
            key="pip"
            drag
            dragConstraints={rootRef}
            dragMomentum={false}
            dragElastic={0.1}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-[calc(max(1rem,env(safe-area-inset-top))+3rem)] right-4 z-20 aspect-[3/4] w-28 cursor-grab overflow-hidden rounded-2xl bg-neutral-800 shadow-2xl ring-1 ring-white/20 active:cursor-grabbing sm:w-40"
          >
            <CallVideo
              stream={localStream}
              muted
              mirrored={facing === 'user'}
              className="pointer-events-none size-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- controls ---- */}
      <div className="relative z-10 bg-gradient-to-t from-black/70 to-transparent px-4 pt-10 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <CallControls />
      </div>
      <CallDeviceDrawer
        localStream={localStream}
        open={devicesOpen && canPickDevices}
        onOpenChange={setDevicesOpen}
      />
    </div>
  );
};
