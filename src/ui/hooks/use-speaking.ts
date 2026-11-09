import { useEffect, useRef, useState } from 'react';

interface IAnalyser {
  stream: MediaStream;
  trackId: string;
  source: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
  data: Uint8Array<ArrayBuffer>;
}

/** Audio level (0–1) above which someone counts as speaking. */
export const SPEAKING_THRESHOLD = 0.04;

/**
 * Who is talking right now – one AudioContext, one analyser per audio stream, polled ~6×/s.
 * `streams`: id → stream with an audio track (muted participants are simply left out).
 * Shared by meet and durak voice chat.
 */
export const useSpeaking = (
  streams: Record<string, MediaStream | null | undefined>,
  threshold: number = SPEAKING_THRESHOLD
) => {
  const [speaking, setSpeaking] = useState<ReadonlySet<string>>(() => new Set());
  const ctxRef = useRef<AudioContext | null>(null);
  const analysers = useRef(new Map<string, IAnalyser>());
  const streamsRef = useRef(streams);
  const thresholdRef = useRef(threshold);

  // Keep analysers in sync with the streams.
  const key = Object.entries(streams)
    .map(([id, stream]) => `${id}:${stream?.getAudioTracks()[0]?.id ?? ''}`)
    .sort()
    .join('|');

  useEffect(() => {
    streamsRef.current = streams;
    thresholdRef.current = threshold;
  });

  useEffect(() => {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = (ctxRef.current ??= new Ctx());
    if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
    const map = analysers.current;
    const current = streamsRef.current;

    map.forEach((entry, id) => {
      const stream = current[id];
      if (!stream || stream.getAudioTracks()[0]?.id !== entry.trackId) {
        entry.source.disconnect();
        map.delete(id);
      }
    });
    Object.entries(current).forEach(([id, stream]) => {
      const track = stream?.getAudioTracks()[0];
      if (!stream || !track || map.has(id)) return;
      try {
        const source = ctx.createMediaStreamSource(new MediaStream([track]));
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.6;
        source.connect(analyser);
        map.set(id, {
          stream,
          trackId: track.id,
          source,
          analyser,
          data: new Uint8Array(new ArrayBuffer(analyser.fftSize)),
        });
      } catch {
        /* stream without readable audio */
      }
    });
  }, [key]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = new Set<string>();
      analysers.current.forEach((entry, id) => {
        const track = entry.stream.getAudioTracks()[0];
        if (!track?.enabled || track.readyState !== 'live') return;
        entry.analyser.getByteTimeDomainData(entry.data);
        let sum = 0;
        for (let i = 0; i < entry.data.length; i++) {
          const v = (entry.data[i] - 128) / 128;
          sum += v * v;
        }
        if (Math.sqrt(sum / entry.data.length) > thresholdRef.current) next.add(id);
      });
      setSpeaking(prev =>
        prev.size === next.size && [...next].every(id => prev.has(id)) ? prev : next
      );
    }, 160);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(
    () => () => {
      analysers.current.forEach(entry => entry.source.disconnect());
      analysers.current.clear();
      void ctxRef.current?.close().catch(() => undefined);
      ctxRef.current = null;
    },
    []
  );

  return speaking;
};
