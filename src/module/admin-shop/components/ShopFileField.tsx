import type { CroppedImageResult } from '@core/media/image-cropper';
import { ImageCropperDialog } from '@core/media/image-cropper';
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadDropzoneIcon,
  FileUploadHelper,
  FileUploadList,
  FileUploadTitle,
} from '@ui/shad-cn/components/file-upload';
import { ImagePlus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SHOP_IMAGE_MAX_SIZE } from '../const';
import { canEncodeWebp, compressShopImage } from '../utils/image';

interface IProps {
  files: File[];
  /** How many files may be chosen in total. */
  max: number;
  title: string;
  hint?: string;
  /** Crop ratio (width / height): 1 for logos, 4/3 for item images. */
  aspectRatio: number;
  shape?: 'rectangle' | 'circle';
  onChange: (files: File[]) => void;
}

/** Image picker – workflow: select → compress → crop → list. */
export const ShopFileField = ({
  files,
  max,
  title,
  hint,
  aspectRatio,
  shape = 'rectangle',
  onChange,
}: IProps) => {
  const { t } = useTranslation('admin-shop');
  // Chosen but not yet cropped images, cropped one after another.
  const [queue, setQueue] = useState<File[]>([]);
  const [compressing, setCompressing] = useState(0);
  const current = queue[0] ?? null;

  const handleChange = (accepted: File[]) => {
    // Removed files leave the list at once, new ones wait for their crop.
    onChange(files.filter(file => accepted.includes(file)));
    const fresh = accepted.filter(file => !files.includes(file)).slice(0, max - files.length);
    for (const file of fresh) {
      if (file.size > SHOP_IMAGE_MAX_SIZE) {
        toast.error(t('crop.tooBig'));
        continue;
      }
      setCompressing(n => n + 1);
      void compressShopImage(file)
        .then(compressed => setQueue(q => [...q, compressed]))
        .finally(() => setCompressing(n => n - 1));
    }
  };

  const finish = (result: CroppedImageResult | null) => {
    if (result && current) {
      const cropped =
        result.file ??
        new File([result.blob], current.name, { type: result.blob.type || 'image/jpeg' });
      onChange([...files, cropped]);
    }
    setQueue(q => q.slice(1));
  };

  return (
    <>
      <FileUpload
        maxFiles={max}
        accept={['image/*']}
        acceptedFiles={files}
        onFileChange={details => handleChange(details.acceptedFiles)}
      >
        {files.length < max && compressing === 0 && (
          <FileUploadDropzone className="border-border/50 px-4 py-6">
            <FileUploadDropzoneIcon>
              <ImagePlus />
            </FileUploadDropzoneIcon>
            <FileUploadTitle>{title}</FileUploadTitle>
            {hint && <FileUploadHelper>{hint}</FileUploadHelper>}
          </FileUploadDropzone>
        )}
        {compressing > 0 && (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t('crop.compressing')}
          </div>
        )}
        <FileUploadList className="border-border/50" />
      </FileUpload>
      {current && (
        <ImageCropperDialog
          key={`${current.name}-${current.lastModified}-${queue.length}`}
          open
          onOpenChange={open => !open && finish(null)}
          image={current}
          aspectRatio={aspectRatio}
          shape={shape}
          showAspectRatioSelector={false}
          outputMimeType={canEncodeWebp() ? 'image/webp' : 'image/jpeg'}
          outputQuality={0.85}
          fileName={current.name}
          title={t('crop.title')}
          onCropComplete={finish}
          onCancel={() => finish(null)}
        />
      )}
    </>
  );
};
