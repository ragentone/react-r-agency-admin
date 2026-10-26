import { Slider } from '@ui/shad-cn/components/slider.tsx';
import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { ChoiceField, TextAreaField, TextField, ToggleField, UrlField } from './BlockFields';
import { ImageField } from './ImageField';
import type { IHeroBlockData } from './types';

/** Banner settings: content first, then image, then look. */
export const HeroEditor: React.FC<{
  data: IHeroBlockData;
  onChange: (data: IHeroBlockData) => void;
  disabled?: boolean;
}> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const overlayId = useId();
  const set =
    <K extends keyof IHeroBlockData>(key: K) =>
    (value: IHeroBlockData[K]) =>
      onChange({ ...data, [key]: value });
  const image = Boolean(data.imageUrl);

  return (
    <>
      <TextField
        label={t('blocks.field.title')}
        value={data.title}
        onChange={set('title')}
        max={150}
        disabled={disabled}
      />
      <TextAreaField
        label={t('blocks.field.text')}
        value={data.text}
        onChange={set('text')}
        max={500}
        disabled={disabled}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t('blocks.field.buttonLabel')}
          value={data.buttonLabel}
          onChange={set('buttonLabel')}
          max={60}
          disabled={disabled}
        />
        <UrlField
          label={t('blocks.field.buttonUrl')}
          value={data.buttonUrl}
          onChange={set('buttonUrl')}
          disabled={disabled}
        />
      </div>

      <ImageField
        label={t('blocks.field.imageOptional')}
        hint={t('blocks.hero.imageHint')}
        value={data.imageUrl}
        onChange={url =>
          // New / removed image → no edit history, focus back to the centre.
          onChange({
            ...data,
            imageUrl: url,
            imageOriginal: '',
            imageEdit: null,
            focusX: 50,
            focusY: 50,
          })
        }
        original={data.imageOriginal}
        editState={data.imageEdit}
        onEdited={next => {
          // Focus only resets when the crop / rotation changed the picture's geometry.
          const geometry = (state: Record<string, unknown> | null) =>
            JSON.stringify([state?.cropPercent, state?.transform, state?.aspectRatio]);
          const state = next.state as unknown as Record<string, unknown> | null;
          const moved = geometry(data.imageEdit) !== geometry(state);
          onChange({
            ...data,
            imageUrl: next.url,
            imageOriginal: next.original,
            imageEdit: state,
            ...(moved ? { focusX: 50, focusY: 50 } : {}),
          });
        }}
        focus={{ x: data.focusX, y: data.focusY }}
        onFocusChange={focus => onChange({ ...data, focusX: focus.x, focusY: focus.y })}
        disabled={disabled}
      />

      {image ? (
        <div>
          <label
            htmlFor={overlayId}
            className="mb-2.5 flex items-center justify-between gap-2 text-caption font-medium text-foreground"
          >
            <span>{t('blocks.hero.overlay')}</span>
            <span className="text-xs font-normal text-muted-foreground tabular-nums">
              {data.overlay} %
            </span>
          </label>
          <Slider
            id={overlayId}
            min={0}
            max={80}
            step={5}
            value={[data.overlay]}
            onValueChange={([value]) => set('overlay')(value ?? 0)}
            disabled={disabled}
            aria-label={t('blocks.hero.overlay')}
            className="py-2"
          />
          <p className="mt-1 text-caption text-muted-foreground">{t('blocks.hero.overlayHint')}</p>
        </div>
      ) : (
        <ChoiceField
          label={t('blocks.field.style')}
          value={data.tone}
          options={['dark', 'light'] as const}
          onChange={set('tone')}
          text={value => t(`blocks.hero.tone.${value}`)}
          disabled={disabled}
        />
      )}

      <ChoiceField
        label={t('blocks.field.height')}
        value={data.size}
        options={['sm', 'md', 'lg'] as const}
        onChange={set('size')}
        text={value => t(`blocks.size.${value}`)}
        disabled={disabled}
      />
      <ChoiceField
        label={t('blocks.field.align')}
        value={data.align}
        options={['left', 'center'] as const}
        onChange={set('align')}
        text={value => t(`blocks.align.${value}`)}
        disabled={disabled}
      />
      <ChoiceField
        label={t('blocks.hero.textPosition')}
        value={data.valign}
        options={['top', 'center', 'bottom'] as const}
        onChange={set('valign')}
        text={value => t(`blocks.position.v.${value}`)}
        disabled={disabled}
      />
      <ToggleField
        label={t('blocks.hero.rounded')}
        hint={t('blocks.hero.roundedHint')}
        value={data.rounded}
        onChange={set('rounded')}
        disabled={disabled}
      />
    </>
  );
};
