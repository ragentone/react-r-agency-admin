import { UserAliasExistsQuery, UserEmailExistsQuery } from '@core/auth/graphql';
import type { useGraphQl } from '@core/mesh';
import * as Yup from 'yup';

export const createCreateValidationSchema = (
  t?: (key: string, options?: Record<string, unknown>) => string,
  query?: ReturnType<typeof useGraphQl>['query']
) =>
  Yup.object().shape({
    alias: Yup.string()
      .min(3, t ? t('validation.aliasMin', { min: 3 }) : 'Alias must be at least 3 characters')
      .required(t ? t('validation.aliasRequired') : 'Alias is required')
      .test(
        'checkAliasExists',
        t ? t('validation.aliasExists') : 'Alias already exists',
        async value => {
          if (!value || value.trim().length < 3 || !query) return true;
          try {
            const response = await query({
              query: UserAliasExistsQuery,
              variables: {
                alias: value.trim(),
              },
            });
            return !response.data?.userAliasExists?.exists;
          } catch {
            return true;
          }
        }
      ),
    email: Yup.string()
      .email(t ? t('validation.emailInvalid') : 'Please enter a valid email address')
      .required(t ? t('validation.emailRequired') : 'Email is required')
      .test(
        'checkEmailExists',
        t ? t('validation.emailExists') : 'Email already exists',
        async value => {
          if (!value || !query) return true;
          const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
          if (!isValidEmail) return true;
          try {
            const response = await query({
              query: UserEmailExistsQuery,
              variables: {
                email: value.trim(),
              },
            });
            return !response.data?.userEmailExists?.exists;
          } catch {
            return true;
          }
        }
      ),
    password: Yup.string()
      .min(
        6,
        t ? t('validation.passwordMin', { min: 6 }) : 'Password must be at least 6 characters'
      )
      .required(t ? t('validation.passwordRequired') : 'Password is required'),
  });

export const createValidationSchema = createCreateValidationSchema();
