import type { IMenuComponentProps } from '@core/menu/types.ts';
import { useTranslation } from 'react-i18next';

import { usePwa } from './use.pwa.ts';

/** Bottom of the settings drawer: "Version 1.0.2" (nothing when unknown, e.g. dev). */
export const PwaSettingsVersion = ({ variant }: IMenuComponentProps) => {
  const { t } = useTranslation('pwa');
  const { version } = usePwa();
  if (variant === 'rail' || !version) return null;
  return (
    <p
      data-slot={'pwa-settings-version'}
      className={'px-3 pt-4 pb-1 text-center text-caption text-muted-foreground tabular-nums'}
    >
      {t('version.label', { version })}
    </p>
  );
};
