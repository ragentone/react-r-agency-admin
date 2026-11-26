import { PlaceAutocomplete } from '@ui/shad-cn/components/place-autocomplete';
import { MapPin, X } from 'lucide-react';
import React, { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ChoiceField, NumberField, TextField } from './BlockFields';
import { hasMapPosition, type IMapBlockData, MAP_RATIOS } from './types';

interface IProps {
  data: IMapBlockData;
  onChange: (data: IMapBlockData) => void;
  disabled?: boolean;
}

/** Search languages of the place search (Photon) – anything else falls back to English. */
const SEARCH_LANGS = ['de', 'en', 'fr', 'it'];
const LABEL = 'mb-1.5 block text-caption font-medium text-foreground';
const MAX = 200;

/** One place: pick a search result (address + coordinates), zoom and format. */
export const MapBlockEditor: React.FC<IProps> = ({ data, onChange, disabled }) => {
  const { t, i18n } = useTranslation('admin');
  const id = useId();
  const lang = i18n.language.slice(0, 2);
  // Typing and picking a result fire back to back – patch the latest data, not a stale copy.
  const latest = useRef(data);
  useEffect(() => {
    latest.current = data;
  }, [data]);
  const patch = (next: Partial<IMapBlockData>) => {
    latest.current = { ...latest.current, ...next };
    onChange(latest.current);
  };
  const positioned = hasMapPosition(data);
  return (
    <>
      <TextField
        label={t('blocks.field.heading')}
        value={data.title}
        onChange={title => patch({ title })}
        max={150}
        disabled={disabled}
      />
      <div>
        <label htmlFor={id} className={LABEL}>
          {t('blocks.map.address')}
        </label>
        <PlaceAutocomplete
          id={id}
          value={data.address}
          onChange={address => patch({ address: address.slice(0, MAX) })}
          onPlaceSelect={feature => {
            const [lon, lat] = feature.geometry.coordinates;
            patch({ lat: Math.round(lat * 1e6) / 1e6, lon: Math.round(lon * 1e6) / 1e6 });
          }}
          lang={SEARCH_LANGS.includes(lang) ? lang : 'en'}
          limit={5}
          maxLength={MAX}
          placeholder={t('blocks.place.placeholder')}
          autoComplete="off"
          disabled={disabled}
        />
        <div className="mt-2 flex items-center gap-2 text-caption text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate tabular-nums">
            {positioned
              ? `${data.lat.toFixed(5)}, ${data.lon.toFixed(5)}`
              : t('blocks.map.noPosition')}
          </span>
          {positioned && (
            <button
              type="button"
              onClick={() => patch({ lat: 0, lon: 0 })}
              disabled={disabled}
              aria-label={t('blocks.map.clearPosition')}
              className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-foreground/10"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>
      <NumberField
        label={t('blocks.map.zoom')}
        hint={t('blocks.map.zoomHint')}
        value={data.zoom}
        onChange={zoom => patch({ zoom })}
        min={1}
        max={19}
        step={1}
        disabled={disabled}
      />
      <ChoiceField
        label={t('blocks.field.ratio')}
        value={data.ratio}
        options={MAP_RATIOS}
        onChange={ratio => patch({ ratio })}
        text={value => value.replace('/', ':')}
        disabled={disabled}
      />
      <TextField
        label={t('blocks.field.caption')}
        value={data.caption}
        onChange={caption => patch({ caption })}
        max={300}
        disabled={disabled}
      />
    </>
  );
};
