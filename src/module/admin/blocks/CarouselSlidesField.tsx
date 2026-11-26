import React from 'react';
import { useTranslation } from 'react-i18next';

import { TextField } from './BlockFields';
import { CropImageField } from './CropImageField';
import { RATIO_CLASS } from './image.utils';
import { ItemsCarouselField } from './ItemsCarouselField';
import { AltField } from './MediaBlockEditors';
import { emptySlide, type ICarouselBlockData, SITE_PAGE_CAROUSEL_MAX } from './types';

interface IProps {
  data: ICarouselBlockData;
  onChange: (data: ICarouselBlockData) => void;
  disabled?: boolean;
}

/** The slides of the carousel block as a carousel of cards (image crop, alt text, caption). */
export const CarouselSlidesField: React.FC<IProps> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  return (
    <ItemsCarouselField
      label={t('blocks.carousel.items')}
      items={data.items}
      onChange={items => onChange({ ...data, items })}
      create={emptySlide}
      max={SITE_PAGE_CAROUSEL_MAX}
      addLabel={t('blocks.carousel.add')}
      title={item => item.caption}
      disabled={disabled}
      render={(item, update) => (
        <>
          <CropImageField
            label={t('blocks.field.image')}
            value={item.imageUrl}
            onChange={imageUrl => update({ ...item, imageUrl })}
            ratio={data.ratio}
            aspect={RATIO_CLASS[data.ratio]}
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
            label={t('blocks.field.caption')}
            value={item.caption}
            onChange={caption => update({ ...item, caption })}
            max={200}
            disabled={disabled}
          />
        </>
      )}
    />
  );
};
