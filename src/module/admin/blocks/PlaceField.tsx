import { cn } from '@ui/lib/utils';
import { PlaceAutocomplete } from '@ui/shad-cn/components/place-autocomplete';
import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';

const LABEL =
  'mb-1.5 flex items-center justify-between gap-2 text-caption font-medium text-foreground';
/** Languages the place search (Photon) answers in – anything else falls back to English. */
const SEARCH_LANGS = ['de', 'en', 'fr', 'it'];

/**
 * Place / address with suggestions while typing (`PlaceAutocomplete`, OpenStreetMap data).
 * Free text stays possible – a chosen suggestion fills in the formatted address.
 */
export const PlaceField: React.FC<{
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  max: number;
  placeholder?: string;
  disabled?: boolean;
}> = ({ label, hint, value, onChange, max, placeholder, disabled }) => {
  const { t, i18n } = useTranslation('admin');
  const id = useId();
  const lang = i18n.language.slice(0, 2);
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        <span>{label}</span>
        <span
          className={cn(
            'text-caption font-normal tabular-nums',
            value.length >= max ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          {value.length} / {max}
        </span>
      </label>
      <PlaceAutocomplete
        id={id}
        value={value}
        onChange={next => onChange(next.slice(0, max))}
        lang={SEARCH_LANGS.includes(lang) ? lang : 'en'}
        limit={5}
        maxLength={max}
        placeholder={placeholder ?? t('blocks.place.placeholder')}
        autoComplete="off"
        disabled={disabled}
      />
      {hint && <p className="mt-1 text-caption text-muted-foreground">{hint}</p>}
    </div>
  );
};
