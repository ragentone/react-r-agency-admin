import { useEffect, useState } from 'react';

import type { CallDeviceKind } from '../types';

export interface ICallDevice {
  deviceId: string;
  label: string;
}

const EMPTY: Record<CallDeviceKind, ICallDevice[]> = { audioinput: [], videoinput: [] };

/** Mics + cameras, kept current when something is plugged in / out. */
export const useMediaDevices = (enabled: boolean) => {
  const [devices, setDevices] = useState(EMPTY);

  useEffect(() => {
    const media = navigator.mediaDevices;
    if (!enabled || !media?.enumerateDevices) return;
    let alive = true;

    const load = async () => {
      const list = await media.enumerateDevices().catch(() => [] as MediaDeviceInfo[]);
      if (!alive) return;
      const pick = (kind: CallDeviceKind) =>
        list
          // Windows "communications" duplicates the default entry.
          .filter(item => item.kind === kind && item.deviceId && item.deviceId !== 'communications')
          .map((item, index) => ({ deviceId: item.deviceId, label: item.label, index }))
          .map(({ deviceId, label, index }) => ({ deviceId, label: label || `#${index + 1}` }));
      setDevices({ audioinput: pick('audioinput'), videoinput: pick('videoinput') });
    };

    void load();
    media.addEventListener('devicechange', load);
    return () => {
      alive = false;
      media.removeEventListener('devicechange', load);
    };
  }, [enabled]);

  return devices;
};

/** 0…1 input level of an audio track (for the "is my mic working?" meter). */
export const useAudioLevel = (stream: MediaStream | null, enabled: boolean) => {
  const [level, setLevel] = useState(0);
  const track = stream?.getAudioTracks()[0] ?? null;

  useEffect(() => {
    if (!enabled || !track || typeof AudioContext === 'undefined') return;
    const context = new AudioContext();
    const source = context.createMediaStreamSource(new MediaStream([track]));
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    let frame = 0;
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const value of data) sum += ((value - 128) / 128) ** 2;
      setLevel(Math.min(1, Math.sqrt(sum / data.length) * 4));
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(frame);
      source.disconnect();
      void context.close().catch(() => undefined);
      setLevel(0);
    };
  }, [track, enabled]);

  return level;
};
