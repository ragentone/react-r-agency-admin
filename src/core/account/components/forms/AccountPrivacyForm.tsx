// noinspection ExceptionCaughtLocallyJS

import { useAccount } from '@core/account/hooks';
import type { IAccountFormValues, IUserAccount, IUserSettings } from '@core/account/types';
import { createPrivacyValidationSchema } from '@core/account/validation';
import { cn } from '@ui/lib/utils';
import { Form, Formik, type FormikHelpers } from 'formik';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AccountAlert } from './AccountAlert';
import { AccountHeader } from './AccountHeader';
import { AccountPrivacyFields } from './AccountPrivacyFields';
import { AccountSubmitButton } from './AccountSubmitButton';

export interface AccountPrivacyFormProps {
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
  className?: string;
}

export const AccountPrivacyForm: React.FC<AccountPrivacyFormProps> = ({
  account,
  initialValues,
  validationSchema: customValidationSchema,
  onSubmit,
  onSuccess,
  onError,
  title,
  description,
  className,
}) => {
  const { t } = useTranslation('account');
  const { updateSettings } = useAccount(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const validationSchema = useMemo(() => {
    return customValidationSchema || createPrivacyValidationSchema();
  }, [customValidationSchema]);

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
          public: account.settings?.public ?? true,
          searchable: account.settings?.searchable ?? true,
          showEmail: account.settings?.showEmail ?? false,
          showFullName: account.settings?.showFullName ?? true,
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
        const settings: IUserSettings = {
          public: Boolean(values.public),
          searchable: Boolean(values.searchable),
          showEmail: Boolean(values.showEmail),
          showFullName: Boolean(values.showFullName),
        };

        const success = await updateSettings(settings, values.id || account?.id || undefined);
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
            {/* Full-bleed rows inside the settings section (which has px-4). */}
            <AccountPrivacyFields className="-mx-4" />
            <div className="flex justify-end pt-2">
              <AccountSubmitButton className="w-full sm:w-auto shadow-none" />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
