import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LABEL = 'text-caption font-medium text-foreground';

export interface IAdminPasswordFieldsProps {
  password: string;
  repeat: string;
  onPassword: (value: string) => void;
  onRepeat: (value: string) => void;
  /** Show the validation messages. */
  touched: boolean;
  passwordError: string | null;
  repeatError: string | null;
  disabled?: boolean;
}

/** Password + repeat, one eye button shows / hides both. */
export const AdminPasswordFields: React.FC<IAdminPasswordFieldsProps> = ({
  password,
  repeat,
  onPassword,
  onRepeat,
  touched,
  passwordError,
  repeatError,
  disabled,
}) => {
  const { t } = useTranslation('admin');
  const [visible, setVisible] = useState(false);
  const type = visible ? 'text' : 'password';

  const item = (
    id: string,
    label: string,
    value: string,
    onChange: (value: string) => void,
    error: string | null,
    toggle: boolean
  ) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={event => onChange(event.target.value)}
          aria-invalid={touched && Boolean(error)}
          disabled={disabled}
          autoComplete="new-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={64}
          className="h-11 rounded-lg pr-12 text-base sm:text-body"
        />
        {toggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon-md"
            onClick={() => setVisible(prev => !prev)}
            aria-label={t(visible ? 'users.create.hidePassword' : 'users.create.showPassword')}
            aria-pressed={visible}
            className="absolute top-1/2 right-1 -translate-y-1/2"
          >
            {visible ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </Button>
        )}
      </div>
      {touched && error && (
        <p className="text-caption text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );

  return (
    <>
      {item(
        'admin-create-password',
        t('users.create.password'),
        password,
        onPassword,
        passwordError,
        true
      )}
      {item(
        'admin-create-repeat',
        t('users.create.passwordRepeat'),
        repeat,
        onRepeat,
        repeatError,
        false
      )}
    </>
  );
};
