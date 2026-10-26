import { callNative, isNativeApp } from '@core/native';

/**
 * Ringing:
 * - incoming, Flutter app → native ringtone + vibration (`call.ring.start`), keeps working while
 *   the app is in the background (Android). Falls back to the web tone for older app versions.
 * - incoming, browser → Web Audio ring pattern + `navigator.vibrate` (Android Chrome).
 * - outgoing → ringback tone (Web Audio) on every platform.
 */
type RingKind = 'incoming' | 'outgoing';

let audioContext: AudioContext | null = null;
let loopTimer = 0;
let vibrateTimer = 0;
let nativeRinging = false;
let session = 0;

const context = () => {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  audioContext ??= new Ctor();
  if (audioContext.state === 'suspended') void audioContext.resume().catch(() => undefined);
  return audioContext;
};

/** One beep: sine tones with soft attack/release (no clicks). */
const beep = (frequencies: number[], start: number, duration: number, volume: number) => {
  const ctx = context();
  if (!ctx) return;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime + start);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + start + 0.02);
  gain.gain.setValueAtTime(volume, ctx.currentTime + start + duration - 0.04);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + duration);
  gain.connect(ctx.destination);
  frequencies.forEach(frequency => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    osc.connect(gain);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration);
  });
};

const PATTERNS: Record<RingKind, { play: () => void; every: number }> = {
  // Two short double tones, repeated every 3 s.
  incoming: {
    play: () => {
      beep([660, 880], 0, 0.35, 0.18);
      beep([660, 880], 0.5, 0.35, 0.18);
    },
    every: 3_000,
  },
  // European ringback: 425 Hz, 1 s on / 4 s off.
  outgoing: { play: () => beep([425], 0, 1, 0.08), every: 5_000 },
};

const startWebTone = (kind: RingKind) => {
  const pattern = PATTERNS[kind];
  pattern.play();
  loopTimer = window.setInterval(pattern.play, pattern.every);
};

const startWebVibration = () => {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  const pulse = () => navigator.vibrate([400, 200, 400]);
  pulse();
  vibrateTimer = window.setInterval(pulse, 3_000);
};

export const startRing = (kind: RingKind) => {
  stopRing();
  const current = ++session;
  if (kind === 'outgoing') {
    startWebTone('outgoing');
    return;
  }
  if (isNativeApp()) {
    nativeRinging = true;
    callNative('call.ring.start').catch(error => {
      // Older app without ringer / platform without support → web tone.
      console.warn('[call] native ring failed', error);
      nativeRinging = false;
      if (current === session) startWebTone('incoming');
    });
    return;
  }
  startWebTone('incoming');
  startWebVibration();
};

export const stopRing = () => {
  session += 1;
  window.clearInterval(loopTimer);
  window.clearInterval(vibrateTimer);
  loopTimer = 0;
  vibrateTimer = 0;
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(0);
  }
  if (nativeRinging) {
    nativeRinging = false;
    callNative('call.ring.stop').catch(() => undefined);
  }
};

/** Unlock Web Audio inside a user gesture (e.g. tap on the call button). */
export const primeRingAudio = () => {
  context();
};
