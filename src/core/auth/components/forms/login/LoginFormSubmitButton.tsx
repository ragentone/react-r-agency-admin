import { authButtonPrimary } from '@core/auth/components/auth.styles.ts';
import { useAuth } from '@core/auth/components/use.auth.ts';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { Spinner } from '@ui/shad-cn/components/spinner';
import { useFormikContext } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ILoginFormValues } from './LoginForm.tsx';

export interface LoginFormSubmitButtonProps {
  label?: string;
  submittingLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const LoginFormSubmitButton: React.FC<LoginFormSubmitButtonProps> = ({
  label,
  submittingLabel,
  disabled,
  className,
}) => {
  const { t } = useTranslation('auth');
  const { isLoggingIn } = useAuth();
  const formik = useFormikContext<ILoginFormValues>();

  const isSubmitting = formik?.isSubmitting ?? false;
  const isPending = isSubmitting || isLoggingIn;
  const isDisabled = disabled ?? isPending;

  const displayLabel = label ?? t('form.submit');
  const displaySubmittingLabel = submittingLabel ?? t('form.submitting');

  return (
    <Button type="submit" className={cn(authButtonPrimary, className)} disabled={isDisabled}>
      {isPending && <Spinner className="mr-2" />}
      {isPending ? displaySubmittingLabel : displayLabel}
    </Button>
  );
};
