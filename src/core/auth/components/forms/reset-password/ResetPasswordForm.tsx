import { useUserPassword } from '@core/auth/hooks';
import type { UserPasswordResetReturn } from '@core/auth/types';
import { createResetPasswordValidationSchema } from '@core/auth/validation';
import { cn } from '@ui/lib/utils.ts';
import { Form, Formik, type FormikHelpers } from 'formik';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ResetPasswordFormAlert } from './ResetPasswordFormAlert';
import { ResetPasswordFormEmailField } from './ResetPasswordFormEmailField';
import { ResetPasswordFormFields } from './ResetPasswordFormFields';
import { ResetPasswordFormHeader } from './ResetPasswordFormHeader';
import { ResetPasswordFormSubmitButton } from './ResetPasswordFormSubmitButton';

export interface IResetPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormProps {
  initialValues?: Partial<IResetPasswordFormValues>;
  onSubmit?: (
    values: IResetPasswordFormValues,
    helpers: FormikHelpers<IResetPasswordFormValues>
  ) => Promise<void> | void;
  onSuccess?: (result?: UserPasswordResetReturn | null) => void;
  onError?: (error: Error | string) => void;
  className?: string;
  title?: string;
  description?: string;
}

const defaultInitialValues: IResetPasswordFormValues = {
  email: '',
};

export interface ResetPasswordFormComponent extends React.FC<ResetPasswordFormProps> {
  Header: typeof ResetPasswordFormHeader;
  Alert: typeof ResetPasswordFormAlert;
  Fields: typeof ResetPasswordFormFields;
  EmailField: typeof ResetPasswordFormEmailField;
  SubmitButton: typeof ResetPasswordFormSubmitButton;
}

export const ResetPasswordForm: ResetPasswordFormComponent = Object.assign(
  ({
    initialValues,
    onSubmit,
    onSuccess,
    onError,
    className,
    title,
    description,
  }: ResetPasswordFormProps) => {
    const { t } = useTranslation('auth');
    const { resetPassword } = useUserPassword();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const displayTitle = title ?? t('resetPasswordForm.title');
    const displayDescription = description ?? t('resetPasswordForm.description');

    const validationSchema = useMemo(() => createResetPasswordValidationSchema(t), [t]);

    const mergedInitialValues: IResetPasswordFormValues = {
      ...defaultInitialValues,
      ...initialValues,
    };

    const handleFormSubmit = async (
      values: IResetPasswordFormValues,
      formikHelpers: FormikHelpers<IResetPasswordFormValues>
    ) => {
      setSubmitError(null);
      try {
        if (onSubmit) {
          await onSubmit(values, formikHelpers);
          onSuccess?.();
        } else {
          const result = await resetPassword(values.email.trim());
          if (!result?.success) {
            throw new Error(t('errors.resetFailed'));
          }
          formikHelpers.resetForm();
          onSuccess?.(result);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : t('errors.resetFailed');
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
            <ResetPasswordFormAlert message={submitError} />
            <ResetPasswordFormFields />
            <ResetPasswordFormSubmitButton />
          </Form>
        )}
      </Formik>
    );

    return (
      <div className={cn('w-full max-w-md mx-auto', className)}>
        <ResetPasswordFormHeader title={displayTitle} description={displayDescription} />
        <div>{formBody}</div>
      </div>
    );
  },
  {
    Header: ResetPasswordFormHeader,
    Alert: ResetPasswordFormAlert,
    Fields: ResetPasswordFormFields,
    EmailField: ResetPasswordFormEmailField,
    SubmitButton: ResetPasswordFormSubmitButton,
  }
);

export default ResetPasswordForm;
