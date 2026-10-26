import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  ChoiceField,
  ItemsField,
  TextAreaField,
  TextField,
  ToggleField,
  UrlField,
} from './BlockFields';
import { RATIO_CLASS } from './image.utils';
import { ImageField } from './ImageField';
import {
  emptyCard,
  type ICardsBlockData,
  type IEditableImageData,
  type IImageBlockData,
  IMAGE_RATIOS,
  type ImageRatio,
  type ISplitBlockData,
  SITE_PAGE_CARDS_MAX,
  SPLIT_RATIOS,
} from './types';

interface IEditorProps<T> {
  data: T;
  onChange: (data: T) => void;
  disabled?: boolean;
}

const fieldSetter = <T extends object>(data: T, onChange: (data: T) => void) =>
  function set<K extends keyof T>(key: K) {
    return (value: T[K]) => onChange({ ...data, [key]: value });
  };

/** "16/9" → "16:9", `auto` → "Original". */
const useRatioText = () => {
  const { t } = useTranslation('admin');
  return (ratio: ImageRatio) =>
    ratio === 'auto' ? t('blocks.ratio.auto') : ratio.replace('/', ':');
};

/**
 * Image with non-destructive editing (crop, filters … – the original stays) and focus point,
 * same behaviour as the banner. Every upload is tracked by the editor's image session.
 */
const EditableImageField = <T extends IEditableImageData>({
  label,
  hint,
  data,
  onChange,
  withFocus,
  aspect,
  disabled,
}: IEditorProps<T> & {
  label: string;
  hint?: string;
  /** Offer the focus point (only when the image is cropped). */
  withFocus: boolean;
  aspect?: string;
}) => (
  <ImageField
    label={label}
    hint={hint}
    value={data.imageUrl}
    aspect={aspect}
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
      // Focus only resets when crop / rotation changed the picture's geometry.
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
    focus={withFocus ? { x: data.focusX, y: data.focusY } : undefined}
    onFocusChange={
      withFocus ? focus => onChange({ ...data, focusX: focus.x, focusY: focus.y }) : undefined
    }
    disabled={disabled}
  />
);

/** Alt text with a gentle warning while it is missing. */
const AltField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  return (
    <TextField
      label={t('blocks.field.alt')}
      hint={value.trim() ? t('blocks.field.altHint') : t('blocks.field.altMissing')}
      value={value}
      onChange={onChange}
      max={300}
      disabled={disabled}
    />
  );
};

/* ---------------------------------------------------------------- image */

export const ImageBlockEditor: React.FC<IEditorProps<IImageBlockData>> = ({
  data,
  onChange,
  disabled,
}) => {
  const { t } = useTranslation('admin');
  const ratioText = useRatioText();
  const set = fieldSetter(data, onChange);
  const cropped = data.ratio !== 'auto';
  return (
    <>
      <EditableImageField
        label={t('blocks.field.image')}
        data={data}
        onChange={onChange}
        withFocus={cropped}
        aspect={cropped ? RATIO_CLASS[data.ratio as keyof typeof RATIO_CLASS] : undefined}
        disabled={disabled}
      />
      {data.imageUrl && <AltField value={data.alt} onChange={set('alt')} disabled={disabled} />}
      <TextAreaField
        label={t('blocks.field.caption')}
        value={data.caption}
        onChange={set('caption')}
        max={300}
        rows={2}
        disabled={disabled}
      />
      <ChoiceField
        label={t('blocks.field.format')}
        value={data.ratio}
        options={IMAGE_RATIOS}
        onChange={set('ratio')}
        text={ratioText}
        disabled={disabled}
      />
      <ToggleField
        label={t('blocks.image.wide')}
        hint={t('blocks.image.wideHint')}
        value={data.wide}
        onChange={set('wide')}
        disabled={disabled}
      />
    </>
  );
};

/* ---------------------------------------------------------------- split */

export const SplitBlockEditor: React.FC<IEditorProps<ISplitBlockData>> = ({
  data,
  onChange,
  disabled,
}) => {
  const { t } = useTranslation('admin');
  const ratioText = useRatioText();
  const set = fieldSetter(data, onChange);
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
        max={1500}
        rows={5}
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
      <EditableImageField
        label={t('blocks.field.image')}
        data={data}
        onChange={onChange}
        withFocus
        aspect={RATIO_CLASS[data.ratio]}
        disabled={disabled}
      />
      {data.imageUrl && <AltField value={data.alt} onChange={set('alt')} disabled={disabled} />}
      <ChoiceField
        label={t('blocks.field.format')}
        value={data.ratio}
        options={SPLIT_RATIOS}
        onChange={set('ratio')}
        text={ratioText}
        disabled={disabled}
      />
      <ChoiceField
        label={t('blocks.split.imageSide')}
        value={data.imageSide}
        options={['left', 'right'] as const}
        onChange={set('imageSide')}
        text={value => t(`blocks.position.h.${value}`)}
        disabled={disabled}
      />
    </>
  );
};

/* ---------------------------------------------------------------- cards */

export const CardsBlockEditor: React.FC<IEditorProps<ICardsBlockData>> = ({
  data,
  onChange,
  disabled,
}) => {
  const { t } = useTranslation('admin');
  const set = fieldSetter(data, onChange);
  return (
    <>
      <TextField
        label={t('blocks.field.heading')}
        value={data.title}
        onChange={set('title')}
        max={150}
        disabled={disabled}
      />
      <ChoiceField
        label={t('blocks.cards.columns')}
        value={data.columns}
        options={['1', '2', '3'] as const}
        onChange={set('columns')}
        text={value => t('blocks.cards.columnsValue', { count: Number(value) })}
        disabled={disabled}
      />
      <ItemsField
        label={t('blocks.cards.items')}
        items={data.items}
        onChange={set('items')}
        create={emptyCard}
        max={SITE_PAGE_CARDS_MAX}
        title={item => item.title || t('blocks.cards.item')}
        addLabel={t('blocks.cards.add')}
        disabled={disabled}
        render={(item, update) => (
          <>
            <ImageField
              label={t('blocks.field.imageOptional')}
              value={item.imageUrl}
              onChange={imageUrl => update({ ...item, imageUrl })}
              aspect="aspect-video"
              disabled={disabled}
            />
            {item.imageUrl && (
              <AltField
                value={item.alt}
                onChange={alt => update({ ...item, alt })}
                disabled={disabled}
              />
            )}
            <TextField
              label={t('blocks.field.title')}
              value={item.title}
              onChange={title => update({ ...item, title })}
              max={120}
              disabled={disabled}
            />
            <TextAreaField
              label={t('blocks.field.text')}
              value={item.text}
              onChange={text => update({ ...item, text })}
              max={500}
              disabled={disabled}
            />
            <UrlField
              label={t('blocks.field.linkUrl')}
              value={item.linkUrl}
              onChange={linkUrl => update({ ...item, linkUrl })}
              disabled={disabled}
            />
            {item.linkUrl && (
              <TextField
                label={t('blocks.field.linkLabel')}
                hint={t('blocks.cards.linkHint')}
                value={item.linkLabel}
                onChange={linkLabel => update({ ...item, linkLabel })}
                max={60}
                disabled={disabled}
              />
            )}
          </>
        )}
      />
    </>
  );
};
