import React from 'react';
import { useTranslation } from 'react-i18next';

import { ChoiceField, TextField } from './BlockFields';
import { CropImageField } from './CropImageField';
import { VIDEO_RATIO_CLASS } from './image.utils';
import { type IVideoBlockData, VIDEO_RATIOS, videoEmbed } from './types';

interface IProps {
  data: IVideoBlockData;
  onChange: (data: IVideoBlockData) => void;
  disabled?: boolean;
}

/** YouTube / Vimeo link, own preview image (tracked upload) and format. */
export const VideoBlockEditor: React.FC<IProps> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set =
    <K extends keyof IVideoBlockData>(key: K) =>
    (value: IVideoBlockData[K]) =>
      onChange({ ...data, [key]: value });
  const invalid = Boolean(data.url.trim()) && !videoEmbed(data.url);
  return (
    <>
      <div>
        <TextField
          label={t('blocks.video.url')}
          value={data.url}
          onChange={set('url')}
          max={500}
          placeholder="https://www.youtube.com/watch?v=…"
          disabled={disabled}
        />
        <p
          className={
            invalid
              ? 'mt-1 text-caption text-destructive'
              : 'mt-1 text-caption text-muted-foreground'
          }
        >
          {invalid ? t('blocks.video.invalid') : t('blocks.video.hint')}
        </p>
      </div>
      <ChoiceField
        label={t('blocks.video.ratio')}
        value={data.ratio}
        options={VIDEO_RATIOS}
        onChange={set('ratio')}
        text={value => value.replace('/', ':')}
        disabled={disabled}
      />
      <CropImageField
        label={t('blocks.video.poster')}
        hint={t('blocks.video.posterHint')}
        value={data.posterUrl}
        onChange={set('posterUrl')}
        ratio={data.ratio}
        aspect={VIDEO_RATIO_CLASS[data.ratio]}
        disabled={disabled}
      />
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
