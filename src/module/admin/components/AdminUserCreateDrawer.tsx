import { AppFormDrawer } from '@ui/patterns';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { IAdminUserCreateValues } from '../hooks';

const EMPTY: IAdminUserCreateValues = { alias: '', email: '', password: '', confirmed: true };
const ALIAS = /^[A-Za-z0-9_]{3,16}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LABEL = 'text-caption font-medium text-foreground';

export interface IAdminUserCreateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving: boolean;
  /** Returns an error translation key, or null on success. */
  onSubmit: (values: IAdminUserCreateValues) => Promise<string | null>;
}

/** New admin account: alias, e-mail, password (the admin hands the password over himself). */
export const AdminUserCreateDrawer: React.FC<IAdminUserCreateDrawerProps> = ({
  open,
  onOpenChange,
  saving,
  onSubmit,
}) => {
  const { t } = useTranslation('admin');
  const [values, setValues] = useState<IAdminUserCreateValues>(EMPTY);
  const [touched, setTouched] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(false);

  // Fresh form whenever the drawer opens – adjusted during render.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues(EMPTY);
      setTouched(false);
      setServerError(null);
    }
  }

  const set = (key: 'alias' | 'email' | 'password', value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setServerError(null);
  };

  const errors = {
    alias: ALIAS.test(values.alias.trim()) ? null : t('users.create.aliasHint'),
    email: EMAIL.test(values.email.trim()) ? null : t('error.emailInvalid'),
    password:
      values.password.length >= 8 &&
      values.password.length <= 64 &&
      /[A-Za-z]/.test(values.password) &&
      /\d/.test(values.password)
        ? null
        : t('users.create.passwordHint'),
  };
  const invalid = Boolean(errors.alias || errors.email || errors.password);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (invalid || saving) return;
    const error = await onSubmit({
      alias: values.alias.trim(),
      email: values.email.trim(),
      password: values.password,
      confirmed: values.confirmed,
    });
    if (error) setServerError(error);
    else onOpenChange(false);
  };

  const field = (
    key: 'alias' | 'email' | 'password',
    label: string,
    props: React.ComponentProps<typeof Input>
  ) => (
    <div className="space-y-1.5">
      <label htmlFor={`admin-create-${key}`} className={LABEL}>
        {label}
      </label>
      <Input
        id={`admin-create-${key}`}
        value={values[key]}
        onChange={event => set(key, event.target.value)}
        aria-invalid={touched && Boolean(errors[key])}
        disabled={saving}
        className="h-11 rounded-lg text-base sm:text-body"
        {...props}
      />
      {touched && errors[key] && (
        <p className="text-caption text-destructive" role="alert">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <AppFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('users.create.title')}
      description={t('users.create.description')}
      onSubmit={event => void submit(event)}
      submitLabel={t('users.create.submit')}
      busy={saving}
    >
      <div className="space-y-4 px-4 py-4">
        {field('alias', t('users.create.alias'), {
          autoComplete: 'off',
          autoCapitalize: 'none',
          maxLength: 16,
        })}
        {field('email', t('users.create.email'), {
          type: 'email',
          autoComplete: 'off',
          autoCapitalize: 'none',
          inputMode: 'email',
        })}
        {field('password', t('users.create.password'), {
          type: 'password',
          autoComplete: 'new-password',
          maxLength: 64,
        })}
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 p-3">
          <label htmlFor="admin-create-confirmed" className="min-w-0 flex-1 space-y-0.5">
            <span className="block text-body font-medium">{t('users.create.confirmed')}</span>
            <span className="block text-caption text-muted-foreground">
              {t('users.create.confirmedHint')}
            </span>
          </label>
          <Switch
            id="admin-create-confirmed"
            checked={values.confirmed}
            onCheckedChange={checked => setValues(prev => ({ ...prev, confirmed: checked }))}
            disabled={saving}
          />
        </div>
        <p className="text-caption text-muted-foreground">{t('users.create.note')}</p>
        {serverError && (
          <p className="text-caption text-destructive" role="alert">
            {t(serverError)}
          </p>
        )}
      </div>
    </AppFormDrawer>
  );
};
