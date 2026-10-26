import { type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { detectClientPlatform } from '../hooks';

const PLATFORM_NAMES: Record<string, string> = {
  android: 'Android',
  ios: 'iOS',
  macos: 'macOS',
};

/**
 * Runs only inside the Flutter app (`isNativeApp()`):
 * shows a native notification as soon as the React app has loaded.
 */
const NativeProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('native');

  useEffect(() => {
    const init = () => {
      window.localStorage.setItem(
        'current-platform',
        PLATFORM_NAMES[detectClientPlatform()] ?? 'App'
      );
    };
    init();
  }, [t]);

  return <>{children}</>;
};

export { NativeProvider };
