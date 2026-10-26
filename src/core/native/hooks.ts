import { useEffect, useRef, useState } from 'react';

import { callNative, isNativeApp, onNativeEvent } from './bridge';
import type { ClientPlatform, INativeAppInfo, INativeEvents, NativeEvent } from './types';

/**
 * Infos über die native App. `isApp` ist sofort bekannt, `info` kommt asynchron
 * (bleibt `null` im Browser).
 */
export const useNativeApp = (): { isApp: boolean; info: INativeAppInfo | null } => {
  const [isApp] = useState(isNativeApp);
  const [info, setInfo] = useState<INativeAppInfo | null>(null);

  useEffect(() => {
    if (!isApp) return;
    let active = true;
    callNative('app.info')
      .then(result => active && setInfo(result))
      .catch(() => undefined);
    const off = onNativeEvent('bridge.ready', data => setInfo(data));
    return () => {
      active = false;
      off();
    };
  }, [isApp]);

  return { isApp, info };
};

export const useNativeEvent = <E extends NativeEvent>(
  event: E,
  callback: (data: INativeEvents[E]) => void
): void => {
  const ref = useRef(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isNativeApp()) return;
    return onNativeEvent(event, data => ref.current(data));
  }, [event]);
};

export const detectClientPlatform = (): ClientPlatform => {
  if (!isNativeApp()) return 'web';
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macos';
  return 'web';
};

export const useClientPlatform = (): ClientPlatform => {
  const { info } = useNativeApp();
  const [detected] = useState(detectClientPlatform);
  switch (info?.platform) {
    case 'android':
      return 'android';
    case 'ios':
      return 'ios';
    case 'macos':
      return 'macos';
    default:
      return detected;
  }
};
