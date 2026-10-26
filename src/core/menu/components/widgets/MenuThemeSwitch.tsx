import { type Theme, useTheme } from '@core/theme';
import { Monitor, Moon, Sun, SunMoon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { IMenuComponentProps } from '../../types.ts';
import { MenuSegmented } from './MenuSegmented.tsx';
import { MenuSettingRow } from './MenuSettingRow.tsx';

const THEMES: { value: Theme; icon: typeof Sun }[] = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
];

/** Light / dark / system switch for the main menu (`Core.menu.registerComponent`). */
const MenuThemeSwitch = ({ variant }: IMenuComponentProps) => {
  const { t } = useTranslation('menu');
  const { theme, setTheme } = useTheme();

  return (
    <MenuSettingRow
      variant={variant}
      icon={SunMoon}
      label={t('settings.theme')}
      valueLabel={t(`settings.themes.${theme}`)}
      onCycle={() => {
        const index = THEMES.findIndex(item => item.value === theme);
        setTheme(THEMES[(index + 1) % THEMES.length].value);
      }}
      control={
        <MenuSegmented
          label={t('settings.theme')}
          layoutId={`menu-theme-${variant}`}
          value={theme}
          onChange={setTheme}
          options={THEMES.map(({ value, icon: Icon }) => ({
            value,
            label: t(`settings.themes.${value}`),
            content: <Icon className={'size-3.5'} />,
          }))}
        />
      }
    />
  );
};

export { MenuThemeSwitch };
