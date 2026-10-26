import * as Yup from 'yup';

export const createDeleteUserValidationSchema = (
  t?: (key: string, options?: Record<string, unknown>) => string
) =>
  Yup.object().shape({
    password: Yup.string().required(t ? t('validation.passwordRequired') : 'Password is required'),
  });

export const deleteUserValidationSchema = createDeleteUserValidationSchema();
