import React from 'react';
import { useTranslation } from 'react-i18next';

import { ChoiceField, NumberField, ToggleField } from './BlockFields';
import {
  CAROUSEL_PER_VIEW,
  CAROUSEL_RATIOS,
  type CarouselCaption,
  type CarouselFit,
  type ICarouselBlockData,
} from './types';

interface IProps {
  data: ICarouselBlockData;
  onChange: (data: ICarouselBlockData) => void;
  disabled?: boolean;
}

const FITS: CarouselFit[] = ['cover', 'contain'];
const CAPTIONS: CarouselCaption[] = ['below', 'overlay'];

/** Look + behaviour of the carousel (everything except the slides). */
export const CarouselSettings: React.FC<IProps> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set =
    <K extends keyof ICarouselBlockData>(key: K) =>
    (value: ICarouselBlockData[K]) =>
      onChange({ ...data, [key]: value });
  return (
    <>
      <div>
        <ChoiceField
          label={t('blocks.video.ratio')}
          value={data.ratio}
          options={CAROUSEL_RATIOS}
          onChange={set('ratio')}
          text={value => value.replace('/', ':')}
          disabled={disabled}
        />
        <p className="mt-1 text-caption text-muted-foreground">{t('blocks.carousel.ratioHint')}</p>
      </div>
      <ChoiceField
        label={t('blocks.carousel.perView')}
        value={data.perView}
        options={CAROUSEL_PER_VIEW}
        onChange={set('perView')}
        text={value => value}
        disabled={disabled}
      />
      <ChoiceField
        label={t('blocks.carousel.fit')}
        value={data.fit}
        options={FITS}
        onChange={set('fit')}
        text={value => t(`blocks.carousel.fitValue.${value}`)}
        disabled={disabled}
      />
      <ChoiceField
        label={t('blocks.carousel.caption')}
        value={data.caption}
        options={CAPTIONS}
        onChange={set('caption')}
        text={value => t(`blocks.carousel.captionValue.${value}`)}
        disabled={disabled}
      />
      <ToggleField
        label={t('blocks.carousel.arrows')}
        value={data.arrows}
        onChange={set('arrows')}
        disabled={disabled}
      />
      <ToggleField
        label={t('blocks.carousel.dots')}
        value={data.dots}
        onChange={set('dots')}
        disabled={disabled}
      />
      <ToggleField
        label={t('blocks.carousel.loop')}
        value={data.loop}
        onChange={set('loop')}
        disabled={disabled}
      />
      <ToggleField
        label={t('blocks.carousel.autoplay')}
        hint={t('blocks.carousel.autoplayHint')}
        value={data.autoplay}
        onChange={set('autoplay')}
        disabled={disabled}
      />
      {data.autoplay && (
        <NumberField
          label={t('blocks.carousel.interval')}
          value={data.interval}
          onChange={set('interval')}
          min={2}
          max={15}
          step={1}
          unit="s"
          disabled={disabled}
        />
      )}
      <ToggleField
        label={t('blocks.carousel.rounded')}
        value={data.rounded}
        onChange={set('rounded')}
        disabled={disabled}
      />
      <ToggleField
        label={t('blocks.carousel.wide')}
        value={data.wide}
        onChange={set('wide')}
        disabled={disabled}
      />
    </>
  );
};
