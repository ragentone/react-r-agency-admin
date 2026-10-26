import { cn } from '@ui/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@ui/shad-cn/components/dialog';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ImageCropper } from './ImageCropper';
import type { ImageCropperDialogProps } from './types';

export const ImageCropperDialog: React.FC<ImageCropperDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onCropComplete,
  onCancel,
  className,
  ...cropperProps
}) => {
  const { t } = useTranslation('media');

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleCropComplete = (
    result: Parameters<NonNullable<ImageCropperDialogProps['onCropComplete']>>[0]
  ) => {
    onCropComplete?.(result);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Phones: full screen editor. sm+: centered card. */}
      <DialogContent className="inset-0 top-0 left-0 flex h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[92dvh] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border">
        <DialogHeader className="shrink-0 space-y-0.5 border-b border-border/50 px-4 pt-[max(0.875rem,env(safe-area-inset-top))] pr-14 pb-3.5 text-left sm:pt-4">
          <DialogTitle className="text-title leading-6 font-bold">
            {title || t('cropImage', { defaultValue: 'Bild zuschneiden' })}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-caption leading-4">{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col">
          <ImageCropper
            {...cropperProps}
            className={cn('min-h-0 flex-1 rounded-none border-0', className)}
            containerClassName={cn(
              'h-auto min-h-[240px] flex-1 sm:h-[min(60dvh,540px)] sm:flex-none',
              cropperProps.containerClassName
            )}
            onCropComplete={handleCropComplete}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
