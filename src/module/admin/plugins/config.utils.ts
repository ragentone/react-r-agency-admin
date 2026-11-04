import type {
  IPluginConfigField,
  PluginConfigPrimitive,
  PluginConfigText,
  PluginConfigValues,
} from './types';

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

/**
 * Text for the current language. Plain text is used as it is; otherwise the language, then English,
 * then any text that exists. Undefined when there is no text at all.
 */
export const localizedText = (text: PluginConfigText | undefined, language: string): string | undefined => {
  if (text === undefined || typeof text === 'string') return text;
  const short = language.slice(0, 2) as keyof typeof text;
  return text[short] ?? text.en ?? Object.values(text).find(value => value !== undefined);
};
