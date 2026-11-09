import { Button } from '@ui/shad-cn/components/button';
import { useFormikContext } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface AccountSubmitButtonProps {
  label?: string;
  submittingLabel?: string;
  disabled?: boolean;
  className?: string;
}

/** Save button of the account forms: 44 px, disabled until the form is changed and valid. */
export const AccountSubmitButton: React.FC<AccountSubmitButtonProps> = ({
  label,
  submittingLabel,
  disabled,
  className,
}) => {
  const { t } = useTranslation('account');
  const formik = useFormikContext();

  const isSubmitting = formik?.isSubmitting ?? false;
  const isDirty = formik?.dirty ?? false;
  const isValid = formik?.isValid ?? true;
  const isDisabled = disabled !== undefined ? disabled : !isDirty || isSubmitting || !isValid;

  return (
    <Button
      type="submit"
      size="lg"
      disabled={isDisabled}
      isLoading={isSubmitting}
      className={className}
    >
      {isSubmitting ? (submittingLabel ?? t('form.submitting')) : (label ?? t('form.submit'))}
    </Button>
  );
};
