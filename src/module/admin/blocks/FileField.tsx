import { Button } from '@ui/shad-cn/components/button.tsx';
import { FileUp, Loader2 } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SITE_PAGE_FILE_ACCEPT, useAdminPageFileUpload } from '../hooks/use.admin.page.file';
import { UrlField } from './BlockFields';
import { usePageImageTracker } from './image.session';

/**
 * Link of a download: upload a file (fills the url) or paste a link. Uploads are tracked by the
 * editor session like images (same upload directory → discard / keep / cron).
 */
export const FileField: React.FC<{
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Replaces `onChange` after an upload – gets the file too (e.g. to fill name and size). */
  onUploaded?: (url: string, file: File) => void;
  disabled?: boolean;
}> = ({ label, value, onChange, onUploaded, disabled }) => {
  const { t } = useTranslation('admin');
  const upload = useAdminPageFileUpload();
  const tracker = usePageImageTracker();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    const result = await upload(file);
    setBusy(false);
    if (!result.ok || !result.url) {
      toast.error(t(result.error ?? 'error.fileUpload'));
      return;
    }
    tracker?.track(result.url);
    if (onUploaded) onUploaded(result.url, file);
    else onChange(result.url);
  };

  return (
    <div className="space-y-2">
      <input
        ref={input}
        type="file"
        accept={SITE_PAGE_FILE_ACCEPT}
        className="hidden"
        onChange={e => {
          void pick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <UrlField label={label} value={value} onChange={onChange} disabled={disabled || busy} />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Button
          type="button"
          variant="outline"
          onClick={() => input.current?.click()}
          disabled={disabled || busy}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <FileUp className="size-4" aria-hidden="true" />
          )}
          {busy ? t('blocks.field.imageUploading') : t('blocks.downloads.upload')}
        </Button>
        <span className="text-caption text-muted-foreground">{t('blocks.downloads.formats')}</span>
      </div>
    </div>
  );
};
