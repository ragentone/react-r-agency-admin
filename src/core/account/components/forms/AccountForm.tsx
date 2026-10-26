import { useAccount } from '@core/account/hooks';
import type { IAccountFormValues, IAccountUpdateData, IUserAccount } from '@core/account/types';
import { createAccountValidationSchema } from '@core/account/validation';
import { useGraphQl } from '@core/mesh';
import { cn } from '@ui/lib/utils';
import { Form, Formik, type FormikHelpers } from 'formik';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AccountAlert } from './AccountAlert';
import { AccountBioField } from './AccountBioField';
import { AccountHeader } from './AccountHeader';
import { AccountPersonalFields } from './AccountPersonalFields';
import { AccountPrivacyFields } from './AccountPrivacyFields';
import { AccountPrivacyForm } from './AccountPrivacyForm';
import { AccountProfileForm } from './AccountProfileForm';
import { AccountSubmitButton } from './AccountSubmitButton';

export interface AccountFormProps {
  account?: IUserAccount | null;
  initialValues?: Partial<IAccountFormValues>;
  onSubmit?: (
    values: IAccountFormValues,
    helpers: FormikHelpers<IAccountFormValues>
  ) => Promise<void> | void;
  onSuccess?: () => void;
  onError?: (error: Error | string) => void;
  className?: string;
  title?: string;
  description?: string;
  showPersonalFields?: boolean;
  showPrivacyFields?: boolean;
  showBioField?: boolean;
}

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

export interface AccountFormComponent extends React.FC<AccountFormProps> {
  Header: typeof AccountHeader;
  Alert: typeof AccountAlert;
  PersonalFields: typeof AccountPersonalFields;
  BioField: typeof AccountBioField;
  PrivacyFields: typeof AccountPrivacyFields;
  SubmitButton: typeof AccountSubmitButton;
  Profile: typeof AccountProfileForm;
  Privacy: typeof AccountPrivacyForm;
}

export const AccountForm: AccountFormComponent = Object.assign(
  ({
    account,
    initialValues,
    onSubmit,
    onSuccess,
    onError,
    className,
    title,
    description,
    showPersonalFields = true,
    showPrivacyFields = true,
    showBioField = true,
  }: AccountFormProps) => {
    const { t } = useTranslation('account');
    const { updateAccount } = useAccount(false);
    const graphql = useGraphQl();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

    const displayTitle = title ?? t('form.title');
    const displayDescription = description ?? t('form.description');

    const validationSchema = useMemo(
      () =>
        createAccountValidationSchema(t, { query: graphql.query, currentAlias: account?.alias }),
      [account?.alias, graphql.query, t]
    );

    const formValues: IAccountFormValues = useMemo(() => {
      const fromAccount: Partial<IAccountFormValues> = account
        ? {
            id: account.id,
            alias: account.alias ?? '',
            email: account.email ?? '',
            firstname: account.details?.firstname ?? '',
            lastname: account.details?.lastname ?? '',
            gender: account.gender ?? 'unknown',
            birthday: account.birthday ?? '',
            description: account.description?.html ?? '',
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
            settings: {
              public: Boolean(values.public),
              searchable: Boolean(values.searchable),
              showEmail: Boolean(values.showEmail),
              showFullName: Boolean(values.showFullName),
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
        {title || description ? (
          <AccountHeader title={displayTitle} description={displayDescription} />
        ) : null}
        <div>
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

                {showPersonalFields && <AccountPersonalFields />}

                {showBioField && <AccountBioField />}

                {showPrivacyFields && (
                  <>
                    <div className="pt-2">
                      <h4 className="text-body font-bold text-foreground">
                        {t('form.privacyTitle')}
                      </h4>
                      <p className="mt-0.5 mb-3 text-caption text-muted-foreground">
                        {t('form.privacyDescription')}
                      </p>
                      <AccountPrivacyFields />
                    </div>
                  </>
                )}

                <div className="flex justify-end pt-2">
                  <AccountSubmitButton className="w-full sm:w-auto shadow-none" />
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    );
  },
  {
    Header: AccountHeader,
    Alert: AccountAlert,
    PersonalFields: AccountPersonalFields,
    BioField: AccountBioField,
    PrivacyFields: AccountPrivacyFields,
    SubmitButton: AccountSubmitButton,
    Profile: AccountProfileForm,
    Privacy: AccountPrivacyForm,
  }
);
