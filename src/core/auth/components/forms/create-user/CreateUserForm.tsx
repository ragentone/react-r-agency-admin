import { useUserCreate } from '@core/auth/hooks';
import type { UserCreateReturn } from '@core/auth/types';
import { createCreateValidationSchema } from '@core/auth/validation';
import { useGraphQl } from '@core/mesh';
import type { UserCreateParams } from '@generated/graphql/graphql.ts';
import { cn } from '@ui/lib/utils.ts';
import { Form, Formik, type FormikHelpers } from 'formik';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CreateFormAlert } from './CreateFormAlert';
import { CreateFormAliasField } from './CreateFormAliasField';
import { CreateFormEmailField } from './CreateFormEmailField';
import { CreateFormFields } from './CreateFormFields';
import { CreateFormHeader } from './CreateFormHeader';
import { CreateFormPasswordField } from './CreateFormPasswordField';
import { CreateFormSubmitButton } from './CreateFormSubmitButton';

export type IUserCreateFormValues = UserCreateParams;

export interface CreateFormProps {
  initialValues?: Partial<IUserCreateFormValues>;
  onSubmit?: (
    values: IUserCreateFormValues,
    helpers: FormikHelpers<IUserCreateFormValues>
  ) => Promise<void> | void;
  onSuccess?: (result?: UserCreateReturn | null) => void;
  onError?: (error: Error | string) => void;
  className?: string;
  title?: string;
  description?: string;
}

const defaultInitialValues: IUserCreateFormValues = {
  alias: '',
  email: '',
  password: '',
};

export interface CreateFormComponent extends React.FC<CreateFormProps> {
  Header: typeof CreateFormHeader;
  Alert: typeof CreateFormAlert;
  Fields: typeof CreateFormFields;
  AliasField: typeof CreateFormAliasField;
  EmailField: typeof CreateFormEmailField;
  PasswordField: typeof CreateFormPasswordField;
  SubmitButton: typeof CreateFormSubmitButton;
}

export const CreateUserForm: CreateFormComponent = Object.assign(
  ({
    initialValues,
    onSubmit,
    onSuccess,
    onError,
    className,
    title,
    description,
  }: CreateFormProps) => {
    const { t } = useTranslation('auth');
    const { query } = useGraphQl();
    const { createUser } = useUserCreate();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const displayTitle = title ?? t('createForm.title');
    const displayDescription = description ?? t('createForm.description');

    const validationSchema = useMemo(() => createCreateValidationSchema(t, query), [t, query]);

    const mergedInitialValues: IUserCreateFormValues = {
      ...defaultInitialValues,
      ...initialValues,
    };

    const handleFormSubmit = async (
      values: IUserCreateFormValues,
      formikHelpers: FormikHelpers<IUserCreateFormValues>
    ) => {
      setSubmitError(null);
      try {
        if (onSubmit) {
          await onSubmit(values, formikHelpers);
          onSuccess?.();
        } else {
          const result = await createUser({
            alias: values.alias.trim(),
            email: values.email.trim(),
            password: values.password,
          });

          if (!result?.success) {
            throw new Error(t('errors.createFailed'));
          }

          onSuccess?.(result);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : t('errors.createFailed');
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
            <CreateFormAlert message={submitError} />
            <CreateFormFields />
            <CreateFormSubmitButton />
          </Form>
        )}
      </Formik>
    );

    return (
      <div className={cn('w-full max-w-md mx-auto', className)}>
        <CreateFormHeader title={displayTitle} description={displayDescription} />
        <div>{formBody}</div>
      </div>
    );
  },
  {
    Header: CreateFormHeader,
    Alert: CreateFormAlert,
    Fields: CreateFormFields,
    AliasField: CreateFormAliasField,
    EmailField: CreateFormEmailField,
    PasswordField: CreateFormPasswordField,
    SubmitButton: CreateFormSubmitButton,
  }
);

export default CreateUserForm;
