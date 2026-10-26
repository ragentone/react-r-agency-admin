import * as Yup from 'yup';

export const createLoginValidationSchema = (
  t?: (key: string, options?: Record<string, unknown>) => string
) =>
  Yup.object().shape({
    email: Yup.string()
      .email(t ? t('validation.emailInvalid') : 'Please enter a valid email address')
      .required(t ? t('validation.emailRequired') : 'Email is required'),
    password: Yup.string()
      .min(
        6,
        t ? t('validation.passwordMin', { min: 6 }) : 'Password must be at least 6 characters'
      )
      .required(t ? t('validation.passwordRequired') : 'Password is required'),
    userType: Yup.string().optional(),
  });

export const loginValidationSchema = createLoginValidationSchema();
