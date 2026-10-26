import { cn } from '@ui/lib/utils';
import React, { useEffect, useRef } from 'react';

export interface ICallVideoProps {
  stream: MediaStream | null;
  /** Local preview: muted (no echo) and mirrored for the front camera. */
  muted?: boolean;
  mirrored?: boolean;
  className?: string;
}

/** `<video>` bound to a MediaStream (`srcObject` can't be set as a prop). */
export const CallVideo: React.FC<ICallVideoProps> = ({ stream, muted, mirrored, className }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (video.srcObject !== stream) video.srcObject = stream;
    if (stream) void video.play().catch(() => undefined);
  }, [stream]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={cn('object-cover', mirrored && '-scale-x-100', className)}
    />
  );
};

/** Plays the remote audio in voice calls (no video element on screen). */
export const CallAudio: React.FC<{ stream: MediaStream | null }> = ({ stream }) => {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    if (audio.srcObject !== stream) audio.srcObject = stream;
    if (stream) void audio.play().catch(() => undefined);
  }, [stream]);

  return <audio ref={ref} autoPlay className="hidden" />;
};
