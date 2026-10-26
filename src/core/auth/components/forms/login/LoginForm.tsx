import { useAuth } from '@core/auth/components/use.auth.ts';
import type { ILoginParams } from '@core/auth/types/login.ts';
import { createLoginValidationSchema } from '@core/auth/validation';
import { cn } from '@ui/lib/utils.ts';
import { Form, Formik, type FormikHelpers } from 'formik';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LoginFormAlert } from './LoginFormAlert';
import { LoginFormEmailField } from './LoginFormEmailField';
import { LoginFormFields } from './LoginFormFields';
import { LoginFormHeader } from './LoginFormHeader';
import { LoginFormPasswordField } from './LoginFormPasswordField';
import { LoginFormSubmitButton } from './LoginFormSubmitButton';

export interface ILoginFormValues {
  email: string;
  password: string;
  userType?: string;
}

export interface LoginFormProps {
  initialValues?: Partial<ILoginFormValues>;
  onSubmit?: (
    values: ILoginFormValues,
    helpers: FormikHelpers<ILoginFormValues>
  ) => Promise<void> | void;
  onSuccess?: () => void;
  onError?: (error: Error | string) => void;
  className?: string;
  title?: string;
  description?: string;
}

const defaultInitialValues: ILoginFormValues = {
  email: '',
  password: '',
  userType: 'default',
};

export interface LoginFormComponent extends React.FC<LoginFormProps> {
  Header: typeof LoginFormHeader;
  Alert: typeof LoginFormAlert;
  Fields: typeof LoginFormFields;
  EmailField: typeof LoginFormEmailField;
  PasswordField: typeof LoginFormPasswordField;
  SubmitButton: typeof LoginFormSubmitButton;
}

export const LoginForm: LoginFormComponent = Object.assign(
  ({
    initialValues,
    onSubmit,
    onSuccess,
    onError,
    className,
    title,
    description,
  }: LoginFormProps) => {
    const { t } = useTranslation('auth');
    const { login } = useAuth();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const displayTitle = title ?? t('form.title');
    const displayDescription = description ?? t('form.description');

    const validationSchema = useMemo(() => createLoginValidationSchema(t), [t]);

    const mergedInitialValues: ILoginFormValues = {
      ...defaultInitialValues,
      ...initialValues,
    };

    const handleFormSubmit = async (
      values: ILoginFormValues,
      formikHelpers: FormikHelpers<ILoginFormValues>
    ) => {
      setSubmitError(null);
      try {
        if (onSubmit) {
          await onSubmit(values, formikHelpers);
        } else {
          const loginParams: ILoginParams = {
            email: values.email.trim(),
            password: values.password,
            userType: values.userType || 'default',
          };
          await login(loginParams);
        }
        onSuccess?.();
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : t('errors.loginFailed');
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
            <LoginFormAlert message={submitError} />
            <LoginFormFields />
            <LoginFormSubmitButton />
          </Form>
        )}
      </Formik>
    );

    return (
      <div className={cn('w-full max-w-md mx-auto space-y-4', className)}>
        <LoginFormHeader title={displayTitle} description={displayDescription} />
        <div>{formBody}</div>
      </div>
    );
  },
  {
    Header: LoginFormHeader,
    Alert: LoginFormAlert,
    Fields: LoginFormFields,
    EmailField: LoginFormEmailField,
    PasswordField: LoginFormPasswordField,
    SubmitButton: LoginFormSubmitButton,
  }
);

export default LoginForm;
