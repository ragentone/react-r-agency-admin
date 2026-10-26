// noinspection ExceptionCaughtLocallyJS

import { useAuth } from '@core/auth/components/use.auth.ts';
import { useUserPassword } from '@core/auth/hooks/use.user.password';
import type { UserPasswordChangeReturn } from '@core/auth/types';
import { createPasswordChangeValidationSchema } from '@core/auth/validation/passwordChange';
import { cn } from '@ui/lib/utils.ts';
import { Form, Formik, type FormikHelpers } from 'formik';
import { CheckCircle2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChangePasswordFormAlert } from './ChangePasswordFormAlert';
import { ChangePasswordFormConfirmPasswordField } from './ChangePasswordFormConfirmPasswordField';
import { ChangePasswordFormCurrentPasswordField } from './ChangePasswordFormCurrentPasswordField';
import { ChangePasswordFormFields } from './ChangePasswordFormFields';
import { ChangePasswordFormHeader } from './ChangePasswordFormHeader';
import { ChangePasswordFormNewPasswordField } from './ChangePasswordFormNewPasswordField';
import { ChangePasswordFormSubmitButton } from './ChangePasswordFormSubmitButton';

export interface IChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordFormProps {
  userId?: string;
  initialValues?: Partial<IChangePasswordFormValues>;
  onSubmit?: (
    values: IChangePasswordFormValues,
    helpers: FormikHelpers<IChangePasswordFormValues>
  ) => Promise<void> | void;
  onSuccess?: (result?: UserPasswordChangeReturn | null) => void;
  onError?: (error: Error | string) => void;
  className?: string;
  showHeader?: boolean;
  title?: string;
  description?: string;
}

const defaultInitialValues: IChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export interface ChangePasswordFormComponent extends React.FC<ChangePasswordFormProps> {
  Header: typeof ChangePasswordFormHeader;
  Alert: typeof ChangePasswordFormAlert;
  Fields: typeof ChangePasswordFormFields;
  CurrentPasswordField: typeof ChangePasswordFormCurrentPasswordField;
  NewPasswordField: typeof ChangePasswordFormNewPasswordField;
  ConfirmPasswordField: typeof ChangePasswordFormConfirmPasswordField;
  SubmitButton: typeof ChangePasswordFormSubmitButton;
}

export const ChangePasswordForm: ChangePasswordFormComponent = Object.assign(
  ({
    userId,
    initialValues,
    onSubmit,
    onSuccess,
    onError,
    className,
    showHeader = false,
    title,
    description,
  }: ChangePasswordFormProps) => {
    const { t } = useTranslation('auth');
    const { user } = useAuth();
    const { changePassword } = useUserPassword();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const targetUserId = userId || user?.id || '';

    const displayTitle = title ?? t('changePasswordForm.title');
    const displayDescription = description ?? t('changePasswordForm.description');

    const validationSchema = useMemo(() => createPasswordChangeValidationSchema(t), [t]);

    const mergedInitialValues: IChangePasswordFormValues = {
      ...defaultInitialValues,
      ...initialValues,
    };

    const handleFormSubmit = async (
      values: IChangePasswordFormValues,
      formikHelpers: FormikHelpers<IChangePasswordFormValues>
    ) => {
      setSubmitError(null);
      setSuccessMessage(null);
      try {
        if (onSubmit) {
          await onSubmit(values, formikHelpers);
          setSuccessMessage(t('changePasswordForm.success'));
          formikHelpers.resetForm();
          onSuccess?.();
        } else {
          if (!targetUserId) {
            throw new Error(t('errors.not_authorized', { defaultValue: 'User ID is missing' }));
          }

          const result = await changePassword({
            userId: targetUserId,
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          });

          if (!result?.success) {
            throw new Error(t('errors.passwordChangeFailed'));
          }

          setSuccessMessage(t('changePasswordForm.success'));
          formikHelpers.resetForm();
          onSuccess?.(result);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : t('errors.passwordChangeFailed');
        setSubmitError(errorMessage);
        onError?.(err instanceof Error ? err : errorMessage);
      } finally {
        formikHelpers.setSubmitting(false);
      }
    };

    const formBody = (
      <Formik
        initialValues={mergedInitialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize
      >
        {() => (
          <Form className="space-y-4" noValidate>
            <ChangePasswordFormAlert message={submitError} />
            {successMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/50 p-3 text-sm font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
            <ChangePasswordFormFields />
            <div className="flex justify-end pt-2">
              <ChangePasswordFormSubmitButton />
            </div>
          </Form>
        )}
      </Formik>
    );

    return (
      <div className={cn('w-full', className)}>
        {showHeader && (
          <ChangePasswordFormHeader title={displayTitle} description={displayDescription} />
        )}
        <div>{formBody}</div>
      </div>
    );
  },
  {
    Header: ChangePasswordFormHeader,
    Alert: ChangePasswordFormAlert,
    Fields: ChangePasswordFormFields,
    CurrentPasswordField: ChangePasswordFormCurrentPasswordField,
    NewPasswordField: ChangePasswordFormNewPasswordField,
    ConfirmPasswordField: ChangePasswordFormConfirmPasswordField,
    SubmitButton: ChangePasswordFormSubmitButton,
  }
);

export default ChangePasswordForm;
