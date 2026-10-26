import * as Yup from 'yup';

export const createResetPasswordValidationSchema = (
  t?: (key: string, options?: Record<string, unknown>) => string
) =>
  Yup.object().shape({
    email: Yup.string()
      .email(t ? t('validation.emailInvalid') : 'Please enter a valid email address')
      .required(t ? t('validation.emailRequired') : 'Email is required'),
  });

export const resetPasswordValidationSchema = createResetPasswordValidationSchema();
