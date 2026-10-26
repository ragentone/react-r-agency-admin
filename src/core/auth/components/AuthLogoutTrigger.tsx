import {
  authButtonPrimary,
  authButtonSecondary,
  authButtonSmall,
} from '@core/auth/components/auth.styles.ts';
import type { IButtonProps } from '@core/theme';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/shad-cn/components/popover.tsx';
import { Loader2, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from './use.auth.ts';

/**
 * Represents the properties for a component that extends IButtonProps.
 * Provides additional control for enabling or disabling the component.
 *
 * @interface IProps
 * @extends IButtonProps
 * @property {boolean} [disabled] - Optional property to specify whether the component is disabled.
 */
interface IProps extends IButtonProps {
  disabled?: boolean;
  className?: string;
}
/**
 * AuthLogoutTrigger is a React functional component that renders a button
 * which triggers a popover with logout options. The component utilizes
 * `Popover`, `PopoverTrigger`, and `PopoverContent` from a UI library.
 * The popover contains multiple buttons for performing logout actions.
 * The component accepts the props for the button through the `IButtonProps` interface.
 */
const AuthLogoutTrigger = (props: IProps) => {
  const { t } = useTranslation('auth');
  const { isLoggingOut, logout, userMeta } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!userMeta) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild={true}>
        <Button {...props} className={props.className} disabled={props.disabled || isOpen}>
          {isLoggingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
          {isLoggingOut
            ? t('logout.loggingOut', { defaultValue: 'Wird abgemeldet...' })
            : t('logout.trigger', { defaultValue: 'Abmelden' })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={'mx-2 flex w-72 max-w-full flex-col gap-4 rounded-2xl p-4'}>
        <p className="text-body leading-5 text-foreground">
          {t('logout.description', {
            defaultValue: 'Sind Sie sicher, dass Sie sich abmelden möchten?',
          })}
        </p>
        <div className={'flex flex-col gap-2'}>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className={cn(authButtonPrimary, authButtonSmall)}
          >
            {t('logout.confirm', { defaultValue: 'Abmelden' })}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
            }}
            className={cn(authButtonSecondary, authButtonSmall)}
          >
            {t('logout.cancel', { defaultValue: 'Abbrechen' })}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { AuthLogoutTrigger };
