import { authButtonPrimary } from '@core/auth/components/auth.styles.ts';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { useFormikContext } from 'formik';
import { KeyRound, Loader2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IChangePasswordFormValues } from './ChangePasswordForm';

export interface ChangePasswordFormSubmitButtonProps {
  label?: string;
  submittingLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const ChangePasswordFormSubmitButton: React.FC<ChangePasswordFormSubmitButtonProps> = ({
  label,
  submittingLabel,
  disabled,
  className,
}) => {
  const { t } = useTranslation('auth');
  const formik = useFormikContext<IChangePasswordFormValues>();

  const isSubmitting = formik?.isSubmitting ?? false;
  const isValid = formik?.isValid ?? true;
  const isDirty = formik?.dirty ?? false;
  const isDisabled = disabled ?? (!isDirty || isSubmitting || !isValid);

  const displayLabel = label ?? t('changePasswordForm.submit', { defaultValue: 'Passwort ändern' });
  const displaySubmittingLabel =
    submittingLabel ?? t('changePasswordForm.submitting', { defaultValue: 'Wird geändert...' });

  return (
    <Button
      type="submit"
      disabled={isDisabled}
      className={cn(authButtonPrimary, 'px-6 sm:w-auto', className)}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {displaySubmittingLabel}
        </>
      ) : (
        <>
          <KeyRound className="h-4 w-4" />
          {displayLabel}
        </>
      )}
    </Button>
  );
};
