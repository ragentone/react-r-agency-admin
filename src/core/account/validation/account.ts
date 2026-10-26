import { UserAliasExistsQuery } from '@core/auth/graphql/exists.ts';
import type { useGraphQl } from '@core/mesh';
import * as Yup from 'yup';

/** Max. visible characters of "About me" (HTML tags don't count). */
export const ACCOUNT_DESCRIPTION_MAX_LENGTH = 500;

/** Visible text length of an HTML string – same counting as the editor's character counter. */
export const htmlTextLength = (html: string | null | undefined): number => {
  if (!html) return 0;
  if (typeof DOMParser === 'undefined') return html.replace(/<[^>]*>/g, '').length;
  return (new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '').length;
};

type TFn = (key: string, options?: Record<string, unknown>) => string;

export interface IAliasCheckOptions {
  /** GraphQL query fn (`useGraphQl().query`) – without it the alias isn't checked online. */
  query?: ReturnType<typeof useGraphQl>['query'];
  /** The user's current alias – keeping it is always allowed. */
  currentAlias?: string | null;
}

/** Answers per alias (lower case) – validation runs on every keystroke, ask the backend once. */
const aliasExistsCache = new Map<string, boolean>();

/** Alias rules + "already taken" check (`userAliasExists`), own alias excluded. */
const aliasSchema = (t?: TFn, options: IAliasCheckOptions = {}) =>
  Yup.string()
    .trim()
    .min(3, t ? t('validation.aliasMin', { min: 3 }) : 'Alias must be at least 3 characters')
    .max(16, t ? t('validation.aliasMax', { max: 16 }) : 'Alias must be at most 16 characters')
    .required(t ? t('validation.aliasRequired') : 'Alias is required')
    .test(
      'alias-exists',
      t ? t('validation.aliasExists') : 'This alias is already taken',
      async value => {
        const alias = value?.trim();
        const { query, currentAlias } = options;
        if (!alias || alias.length < 3 || alias.length > 16 || !query) return true;
        if (currentAlias && alias.toLowerCase() === currentAlias.trim().toLowerCase()) return true;

        const key = alias.toLowerCase();
        const known = aliasExistsCache.get(key);
        if (known !== undefined) return !known;
        try {
          const response = await query({ query: UserAliasExistsQuery, variables: { alias } });
          const exists = Boolean(response.data?.userAliasExists?.exists);
          aliasExistsCache.set(key, exists);
          return !exists;
        } catch {
          // Backend not reachable → don't block; the update itself still validates.
          return true;
        }
      }
    );

const descriptionSchema = (t?: TFn) =>
  Yup.string()
    .nullable()
    .optional()
    .test(
      'description-max-text',
      t
        ? t('validation.descriptionMax', { max: ACCOUNT_DESCRIPTION_MAX_LENGTH })
        : `About me must be at most ${ACCOUNT_DESCRIPTION_MAX_LENGTH} characters`,
      value => htmlTextLength(value) <= ACCOUNT_DESCRIPTION_MAX_LENGTH
    );

export const createProfileValidationSchema = (
  t?: (key: string, options?: Record<string, unknown>) => string,
  aliasCheck?: IAliasCheckOptions
) =>
  Yup.object().shape({
    alias: aliasSchema(t, aliasCheck),
    firstname: Yup.string().nullable().optional(),
    lastname: Yup.string().nullable().optional(),
    gender: Yup.string().required(t ? t('validation.genderRequired') : 'Gender is required'),
    birthday: Yup.string().nullable().optional(),
    description: descriptionSchema(t),
  });

export const createPrivacyValidationSchema = () =>
  Yup.object().shape({
    public: Yup.boolean().optional(),
    searchable: Yup.boolean().optional(),
    showEmail: Yup.boolean().optional(),
    showFullName: Yup.boolean().optional(),
  });

export const createAccountValidationSchema = (
  t?: (key: string, options?: Record<string, unknown>) => string,
  aliasCheck?: IAliasCheckOptions
) =>
  Yup.object().shape({
    alias: aliasSchema(t, aliasCheck),
    firstname: Yup.string().nullable().optional(),
    lastname: Yup.string().nullable().optional(),
    gender: Yup.string().required(t ? t('validation.genderRequired') : 'Gender is required'),
    birthday: Yup.string().nullable().optional(),
    description: descriptionSchema(t),
    public: Yup.boolean().optional(),
    searchable: Yup.boolean().optional(),
    showEmail: Yup.boolean().optional(),
    showFullName: Yup.boolean().optional(),
  });

export const profileValidationSchema = createProfileValidationSchema();
export const privacyValidationSchema = createPrivacyValidationSchema();
export const accountValidationSchema = createAccountValidationSchema();
