import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface INotifySoundStore {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
}

export const useNotifySoundStore = create<INotifySoundStore>()(
  persist(
    (set, get) => ({
      soundEnabled: false,
      setSoundEnabled: (soundEnabled: boolean) => set({ soundEnabled }),
      toggleSound: () => set({ soundEnabled: !get().soundEnabled }),
    }),
    {
      name: 'notify:sound',
    }
  )
);

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  audioContext ??= new Ctor();
  return audioContext;
};

// Global unlock on user gesture so AudioContext is active and ready when notifications arrive
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        void ctx.resume().catch(() => undefined);
      }
    } catch {
      // ignore
    }
  };
  window.addEventListener('pointerdown', unlockAudio, { capture: true, passive: true });
  window.addEventListener('keydown', unlockAudio, { capture: true, passive: true });
  window.addEventListener('touchstart', unlockAudio, { capture: true, passive: true });
}

export type NotifySoundType = 'info' | 'success' | 'warning' | 'error';

/** Plays notification sounds for different notification types via Web Audio API. */
export const playNotifySound = async (type: NotifySoundType = 'info') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => undefined);
    }
    if (ctx.state !== 'running') return;

    const now = ctx.currentTime + 0.01;

    const playTone = (
      freq: number,
      start: number,
      duration: number,
      volume = 0.2,
      oscType: OscillatorType = 'sine'
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = oscType;
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(volume, now + start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration);
    };

    switch (type) {
      case 'success':
        // Uplifting 4-note ascending major chime (C5 -> E5 -> G5 -> C6)
        playTone(523.25, 0, 0.12, 0.16);
        playTone(659.25, 0.07, 0.14, 0.18);
        playTone(783.99, 0.14, 0.16, 0.2);
        playTone(1046.5, 0.21, 0.4, 0.22);
        break;

      case 'warning':
        // Warm 2-note attention chime (C#5 -> A4)
        playTone(554.37, 0, 0.14, 0.2, 'triangle');
        playTone(440.0, 0.11, 0.28, 0.22, 'triangle');
        break;

      case 'error':
        // Descending 2-note alert tone (G4 -> C4)
        playTone(392.0, 0, 0.14, 0.22, 'triangle');
        playTone(261.63, 0.11, 0.35, 0.24, 'triangle');
        break;

      case 'info':
      default:
        // Gentle 2-note harmonic chime (D5 -> A5)
        playTone(587.33, 0, 0.18, 0.18);
        playTone(880.0, 0.08, 0.32, 0.2);
        break;
    }
  } catch {
    // Ignore audio playback errors
  }
};

let lastPlayedAt = 0;

/** Plays notify sound only if sound is enabled in settings (debounced). */
export const playNotifySoundIfEnabled = (type: NotifySoundType = 'info') => {
  if (useNotifySoundStore.getState().soundEnabled) {
    const now = Date.now();
    if (now - lastPlayedAt < 150) return;
    lastPlayedAt = now;
    void playNotifySound(type);
  }
};
