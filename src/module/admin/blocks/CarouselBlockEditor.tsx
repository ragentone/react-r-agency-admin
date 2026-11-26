import { Button } from '@ui/shad-cn/components/button.tsx';
import { ImagePlus, Loader2 } from 'lucide-react';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { SITE_PAGE_IMAGE_ACCEPT } from '../hooks/use.admin.page.image';
import { ItemsField, TextField } from './BlockFields';
import { CarouselSettings } from './CarouselSettings';
import { CropImageField } from './CropImageField';
import { RATIO_CLASS } from './image.utils';
import { AltField } from './MediaBlockEditors';
import { emptySlide, type ICarouselBlockData, SITE_PAGE_CAROUSEL_MAX } from './types';
import { useCropImage } from './useCropImage';

interface IProps {
  data: ICarouselBlockData;
  onChange: (data: ICarouselBlockData) => void;
  disabled?: boolean;
}

/**
 * Several images at once: select → compress → crop (one after the other, in the carousel
 * format) → upload. Empty slides are filled first, then new ones are appended.
 */
const useAddMany = (data: ICarouselBlockData, onChange: IProps['onChange']) =>
  useCropImage(data.ratio, imageUrl => {
    const items = [...data.items];
    const empty = items.findIndex(item => !item.imageUrl);
    if (empty >= 0) items[empty] = { ...items[empty], imageUrl };
    else if (items.length < SITE_PAGE_CAROUSEL_MAX) items.push({ ...emptySlide(), imageUrl });
    onChange({ ...data, items });
  });

export const CarouselBlockEditor: React.FC<IProps> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const input = useRef<HTMLInputElement>(null);
  const { pick, busy, dialog } = useAddMany(data, onChange);
  const locked = disabled || busy;
  return (
    <>
      <TextField
        label={t('blocks.field.heading')}
        value={data.title}
        onChange={title => onChange({ ...data, title })}
        max={150}
        disabled={locked}
      />
      <div>
        <input
          ref={input}
          type="file"
          multiple
          accept={SITE_PAGE_IMAGE_ACCEPT}
          className="hidden"
          onChange={e => {
            void pick(Array.from(e.target.files ?? []).slice(0, SITE_PAGE_CAROUSEL_MAX));
            e.target.value = '';
          }}
        />
        <Button
          type="button"
          variant="outline"
          pill
          className="h-11 w-full"
          onClick={() => input.current?.click()}
          disabled={locked || data.items.length >= SITE_PAGE_CAROUSEL_MAX}
        >
          {busy ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus aria-hidden="true" />
          )}
          {t('blocks.carousel.addMany')}
        </Button>
        <p className="mt-1 text-caption text-muted-foreground">{t('blocks.carousel.hint')}</p>
      </div>
      {dialog}
      <CarouselSettings data={data} onChange={onChange} disabled={locked} />
      <ItemsField
        label={t('blocks.carousel.items')}
        items={data.items}
        onChange={items => onChange({ ...data, items })}
        create={emptySlide}
        max={SITE_PAGE_CAROUSEL_MAX}
        title={(item, index) => item.caption || `${t('blocks.carousel.item')} ${index + 1}`}
        addLabel={t('blocks.carousel.add')}
        disabled={locked}
        render={(item, update) => (
          <>
            <CropImageField
              label={t('blocks.field.image')}
              value={item.imageUrl}
              onChange={imageUrl => update({ ...item, imageUrl })}
              ratio={data.ratio}
              aspect={RATIO_CLASS[data.ratio]}
              disabled={locked}
            />
            {item.imageUrl && (
              <AltField
                value={item.alt}
                onChange={alt => update({ ...item, alt })}
                disabled={locked}
              />
            )}
            <TextField
              label={t('blocks.field.caption')}
              value={item.caption}
              onChange={caption => update({ ...item, caption })}
              max={200}
              disabled={locked}
            />
          </>
        )}
      />
    </>
  );
};
