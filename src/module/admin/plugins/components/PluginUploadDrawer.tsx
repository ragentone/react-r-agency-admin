import { AppFormDrawer } from '@ui/patterns';
import { Alert, AlertDescription, AlertTitle } from '@ui/shad-cn/components/alert.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  FileUpload,
  FileUploadDescription,
  FileUploadDropzone,
  FileUploadList,
  FileUploadTitle,
  FileUploadTrigger,
} from '@ui/shad-cn/components/file-upload.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { usePluginUpload } from '../hooks/use-plugin-upload';
import { PLUGIN_UPLOAD_ERROR_CODES, PLUGIN_UPLOAD_MAX_MB } from '../types';

interface IPluginUploadDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}

const errorKey = (code?: string | null) =>
  code && (PLUGIN_UPLOAD_ERROR_CODES as readonly string[]).includes(code) ? code : 'unknown';

/** Form for one plugin ZIP. Shows the backend errors next to the file field. */
export const PluginUploadDrawer: React.FC<IPluginUploadDrawerProps> = ({
  open,
  onOpenChange,
  onUploaded,
}) => {
  const { t } = useTranslation('admin');
  const [file, setFile] = useState<File | null>(null);
  const { busy, result, upload, reset } = usePluginUpload(onUploaded);

  const close = (next: boolean) => {
    if (busy) return;
    if (!next) {
      setFile(null);
      reset();
    }
    onOpenChange(next);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;
    const response = await upload(file);
    if (response.success) {
      toast.success(
        t('plugins.upload.success', {
          name: response.plugin?.name ?? '',
          version: response.plugin?.version ?? '',
        })
      );
      setFile(null);
      onOpenChange(false);
    }
  };

  return (
    <AppFormDrawer
      autoHeight={true}
      open={open}
      onOpenChange={close}
      title={t('plugins.upload.title')}
      description={t('plugins.upload.description')}
      onSubmit={submit}
      submitLabel={busy ? t('plugins.upload.uploading') : t('plugins.upload.submit')}
      submitDisabled={!file}
      busy={busy}
      locked={busy}
    >
      <div className="flex flex-col gap-4 px-4 py-3">
        <p className="text-caption text-muted-foreground">{t('plugins.upload.description')}</p>
        <FileUpload
          accept={{ 'application/zip': ['.zip'] }}
          maxFiles={1}
          disabled={busy}
          onFileChange={({ acceptedFiles }) => {
            setFile(acceptedFiles[0] ?? null);
            reset();
          }}
          className="w-full"
        >
          <FileUploadDropzone className="border-border/50">
            <FileUploadTitle>{t('plugins.upload.file')}</FileUploadTitle>
            <FileUploadDescription>
              {t('plugins.upload.fileHint', { size: PLUGIN_UPLOAD_MAX_MB })}
            </FileUploadDescription>
            <FileUploadTrigger asChild>
              <Button type="button" variant="outline" size="lg" disabled={busy}>
                {t('plugins.upload.file')}
              </Button>
            </FileUploadTrigger>
          </FileUploadDropzone>
          <FileUploadList className="border-border/50" />
        </FileUpload>
        {result && !result.success && (
          <Alert variant="destructive">
            <AlertTitle>{t(`plugins.errors.${errorKey(result.error)}`)}</AlertTitle>
            {result.errors && result.errors.length > 0 && (
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {result.errors.map(message => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </AlertDescription>
            )}
          </Alert>
        )}
      </div>
    </AppFormDrawer>
  );
};
