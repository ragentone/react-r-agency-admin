import { authInput, authInputIcon, authInputWithIcon } from '@core/auth/components/auth.styles.ts';
import { cn } from '@ui/lib/utils';
import { Field, FieldError, FieldLabel } from '@ui/shad-cn/components/field';
import { Input } from '@ui/shad-cn/components/input';
import { useFormikContext } from 'formik';
import { Mail } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IUserCreateFormValues } from './CreateUserForm.tsx';

export interface CreateFormEmailFieldProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const CreateFormEmailField: React.FC<CreateFormEmailFieldProps> = ({
  id = 'create-email',
  name = 'email',
  label,
  placeholder,
  disabled,
  className,
}) => {
  const { t } = useTranslation('auth');
  const formik = useFormikContext<IUserCreateFormValues>();

  const value = formik?.values?.email ?? '';
  const error = formik?.errors?.email;
  const isTouched = Boolean(formik?.touched?.email);
  const isSubmitting = formik?.isSubmitting ?? false;
  const isInvalid = Boolean(isTouched && error);
  const isDisabled = disabled ?? isSubmitting;

  const displayLabel = label ?? t('createForm.email');
  const displayPlaceholder = placeholder ?? t('createForm.emailPlaceholder');
  const errorId = `${id}-error`;

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={id}>{displayLabel}</FieldLabel>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type="email"
          placeholder={displayPlaceholder}
          autoComplete="email"
          value={value}
          onChange={formik?.handleChange}
          onBlur={formik?.handleBlur}
          disabled={isDisabled}
          className={cn(authInput, authInputWithIcon)}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? errorId : undefined}
        />
        <Mail className={authInputIcon} />
      </div>
      {isInvalid && error && <FieldError id={errorId}>{error}</FieldError>}
    </Field>
  );
};
