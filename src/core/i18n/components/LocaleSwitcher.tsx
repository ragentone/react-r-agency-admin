import { getLocales, type ILocale } from '@core/i18n/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/shad-cn/components/select.tsx';
import { Globe } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface IProps {
  switchDelay?: number;

  afterSwitch?(locale: ILocale): void;
}

const LocaleSwitcher = ({ switchDelay, afterSwitch }: IProps) => {
  const { i18n, t } = useTranslation('i18n');
  const locales = getLocales();
  const [value, setValue] = useState(i18n.language);
  const [busy, setBusy] = useState<boolean>(false);

  const switchLocale = (locale: string) => {
    setValue(locale);
    i18n.changeLanguage(locale).then();
  };

  const execute = (locale: ILocale) => {
    if (value === locale.key) {
      return;
    }
    setBusy(true);
    setTimeout(() => {
      switchLocale(locale.key);
      if (afterSwitch) {
        afterSwitch(locale);
      }
      setBusy(false);
    }, switchDelay ?? 0);
  };

  const select = (key: string) => {
    const locale = locales.find(locale => locale.key === key);
    if (!locale) return;
    execute(locale);
  };

  return (
    <Select disabled={busy} value={i18n.language} onValueChange={select}>
      <SelectTrigger className={'shadow-none'}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map(locale => (
          <SelectItem value={locale.key} key={locale.key}>
            <div className={'flex gap-2 items-center'} key={locale.key}>
              <Globe size={18} />
              {t(locale.label)}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export { LocaleSwitcher };
