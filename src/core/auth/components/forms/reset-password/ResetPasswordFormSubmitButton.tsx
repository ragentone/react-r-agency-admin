import { authButtonPrimary } from '@core/auth/components/auth.styles.ts';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { Spinner } from '@ui/shad-cn/components/spinner';
import { useFormikContext } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IResetPasswordFormValues } from './ResetPasswordForm.tsx';

export interface ResetPasswordFormSubmitButtonProps {
  label?: string;
  submittingLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const ResetPasswordFormSubmitButton: React.FC<ResetPasswordFormSubmitButtonProps> = ({
  label,
  submittingLabel,
  disabled,
  className,
}) => {
  const { t } = useTranslation('auth');
  const formik = useFormikContext<IResetPasswordFormValues>();

  const isSubmitting = formik?.isSubmitting ?? false;
  const isDisabled = disabled ?? isSubmitting;

  const displayLabel =
    label ?? t('resetPasswordForm.submit', { defaultValue: 'Passwort zurücksetzen' });
  const displaySubmittingLabel =
    submittingLabel ?? t('resetPasswordForm.submitting', { defaultValue: 'Wird gesendet...' });

  return (
    <Button type="submit" className={cn(authButtonPrimary, className)} disabled={isDisabled}>
      {isSubmitting && <Spinner className="mr-2" />}
      {isSubmitting ? displaySubmittingLabel : displayLabel}
    </Button>
  );
};
