import { ImageCropperDialog } from '@core/media/image-cropper';
import type { CroppedImageResult } from '@core/media/image-cropper/types';
import { cn } from '@ui/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog.tsx';
import { ImagePlus, Loader2, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useAuth } from '../../auth/components/use.auth.ts';
import { useUserTeaser } from '../../auth/hooks/use.user.teaser.ts';

/** Backend stores the teaser as 1200×680 (WebP) → crop in the same ratio. */
const TEASER_ASPECT_RATIO = 1200 / 680;
const TEASER_TYPES = 'image/jpeg,image/png,image/webp';

export interface AccountTeaserUploadProps {
  className?: string;
  disabled?: boolean;
  onChanged?: (url: string | null) => void;
}

/**
 * Profile banner of the own account (X-style): shows the teaser, round buttons on top to
 * upload/replace (with cropper) and remove it.
 */
export const AccountTeaserUpload: React.FC<AccountTeaserUploadProps> = ({
  className,
  disabled = false,
  onChanged,
}) => {
  const { t } = useTranslation('account');
  const { userMeta } = useAuth();
  const { uploadTeaser, resetTeaser, uploading, removing } = useUserTeaser();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const teaserUrl = userMeta?.teaserUrl ?? null;
  const busy = uploading || removing;

  const pick = () => {
    if (!disabled && !busy) inputRef.current?.click();
  };

  const handleCropComplete = async (result: CroppedImageResult) => {
    const file =
      result.file ??
      new File([result.blob], 'teaser.jpg', { type: result.blob.type || 'image/jpeg' });
    setImage(null);
    const url = await uploadTeaser(file);
    // Success message comes from the backend (notify).
    if (url) onChanged?.(url);
    else toast.error(t('teaser.uploadError'));
  };

  const handleRemove = async () => {
    setConfirmOpen(false);
    const ok = await resetTeaser();
    if (ok) {
      toast.success(t('teaser.removed'));
      onChanged?.(null);
    } else {
      toast.error(t('teaser.removeError'));
    }
  };

  return (
    <>
      <div
        data-slot="account-teaser"
        className={cn('group relative h-32 overflow-hidden bg-muted sm:h-48', className)}
      >
        {teaserUrl && (
          <img
            key={teaserUrl}
            src={teaserUrl}
            alt={t('teaser.alt')}
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={cn(
              'size-full object-cover transition-opacity duration-300',
              loaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}

        <input
          ref={inputRef}
          type="file"
          accept={TEASER_TYPES}
          className="hidden"
          disabled={disabled || busy}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) setImage(file);
            // Allow choosing the same file again.
            e.target.value = '';
          }}
        />

        {/* Darken + actions, like X's "Edit profile" banner */}
        {!disabled && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center gap-3 transition-colors',
              teaserUrl ? 'bg-black/30' : 'bg-transparent'
            )}
          >
            {busy ? (
              <span className="grid size-11 place-items-center rounded-full bg-black/60 text-white">
                <Loader2 className="size-5 animate-spin" aria-label={t('teaser.uploading')} />
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={pick}
                  aria-label={teaserUrl ? t('teaser.change') : t('teaser.add')}
                  title={teaserUrl ? t('teaser.change') : t('teaser.add')}
                  className="grid size-11 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                >
                  <ImagePlus className="size-5" />
                </button>
                {teaserUrl && (
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    aria-label={t('teaser.remove')}
                    title={t('teaser.remove')}
                    className="grid size-11 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  >
                    <X className="size-5" />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {image && (
        <ImageCropperDialog
          open={Boolean(image)}
          onOpenChange={open => !open && setImage(null)}
          image={image}
          shape="rectangle"
          aspectRatio={TEASER_ASPECT_RATIO}
          title={t('teaser.cropTitle')}
          description={t('teaser.cropDescription')}
          applyLabel={t('teaser.applyAndUpload')}
          onCropComplete={result => void handleCropComplete(result)}
          onCancel={() => setImage(null)}
        />
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('teaser.removeTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('teaser.removeDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">{t('teaser.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-foreground text-background hover:bg-foreground/85"
              onClick={() => void handleRemove()}
            >
              {t('teaser.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
