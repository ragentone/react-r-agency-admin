import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { useFormikContext } from 'formik';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface AccountSubmitButtonProps {
  label?: string;
  submittingLabel?: string;
  disabled?: boolean;
  className?: string;
}

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

  const displayLabel = label ?? t('form.submit');
  const displaySubmittingLabel = submittingLabel ?? t('form.submitting');

  return (
    <Button
      type="submit"
      disabled={isDisabled}
      className={cn('h-10 rounded-full px-6 text-body font-bold shadow-none', className)}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {displaySubmittingLabel}
        </>
      ) : (
        <>{displayLabel}</>
      )}
    </Button>
  );
};
