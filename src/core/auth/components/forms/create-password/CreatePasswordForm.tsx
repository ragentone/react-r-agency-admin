import { useUserPassword } from '@core/auth/hooks';
import type { UserPasswordCreateReturn } from '@core/auth/types';
import { createPasswordCreateValidationSchema } from '@core/auth/validation';
import { cn } from '@ui/lib/utils.ts';
import { Form, Formik, type FormikHelpers } from 'formik';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CreatePasswordFormAlert } from './CreatePasswordFormAlert';
import { CreatePasswordFormConfirmPasswordField } from './CreatePasswordFormConfirmPasswordField';
import { CreatePasswordFormFields } from './CreatePasswordFormFields';
import { CreatePasswordFormHeader } from './CreatePasswordFormHeader';
import { CreatePasswordFormPasswordField } from './CreatePasswordFormPasswordField';
import { CreatePasswordFormSubmitButton } from './CreatePasswordFormSubmitButton';

export interface ICreatePasswordFormValues {
  password: string;
  confirmPassword: string;
}

export interface CreatePasswordFormProps {
  token?: string;
  initialValues?: Partial<ICreatePasswordFormValues>;
  onSubmit?: (
    values: ICreatePasswordFormValues,
    helpers: FormikHelpers<ICreatePasswordFormValues>
  ) => Promise<void> | void;
  onSuccess?: (result?: UserPasswordCreateReturn | null) => void;
  onError?: (error: Error | string) => void;
  className?: string;
  title?: string;
  description?: string;
}

const defaultInitialValues: ICreatePasswordFormValues = {
  password: '',
  confirmPassword: '',
};

export interface CreatePasswordFormComponent extends React.FC<CreatePasswordFormProps> {
  Header: typeof CreatePasswordFormHeader;
  Alert: typeof CreatePasswordFormAlert;
  Fields: typeof CreatePasswordFormFields;
  PasswordField: typeof CreatePasswordFormPasswordField;
  ConfirmPasswordField: typeof CreatePasswordFormConfirmPasswordField;
  SubmitButton: typeof CreatePasswordFormSubmitButton;
}

export const CreatePasswordForm: CreatePasswordFormComponent = Object.assign(
  ({
    token = '',
    initialValues,
    onSubmit,
    onSuccess,
    onError,
    className,
    title,
    description,
  }: CreatePasswordFormProps) => {
    const { t } = useTranslation('auth');
    const { createPassword } = useUserPassword();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const displayTitle = title ?? t('createPasswordForm.title');
    const displayDescription = description ?? t('createPasswordForm.description');

    const validationSchema = useMemo(() => createPasswordCreateValidationSchema(t), [t]);

    const mergedInitialValues: ICreatePasswordFormValues = {
      ...defaultInitialValues,
      ...initialValues,
    };

    const handleFormSubmit = async (
      values: ICreatePasswordFormValues,
      formikHelpers: FormikHelpers<ICreatePasswordFormValues>
    ) => {
      setSubmitError(null);
      try {
        if (onSubmit) {
          await onSubmit(values, formikHelpers);
          onSuccess?.();
        } else {
          const result = await createPassword(values.password, token);

          if (!result?.success) {
            throw new Error(t('errors.passwordCreateFailed'));
          }

          onSuccess?.(result);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : t('errors.passwordCreateFailed');
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
            <CreatePasswordFormAlert message={submitError} />
            <CreatePasswordFormFields />
            <CreatePasswordFormSubmitButton />
          </Form>
        )}
      </Formik>
    );

    return (
      <div className={cn('w-full max-w-md mx-auto', className)}>
        <CreatePasswordFormHeader title={displayTitle} description={displayDescription} />
        <div>{formBody}</div>
      </div>
    );
  },
  {
    Header: CreatePasswordFormHeader,
    Alert: CreatePasswordFormAlert,
    Fields: CreatePasswordFormFields,
    PasswordField: CreatePasswordFormPasswordField,
    ConfirmPasswordField: CreatePasswordFormConfirmPasswordField,
    SubmitButton: CreatePasswordFormSubmitButton,
  }
);

export default CreatePasswordForm;
