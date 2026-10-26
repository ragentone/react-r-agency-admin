import * as Yup from 'yup';

export const createPasswordChangeValidationSchema = (
  t?: (key: string, options?: Record<string, unknown>) => string
) =>
  Yup.object().shape({
    currentPassword: Yup.string().required(
      t ? t('validation.currentPasswordRequired') : 'Current password is required'
    ),
    newPassword: Yup.string()
      .min(
        6,
        t ? t('validation.passwordMin', { min: 6 }) : 'Password must be at least 6 characters'
      )
      .required(t ? t('validation.passwordRequired') : 'Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], t ? t('validation.passwordMatch') : 'Passwords must match')
      .required(t ? t('validation.confirmPasswordRequired') : 'Confirm password is required'),
  });

export const passwordChangeValidationSchema = createPasswordChangeValidationSchema();
