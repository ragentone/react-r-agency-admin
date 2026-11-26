import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Crop, ImagePlus, Loader2, X } from 'lucide-react';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { SITE_PAGE_IMAGE_ACCEPT } from '../hooks/use.admin.page.image';
import { useCropImage } from './useCropImage';

const LABEL = 'mb-1.5 block text-caption font-medium text-foreground';
const OVERLAY = 'bg-background/90 shadow-sm backdrop-blur';

export interface ICropImageFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  /** Fixed format (`'4/3'`) – the image is cropped to it before it is uploaded. */
  ratio: string;
  /** Tailwind aspect class of the preview. */
  aspect: string;
  disabled?: boolean;
}

/** Block image with the workflow select → compress → crop (to `ratio`) → upload. */
export const CropImageField: React.FC<ICropImageFieldProps> = ({
  label,
  hint,
  value,
  onChange,
  ratio,
  aspect,
  disabled,
}) => {
  const { t } = useTranslation('admin');
  const input = useRef<HTMLInputElement>(null);
  const { pick, recrop, busy, dialog } = useCropImage(ratio, onChange);
  const locked = disabled || busy;
  const open = () => input.current?.click();
  return (
    <div>
      <p className={LABEL}>{label}</p>
      <input
        ref={input}
        type="file"
        accept={SITE_PAGE_IMAGE_ACCEPT}
        className="hidden"
        onChange={e => {
          void pick(Array.from(e.target.files ?? []).slice(0, 1));
          e.target.value = '';
        }}
      />
      {value ? (
        <div
          className={cn(
            'relative overflow-hidden rounded-xl border border-border/50 bg-muted',
            aspect
          )}
        >
          <img src={value} alt="" draggable={false} className="size-full object-cover" />
          <div className="absolute top-2 right-2 flex gap-1.5">
            <Button
              type="button"
              size="sm"
              pill
              variant="secondary"
              onClick={() => void recrop(value)}
              disabled={locked}
              className={OVERLAY}
            >
              {busy ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Crop aria-hidden="true" />
              )}
              {t('blocks.crop.action')}
            </Button>
            <Button
              type="button"
              size="icon-sm"
              pill
              variant="secondary"
              onClick={open}
              disabled={locked}
              aria-label={t('blocks.field.imageReplace')}
              className={OVERLAY}
            >
              <ImagePlus />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              pill
              variant="secondary"
              onClick={() => onChange('')}
              disabled={locked}
              aria-label={t('blocks.field.imageRemove')}
              className={OVERLAY}
            >
              <X />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={open}
          disabled={locked}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/50 text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-50',
            aspect
          )}
        >
          {busy ? (
            <Loader2 className="size-6 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="size-6" aria-hidden="true" />
          )}
          <span className="text-body font-semibold">
            {busy ? t('blocks.field.imageUploading') : t('blocks.field.imageUpload')}
          </span>
          <span className="text-caption">{t('blocks.field.imageFormats')}</span>
        </button>
      )}
      {dialog}
      {hint && <p className="mt-1.5 text-caption text-muted-foreground">{hint}</p>}
    </div>
  );
};
