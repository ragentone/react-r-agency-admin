import { getLocales } from '@core/i18n/locale';
import { Languages } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { IMenuComponentProps } from '../../types.ts';
import { MenuSegmented } from './MenuSegmented.tsx';
import { MenuSettingRow } from './MenuSettingRow.tsx';

/** Language switch for the main menu (`Core.menu.registerComponent`). */
const MenuLocaleSwitch = ({ variant }: IMenuComponentProps) => {
  const { t, i18n } = useTranslation('menu');
  const locales = getLocales();
  const [busy, setBusy] = useState(false);
  const current =
    locales.find(l => i18n.resolvedLanguage?.startsWith(l.key))?.key ?? locales[0]?.key;

  const change = (key: string) => {
    setBusy(true);
    void i18n.changeLanguage(key).finally(() => setBusy(false));
  };

  const name = (key: string) => {
    const locale = locales.find(l => l.key === key);
    return locale ? String(t(locale.label, { ns: 'i18n' })) : key;
  };

  return (
    <MenuSettingRow
      variant={variant}
      icon={Languages}
      label={t('settings.language')}
      valueLabel={current ? name(current) : undefined}
      busy={busy}
      onCycle={() => {
        const index = locales.findIndex(l => l.key === current);
        change(locales[(index + 1) % locales.length].key);
      }}
      control={
        <MenuSegmented
          label={t('settings.language')}
          layoutId={`menu-locale-${variant}`}
          value={current ?? ''}
          disabled={busy}
          onChange={change}
          options={locales.map(locale => ({
            value: locale.key,
            label: name(locale.key),
            content: locale.key,
          }))}
        />
      }
    />
  );
};

export { MenuLocaleSwitch };
