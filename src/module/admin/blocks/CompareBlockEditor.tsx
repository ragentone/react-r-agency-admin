import React from 'react';
import { useTranslation } from 'react-i18next';

import { ChoiceField, NumberField, TextField } from './BlockFields';
import { CropImageField } from './CropImageField';
import { RATIO_CLASS } from './image.utils';
import { AltField } from './MediaBlockEditors';
import { CAROUSEL_RATIOS, type ICompareBlockData } from './types';

interface IProps {
  data: ICompareBlockData;
  onChange: (data: ICompareBlockData) => void;
  disabled?: boolean;
}

/** Two images in the same format (select → compress → crop → upload each) + divider start. */
export const CompareBlockEditor: React.FC<IProps> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set =
    <K extends keyof ICompareBlockData>(key: K) =>
    (value: ICompareBlockData[K]) =>
      onChange({ ...data, [key]: value });
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
        label={t('blocks.video.ratio')}
        value={data.ratio}
        options={CAROUSEL_RATIOS}
        onChange={set('ratio')}
        text={value => value.replace('/', ':')}
        disabled={disabled}
      />
      <CropImageField
        label={t('blocks.compare.beforeImage')}
        value={data.beforeUrl}
        onChange={set('beforeUrl')}
        ratio={data.ratio}
        aspect={RATIO_CLASS[data.ratio]}
        disabled={disabled}
      />
      <TextField
        label={t('blocks.compare.beforeLabel')}
        hint={t('blocks.compare.labelHint')}
        value={data.beforeLabel}
        onChange={set('beforeLabel')}
        max={30}
        disabled={disabled}
      />
      <CropImageField
        label={t('blocks.compare.afterImage')}
        value={data.afterUrl}
        onChange={set('afterUrl')}
        ratio={data.ratio}
        aspect={RATIO_CLASS[data.ratio]}
        disabled={disabled}
      />
      <TextField
        label={t('blocks.compare.afterLabel')}
        hint={t('blocks.compare.labelHint')}
        value={data.afterLabel}
        onChange={set('afterLabel')}
        max={30}
        disabled={disabled}
      />
      <NumberField
        label={t('blocks.compare.start')}
        value={data.start}
        onChange={set('start')}
        min={0}
        max={100}
        step={5}
        unit="%"
        disabled={disabled}
      />
      {(data.beforeUrl || data.afterUrl) && (
        <AltField value={data.alt} onChange={set('alt')} disabled={disabled} />
      )}
      <TextField
        label={t('blocks.field.caption')}
        value={data.caption}
        onChange={set('caption')}
        max={300}
        disabled={disabled}
      />
    </>
  );
};
