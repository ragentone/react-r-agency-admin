import { authButtonPrimary } from '@core/auth/components/auth.styles.ts';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { Spinner } from '@ui/shad-cn/components/spinner';
import { useFormikContext } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IUserCreateFormValues } from './CreateUserForm.tsx';

export interface CreateFormSubmitButtonProps {
  label?: string;
  submittingLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const CreateFormSubmitButton: React.FC<CreateFormSubmitButtonProps> = ({
  label,
  submittingLabel,
  disabled,
  className,
}) => {
  const { t } = useTranslation('auth');
  const formik = useFormikContext<IUserCreateFormValues>();

  const isSubmitting = formik?.isSubmitting ?? false;
  const isDisabled = disabled ?? isSubmitting;

  const displayLabel = label ?? t('createForm.submit');
  const displaySubmittingLabel = submittingLabel ?? t('createForm.submitting');

  return (
    <Button type="submit" className={cn(authButtonPrimary, className)} disabled={isDisabled}>
      {isSubmitting && <Spinner className="mr-2" />}
      {isSubmitting ? displaySubmittingLabel : displayLabel}
    </Button>
  );
};
