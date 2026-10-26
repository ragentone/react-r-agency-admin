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

import { ImageEditor } from './ImageEditor';
import type { EditedImageResult, ImageEditorDialogProps } from './types';

export const ImageEditorDialog: React.FC<ImageEditorDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onSave,
  onApply,
  onCancel,
  className,
  containerClassName,
  ...editorProps
}) => {
  const { t } = useTranslation('media');

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleSave = (result: EditedImageResult) => {
    onSave?.(result);
    onApply?.(result);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="inset-0 top-0 left-0 flex h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 bg-black p-0 text-white sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[88dvh] sm:max-h-205 sm:max-w-5xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-neutral-800">
        <DialogHeader className="shrink-0 flex-row items-center justify-between space-y-0 border-b border-neutral-800 bg-black px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 pr-12 text-left sm:pt-3.5">
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-base font-bold leading-6 text-white sm:text-lg">
              {title || t('editImage', { defaultValue: 'Bild bearbeiten' })}
            </DialogTitle>
            {description && (
              <DialogDescription className="truncate text-xs leading-4 text-neutral-400">
                {description}
              </DialogDescription>
            )}
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-black">
          <ImageEditor
            {...editorProps}
            className={cn('min-h-0 flex-1 rounded-none border-0', className)}
            containerClassName={containerClassName}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ImageEditorDrawer = ImageEditorDialog;
