import { ImageCropperDialog } from '@core/media/image-cropper';
import type { CroppedImageResult } from '@core/media/image-cropper/types';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { compressPageImage, useAdminPageImageUpload } from '../hooks/use.admin.page.image';
import { usePageImageTracker } from './image.session';

/** `'4/3'` → 1.333 (width / height). */
export const ratioValue = (ratio: string): number => {
  const [w, h] = ratio.split('/').map(Number);
  return w && h ? w / h : 1;
};

type Source = File | Blob;
interface ICurrent {
  image: Source;
  index: number;
  total: number;
}

/**
 * Image workflow: **select → compress → crop → upload**, cropped with the app's
 * `ImageCropperDialog` (`core/media/image-cropper`) locked to the block's format. Only the
 * cropped result is uploaded (the uncropped photo never reaches the server) and registered
 * with the editor's image session, so it is removed again if it ends up unused. Several files
 * are cropped one after the other; closing the dialog stops the queue. Render `dialog` once.
 * `onUrl` always runs with the latest props.
 */
export const useCropImage = (ratio: string, onUrl: (url: string) => void) => {
  const { t } = useTranslation('admin');
  const upload = useAdminPageImageUpload();
  const tracker = usePageImageTracker();
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState<ICurrent | null>(null);
  const handler = useRef(onUrl);
  const queue = useRef<Source[]>([]);
  const total = useRef(0);
  /** The dialog reports "closed" after save / cancel too – only a real dismissal stops the queue. */
  const advancing = useRef(false);
  useEffect(() => {
    handler.current = onUrl;
  });

  const show = () => {
    advancing.current = false;
    const image = queue.current.shift();
    setCurrent(
      image ? { image, index: total.current - queue.current.length, total: total.current } : null
    );
  };

  const start = (items: Source[]) => {
    queue.current = items;
    total.current = items.length;
    show();
  };

  /** Chosen files: compress first (big camera photos), then crop one by one. */
  const pick = async (files: File[]) => {
    if (!files.length) return;
    setBusy(true);
    const small = await Promise.all(files.map(compressPageImage));
    setBusy(false);
    start(small);
  };

  /** Crop an already uploaded image again (loaded from its url). */
  const recrop = async (url: string) => {
    setBusy(true);
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error(String(response.status));
      const blob = await response.blob();
      setBusy(false);
      start([blob]);
    } catch {
      setBusy(false);
      toast.error(t('blocks.field.editLoadError'));
    }
  };

  const save = async (result: CroppedImageResult) => {
    advancing.current = true;
    setCurrent(null);
    const file = result.file ?? new File([result.blob], 'image.webp', { type: result.blob.type });
    setBusy(true);
    const done = await upload(file);
    setBusy(false);
    if (done.ok && done.url) {
      tracker?.track(done.url);
      handler.current(done.url);
    } else {
      toast.error(t(done.error ?? 'error.imageUpload'));
    }
    show();
  };

  const skip = () => {
    advancing.current = true;
    setCurrent(null);
    window.setTimeout(show, 50);
  };

  const dialog = current && (
    <ImageCropperDialog
      key={current.index}
      open
      onOpenChange={open => {
        if (open || advancing.current) return;
        queue.current = [];
        setCurrent(null);
      }}
      image={current.image}
      shape="rectangle"
      aspectRatio={ratioValue(ratio)}
      showAspectRatioSelector={false}
      outputMimeType="image/webp"
      outputQuality={0.88}
      fileName="image.webp"
      title={t('blocks.crop.title', { current: current.index, total: current.total })}
      description={t('blocks.crop.description', { ratio: ratio.replace('/', ':') })}
      applyLabel={t('blocks.crop.apply')}
      onCropComplete={result => void save(result)}
      onCancel={skip}
    />
  );

  return { pick, recrop, busy, dialog };
};
