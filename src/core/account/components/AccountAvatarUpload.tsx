import type { IUserAccount } from '@core/account/types';
import { ImageCropperDialog } from '@core/media/image-cropper';
import type { CroppedImageResult } from '@core/media/image-cropper/types';
import { cn } from '@ui/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar';
import { Camera, Loader2, User } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useAuth } from '../../auth/components/use.auth.ts';
import { useUserAvatar } from '../../auth/hooks/use.user.avatar.ts';

export interface AccountAvatarUploadProps {
  account?: IUserAccount | null;
  className?: string;
  avatarClassName?: string;
  onUploadSuccess?: (url: string) => void;
  disabled?: boolean;
}

export const AccountAvatarUpload: React.FC<AccountAvatarUploadProps> = ({
  account,
  className,
  avatarClassName,
  onUploadSuccess,
  disabled = false,
}) => {
  const { t } = useTranslation(['account', 'auth']);
  const { userMeta, userMate } = useAuth();
  const { uploadAvatar, loading: isUploading } = useUserAvatar();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);

  const avatarUrl = account?.avatarUrl || userMeta?.avatarUrl || userMate?.avatarUrl;

  const initials =
    (
      account?.details?.firstname?.[0] ??
      account?.alias?.[0] ??
      userMeta?.alias?.[0] ??
      'U'
    ).toUpperCase() + (account?.details?.lastname?.[0] ?? '').toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setCropperOpen(true);
    }
    // Reset file input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleTriggerClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleCropComplete = async (result: CroppedImageResult) => {
    try {
      const fileToUpload =
        result.file ||
        new File([result.blob], 'avatar.jpg', { type: result.blob.type || 'image/jpeg' });

      const uploadResult = await uploadAvatar(fileToUpload);

      if (uploadResult?.success && uploadResult.url) {
        toast.success(
          t('auth:user_avatar_uploaded_successfully', {
            defaultValue: 'Benutzeravatar erfolgreich hochgeladen',
          })
        );
        onUploadSuccess?.(uploadResult.url);
      } else {
        toast.error(
          t('account:avatar.uploadError', {
            defaultValue: 'Fehler beim Hochladen des Avatars',
          })
        );
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : t('account:avatar.uploadError', {
              defaultValue: 'Fehler beim Hochladen des Avatars',
            });
      toast.error(errorMsg);
    } finally {
      setSelectedImage(null);
    }
  };

  return (
    <>
      <div className={cn('relative group inline-block', className)}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />

        <div
          onClick={handleTriggerClick}
          className={cn(
            'relative cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            disabled && 'cursor-not-allowed opacity-75'
          )}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTriggerClick();
            }
          }}
          aria-label={t('account:avatar.change', { defaultValue: 'Avatar ändern' })}
        >
          <Avatar className={cn('size-16 shrink-0 rounded-full bg-background', avatarClassName)}>
            {avatarUrl && <AvatarImage src={avatarUrl} alt={account?.alias || 'Avatar'} />}
            <AvatarFallback className="rounded-full bg-muted text-2xl font-bold text-foreground">
              {initials || <User className="h-7 w-7" />}
            </AvatarFallback>
          </Avatar>

          {/* Hover / Loading Overlay */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white transition-opacity duration-200',
              isUploading
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
            )}
          >
            {isUploading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <Camera className="size-6 drop-shadow-sm" />
            )}
          </div>
        </div>

        {/* Edit Button Badge */}
        {!disabled && !isUploading && (
          <button
            type="button"
            onClick={handleTriggerClick}
            className="absolute right-1 bottom-1 flex size-8 items-center justify-center rounded-full bg-foreground text-background ring-2 ring-background transition-opacity hover:opacity-85"
            title={t('account:avatar.change', { defaultValue: 'Avatar ändern' })}
            aria-label={t('account:avatar.change', { defaultValue: 'Avatar ändern' })}
          >
            <Camera className="size-4" />
          </button>
        )}
      </div>

      {/* Image Cropper Dialog */}
      {selectedImage && (
        <ImageCropperDialog
          open={cropperOpen}
          onOpenChange={open => {
            setCropperOpen(open);
            if (!open) {
              setSelectedImage(null);
            }
          }}
          image={selectedImage}
          shape="circle"
          aspectRatio={1}
          title={t('account:avatar.cropTitle', { defaultValue: 'Avatar anpassen' })}
          description={t('account:avatar.cropDescription', {
            defaultValue: 'Passe dein Profilbild vor dem Hochladen an.',
          })}
          applyLabel={t('account:avatar.applyAndUpload', {
            defaultValue: 'Zuschneiden & Hochladen',
          })}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setSelectedImage(null);
          }}
        />
      )}
    </>
  );
};
