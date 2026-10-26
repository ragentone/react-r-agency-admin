import type { IAccountFormValues } from '@core/account/types';
import { DateTimeSelector, toISODateString } from '@ui/base';
import { cn } from '@ui/lib/utils';
import { Field, FieldError, FieldGroup, FieldLabel } from '@ui/shad-cn/components/field';
import { Input } from '@ui/shad-cn/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/shad-cn/components/select';
import { useFormikContext } from 'formik';
import { AtSign, Lock, Mail } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** 44px fields – comfortable touch targets on phones (inputs default to 32px). */
const FIELD_HEIGHT = 'h-11 rounded-lg';

export interface AccountPersonalFieldsProps {
  disabled?: boolean;
  className?: string;
}

export const AccountPersonalFields: React.FC<AccountPersonalFieldsProps> = ({
  disabled,
  className,
}) => {
  const { t } = useTranslation('account');
  const formik = useFormikContext<IAccountFormValues>();

  const isSubmitting = formik?.isSubmitting ?? false;
  const isDisabled = disabled ?? isSubmitting;

  const aliasInvalid = Boolean(formik?.touched?.alias && formik?.errors?.alias);
  const firstnameInvalid = Boolean(formik?.touched?.firstname && formik?.errors?.firstname);
  const lastnameInvalid = Boolean(formik?.touched?.lastname && formik?.errors?.lastname);
  const genderInvalid = Boolean(formik?.touched?.gender && formik?.errors?.gender);
  const birthdayInvalid = Boolean(formik?.touched?.birthday && formik?.errors?.birthday);

  return (
    <FieldGroup className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Alias */}
        <Field data-invalid={aliasInvalid}>
          <FieldLabel htmlFor="account-alias">{t('form.alias')}</FieldLabel>
          <div className="relative">
            <Input
              id="account-alias"
              name="alias"
              placeholder={t('form.aliasPlaceholder')}
              value={formik?.values?.alias ?? ''}
              onChange={formik?.handleChange}
              onBlur={formik?.handleBlur}
              disabled={isDisabled}
              className={cn(FIELD_HEIGHT, 'pl-9')}
              aria-invalid={aliasInvalid}
            />
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          {aliasInvalid && <FieldError>{formik?.errors?.alias}</FieldError>}
        </Field>

        {/* Email (Readonly) */}
        <Field>
          <FieldLabel htmlFor="account-email">{t('form.email')}</FieldLabel>
          <div className="relative">
            <Input
              id="account-email"
              name="email"
              value={formik?.values?.email ?? ''}
              disabled
              className={cn(
                FIELD_HEIGHT,
                'pl-9 pr-9 bg-muted text-muted-foreground cursor-not-allowed'
              )}
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Firstname */}
        <Field data-invalid={firstnameInvalid}>
          <FieldLabel htmlFor="account-firstname">{t('form.firstname')}</FieldLabel>
          <Input
            id="account-firstname"
            name="firstname"
            placeholder={t('form.firstnamePlaceholder')}
            value={formik?.values?.firstname ?? ''}
            onChange={formik?.handleChange}
            onBlur={formik?.handleBlur}
            disabled={isDisabled}
            className={FIELD_HEIGHT}
            aria-invalid={firstnameInvalid}
          />
          {firstnameInvalid && <FieldError>{formik?.errors?.firstname}</FieldError>}
        </Field>

        {/* Lastname */}
        <Field data-invalid={lastnameInvalid}>
          <FieldLabel htmlFor="account-lastname">{t('form.lastname')}</FieldLabel>
          <Input
            id="account-lastname"
            name="lastname"
            placeholder={t('form.lastnamePlaceholder')}
            value={formik?.values?.lastname ?? ''}
            onChange={formik?.handleChange}
            onBlur={formik?.handleBlur}
            disabled={isDisabled}
            className={FIELD_HEIGHT}
            aria-invalid={lastnameInvalid}
          />
          {lastnameInvalid && <FieldError>{formik?.errors?.lastname}</FieldError>}
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Gender */}
        <Field data-invalid={genderInvalid}>
          <FieldLabel htmlFor="account-gender">{t('form.gender')}</FieldLabel>
          <Select
            disabled={isDisabled}
            value={formik?.values?.gender || 'unknown'}
            onValueChange={val => formik?.setFieldValue('gender', val)}
          >
            <SelectTrigger id="account-gender" className={cn(FIELD_HEIGHT, 'w-full')}>
              <SelectValue placeholder={t('form.genderPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t('form.genderMale')}</SelectItem>
              <SelectItem value="female">{t('form.genderFemale')}</SelectItem>
              <SelectItem value="unknown">{t('form.genderUnknown')}</SelectItem>
            </SelectContent>
          </Select>
          {genderInvalid && <FieldError>{formik?.errors?.gender}</FieldError>}
        </Field>

        {/* Birthday – wheel picker (bottom sheet on phones, popover on desktop) */}
        <Field data-invalid={birthdayInvalid}>
          <FieldLabel htmlFor="account-birthday">{t('form.birthday')}</FieldLabel>
          <DateTimeSelector
            id="account-birthday"
            presentation={'drawer'}
            mode="date"
            // Date-only: ignore a possible time/UTC suffix from the backend.
            value={formik?.values?.birthday ? formik.values.birthday.slice(0, 10) : null}
            onChange={date => {
              void formik?.setFieldValue('birthday', date ? toISODateString(date) : '');
            }}
            onBlur={() => {
              void formik?.setFieldTouched('birthday', true, false);
            }}
            min="1900-01-01"
            max={new Date()}
            defaultViewDate="2000-01-01"
            title={t('form.birthday')}
            showAge
            clearable
            disabled={isDisabled}
            invalid={birthdayInvalid}
            className={cn(FIELD_HEIGHT, 'px-3 md:text-sm')}
          />
          {birthdayInvalid && <FieldError>{formik?.errors?.birthday}</FieldError>}
        </Field>
      </div>
    </FieldGroup>
  );
};
