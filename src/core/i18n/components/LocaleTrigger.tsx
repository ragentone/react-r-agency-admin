import { getLocales } from '@core/i18n/locale';
import type { IButtonProps } from '@core/theme';
import { cn } from '@ui/lib';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ui/shad-cn/components/dropdown-menu.tsx';
import { Check, Globe } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface IProps extends IButtonProps {
  disabled?: boolean;
}

const LocaleTrigger = (props: IProps) => {
  const { i18n, t } = useTranslation('i18n');
  const locales = getLocales();
  const [value, setValue] = useState(i18n.language);
  const [busy, setBusy] = useState<boolean>(false);

  const switchLocale = (locale: string) => {
    setBusy(true);
    setTimeout(() => {
      i18n.changeLanguage(locale).then(() => {
        setValue(locale);
        setBusy(false);
      });
    }, 250);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true} disabled={props.disabled}>
        <Button disabled={props.disabled} variant={props.variant} size={props.size}>
          <Globe />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {locales.map(locale => (
          <DropdownMenuItem
            key={locale.key}
            disabled={busy || props.disabled}
            onClick={() => switchLocale(locale.key)}
            className={cn('cursor-pointer', {
              'opacity-100': value === locale.key,
              'opacity-60': value !== locale.key,
            })}
          >
            {value === locale.key ? <Check /> : <Globe />}
            {t(locale.label)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { LocaleTrigger };
