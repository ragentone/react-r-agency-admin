import { authButtonPrimary } from '@core/auth/components/auth.styles.ts';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { useFormikContext } from 'formik';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ICreatePasswordFormValues } from './CreatePasswordForm.tsx';

export interface CreatePasswordFormSubmitButtonProps {
  label?: string;
  submittingLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const CreatePasswordFormSubmitButton: React.FC<CreatePasswordFormSubmitButtonProps> = ({
  label,
  submittingLabel,
  disabled,
  className,
}) => {
  const { t } = useTranslation('auth');
  const formik = useFormikContext<ICreatePasswordFormValues>();

  const isSubmitting = formik?.isSubmitting ?? false;
  const isValid = formik?.isValid ?? true;
  const isDisabled = disabled ?? (isSubmitting || !isValid);

  const displayLabel =
    label ?? t('createPasswordForm.submit', { defaultValue: 'Passwort erstellen' });
  const displaySubmittingLabel =
    submittingLabel ?? t('createPasswordForm.submitting', { defaultValue: 'Wird gespeichert...' });

  return (
    <Button type="submit" disabled={isDisabled} className={cn(authButtonPrimary, className)}>
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {displaySubmittingLabel}
        </>
      ) : (
        displayLabel
      )}
    </Button>
  );
};
