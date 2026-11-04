import type { IPluginConfigField, PluginConfigPrimitive, PluginConfigValues } from './types';

/** Same rule as the runtime: a field is shown when its `showIf` matches the current values. */
export const isFieldVisible = (field: IPluginConfigField, values: PluginConfigValues): boolean =>
  !field.showIf || values[field.showIf.key] === field.showIf.equals;

/** Sets a value; an empty value removes the key ("not set"). Returns a new object. */
export const withValue = (
  values: PluginConfigValues,
  key: string,
  value: PluginConfigPrimitive | undefined
): PluginConfigValues => {
  const next = { ...values };
  if (value === undefined || value === '') {
    delete next[key];
  } else {
    next[key] = value;
  }
  return next;
};

/** Values of all fields that have a default. */
export const defaultsOf = (fields: IPluginConfigField[]): PluginConfigValues => {
  const values: PluginConfigValues = {};
  for (const field of fields) {
    if (field.default !== undefined) values[field.key] = field.default;
  }
  return values;
};
