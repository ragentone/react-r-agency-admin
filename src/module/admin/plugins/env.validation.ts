import type { TFunction } from 'i18next';
import * as yup from 'yup';

import type { IEnvRow } from './env.format';

export interface IEnvFormValues {
  rows: IEnvRow[];
}

const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Formik validation of env rows: keys required, shaped like env names and unique. */
export const createEnvValidationSchema = (t: TFunction) =>
  yup.object({
    rows: yup
      .array()
      .of(
        yup.object({
          key: yup
            .string()
            .required(t('plugins.code.env.errors.keyRequired'))
            .matches(KEY_PATTERN, t('plugins.code.env.errors.keyInvalid')),
          value: yup.string().default(''),
        })
      )
      .test('unique-keys', t('plugins.code.env.errors.keyDuplicate'), rows => {
        const keys = (rows ?? []).map(row => row?.key ?? '');
        return new Set(keys).size === keys.length;
      }),
  });
