import i18n from '@core/i18n';
import { type FormikConfig, useFormik } from 'formik';

import type { IPluginFieldRule, IPluginForm, IPluginFormConfig } from './plugin.types';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** English fallback, used when the host has no translation for the key. */
const DEFAULTS: Record<string, string> = {
  required: 'Required',
  minLength: 'At least {{min}} characters',
  maxLength: 'At most {{max}} characters',
  min: 'At least {{min}}',
  max: 'At most {{max}}',
  email: 'Invalid email address',
  pattern: 'Invalid format',
};

/** The plugin's own text wins, then the host translation, then the English fallback. */
const message = (key: string, values: Record<string, unknown>, custom?: string): string =>
  custom ?? String(i18n.t(`validation.${key}`, { ns: 'plugin', defaultValue: DEFAULTS[key], ...values }));

/** Checks one value against one rule. Only `required` looks at empty values; the others skip them. */
const checkField = (value: unknown, rule: IPluginFieldRule): string | undefined => {
  const raw = value === undefined || value === null ? '' : String(value);
  const empty = raw.trim() === '';
  if (rule.required && empty) return message('required', {}, rule.message);
  if (empty) return undefined;
  if (rule.minLength !== undefined && raw.length < rule.minLength) {
    return message('minLength', { min: rule.minLength }, rule.message);
  }
  if (rule.maxLength !== undefined && raw.length > rule.maxLength) {
    return message('maxLength', { max: rule.maxLength }, rule.message);
  }
  const number = Number(raw);
  if (rule.min !== undefined && (Number.isNaN(number) || number < rule.min)) {
    return message('min', { min: rule.min }, rule.message);
  }
  if (rule.max !== undefined && (Number.isNaN(number) || number > rule.max)) {
    return message('max', { max: rule.max }, rule.message);
  }
  if (rule.email && !EMAIL.test(raw)) return message('email', {}, rule.message);
  if (rule.pattern && !rule.pattern.test(raw)) return message('pattern', {}, rule.message);
  return undefined;
};

/** Turns the declarative rules of `api.useForm` into one validate function. */
const validateRules = <V extends Record<string, unknown>>(rules: IPluginFormConfig<V>['rules']) => (values: V) => {
  const errors: Record<string, string> = {};
  for (const [field, rule] of Object.entries(rules ?? {})) {
    if (!rule) continue;
    const error = checkField(values[field], rule);
    if (error) errors[field] = error;
  }
  return errors;
};

/**
 * `api.useForm`: Formik's `useFormik` with the plugin's rules. The plugin gets the raw Formik object back.
 */
export const usePluginForm = <V extends Record<string, unknown>>(config: IPluginFormConfig<V>): IPluginForm<V> => {
  const { rules, validate, ...rest } = config;
  const validateAll = (values: V) => ({
    ...validateRules(rules)(values),
    ...(validate ? validate(values) : {}),
  });
  return useFormik<V>({ ...rest, validate: validateAll } as unknown as FormikConfig<V>) as unknown as IPluginForm<V>;
};
