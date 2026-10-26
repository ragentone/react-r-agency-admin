import {
  authInput,
  authInputAction,
  authInputIcon,
  authInputWithAction,
  authInputWithIcon,
} from '@core/auth/components/auth.styles.ts';
import { cn } from '@ui/lib/utils';
import { Field, FieldError, FieldLabel } from '@ui/shad-cn/components/field';
import { Input } from '@ui/shad-cn/components/input';
import { useFormikContext } from 'formik';
import { Eye, EyeOff, Lock } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ICreatePasswordFormValues } from './CreatePasswordForm.tsx';

export interface CreatePasswordFormPasswordFieldProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const CreatePasswordFormPasswordField: React.FC<CreatePasswordFormPasswordFieldProps> = ({
  id = 'create-password-field',
  name = 'password',
  label,
  placeholder,
  disabled,
  className,
}) => {
  const { t } = useTranslation('auth');
  const formik = useFormikContext<ICreatePasswordFormValues>();
  const [showPassword, setShowPassword] = useState(false);

  const value = formik?.values?.password ?? '';
  const error = formik?.errors?.password;
  const isTouched = Boolean(formik?.touched?.password);
  const isSubmitting = formik?.isSubmitting ?? false;
  const isInvalid = Boolean(isTouched && error);
  const isDisabled = disabled ?? isSubmitting;

  const displayLabel =
    label ?? t('createPasswordForm.password', { defaultValue: t('form.password') });
  const displayPlaceholder =
    placeholder ??
    t('createPasswordForm.passwordPlaceholder', {
      defaultValue: t('form.passwordPlaceholder'),
    });
  const errorId = `${id}-error`;

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={id}>{displayLabel}</FieldLabel>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={displayPlaceholder}
          autoComplete="new-password"
          value={value}
          onChange={formik?.handleChange}
          onBlur={formik?.handleBlur}
          disabled={isDisabled}
          className={cn(authInput, authInputWithIcon, authInputWithAction)}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? errorId : undefined}
        />
        <Lock className={authInputIcon} />
        <button
          type="button"
          tabIndex={-1}
          className={authInputAction}
          onClick={() => setShowPassword(prev => !prev)}
          aria-label={showPassword ? t('form.hidePassword') : t('form.showPassword')}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {isInvalid && error && <FieldError id={errorId}>{error}</FieldError>}
    </Field>
  );
};
