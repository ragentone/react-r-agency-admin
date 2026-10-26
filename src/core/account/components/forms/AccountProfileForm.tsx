import { useAccount } from '@core/account/hooks';
import type { IAccountFormValues, IAccountUpdateData, IUserAccount } from '@core/account/types';
import { createProfileValidationSchema } from '@core/account/validation';
import { useGraphQl } from '@core/mesh';
import { cn } from '@ui/lib';
import { Form, Formik, type FormikHelpers } from 'formik';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AccountAlert } from './AccountAlert';
import { AccountBioField } from './AccountBioField';
import { AccountHeader } from './AccountHeader';
import { AccountPersonalFields } from './AccountPersonalFields';
import { AccountSubmitButton } from './AccountSubmitButton';

export interface AccountProfileFormProps {
  account?: IUserAccount | null;
  initialValues?: Partial<IAccountFormValues>;
  validationSchema?: any;
  onSubmit?: (
    values: IAccountFormValues,
    formikHelpers: FormikHelpers<IAccountFormValues>
  ) => Promise<void> | void;
  onSuccess?: () => void;
  onError?: (error: Error | string) => void;
  title?: string;
  description?: string;
  showBioField?: boolean;
  className?: string;
}

export const AccountProfileForm: React.FC<AccountProfileFormProps> = ({
  account,
  initialValues,
  validationSchema: customValidationSchema,
  onSubmit,
  onSuccess,
  onError,
  title,
  description,
  showBioField = true,
  className,
}) => {
  const { t } = useTranslation('account');
  const { updateAccount } = useAccount(false);
  const graphql = useGraphQl();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const validationSchema = useMemo(() => {
    return (
      customValidationSchema ||
      createProfileValidationSchema(t, { query: graphql.query, currentAlias: account?.alias })
    );
  }, [account?.alias, customValidationSchema, graphql.query, t]);

  const formValues: IAccountFormValues = useMemo(() => {
    const defaultValues: IAccountFormValues = {
      id: '',
      alias: '',
      email: '',
      firstname: '',
      lastname: '',
      gender: 'unknown',
      birthday: '',
      description: '',
      public: true,
      searchable: true,
      showEmail: false,
      showFullName: true,
    };

    const fromAccount: Partial<IAccountFormValues> = account
      ? {
          id: account.id ?? '',
          alias: account.alias ?? '',
          email: account.email ?? '',
          firstname: account.details?.firstname ?? '',
          lastname: account.details?.lastname ?? '',
          gender: account.gender ?? 'unknown',
          birthday: account.birthday ?? '',
          description: account.description?.html ?? '',
        }
      : {};

    return {
      ...defaultValues,
      ...fromAccount,
      ...initialValues,
    };
  }, [account, initialValues]);

  const handleFormSubmit = async (
    values: IAccountFormValues,
    formikHelpers: FormikHelpers<IAccountFormValues>
  ) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      if (onSubmit) {
        await onSubmit(values, formikHelpers);
      } else {
        const updateData: IAccountUpdateData = {
          id: values.id || account?.id || '',
          alias: values.alias.trim(),
          gender: values.gender,
          birthday: values.birthday || undefined,
          details: {
            firstname: values.firstname.trim() || undefined,
            lastname: values.lastname.trim() || undefined,
          },
          description: {
            html: values.description || '',
          },
        };

        const success = await updateAccount(updateData);
        if (!success) {
          throw new Error(t('messages.updateError'));
        }
      }

      setSubmitSuccess(t('messages.updateSuccess'));
      toast.success(t('messages.updateSuccess'));
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('messages.updateError');
      setSubmitError(errorMessage);
      toast.error(errorMessage);
      onError?.(err instanceof Error ? err : errorMessage);
    } finally {
      formikHelpers.setSubmitting(false);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {title || description ? <AccountHeader title={title} description={description} /> : null}
      <Formik
        initialValues={formValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize
      >
        {() => (
          <Form className="space-y-4" noValidate>
            <AccountAlert type="error" message={submitError} />
            <AccountAlert type="success" message={submitSuccess} />

            <AccountPersonalFields />

            {showBioField && <AccountBioField />}

            <div className="flex justify-end pt-2">
              <AccountSubmitButton className="w-full sm:w-auto shadow-none" />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
