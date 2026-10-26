import { cn } from '@ui/lib/utils';
import { CloudUpload } from 'lucide-react';
import React, { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FILE_SHARE_MAX_FILE_SIZE } from '../const';
import { fileExtension, formatBytes } from '../utils';
import { FileKindIcon } from './FileKindIcon';

export interface IFilePickerProps {
  /** Newly picked file. */
  file: File | null;
  onChange: (file: File | null) => void;
  /** Stored file (edit) – shown while no new file is picked. */
  current?: { fileName: string; mimeType: string; extension: string; size: number } | null;
  error?: string | null;
  disabled?: boolean;
}

/** Tap (mobile) or drop (desktop) a single file. Shows the picked / stored file with "change". */
export const FilePicker: React.FC<IFilePickerProps> = ({
  file,
  onChange,
  current,
  error,
  disabled,
}) => {
  const { t, i18n } = useTranslation('file-share');
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const pick = (list: FileList | null) => {
    const next = list?.[0];
    if (next) onChange(next);
  };

  const shown = file
    ? {
        fileName: file.name,
        mimeType: file.type,
        extension: fileExtension(file.name),
        size: file.size,
      }
    : (current ?? null);

  const input = (
    <input
      ref={inputRef}
      id={id}
      type="file"
      className="sr-only"
      disabled={disabled}
      onChange={event => {
        pick(event.target.files);
        // Same file again → change event fires again.
        event.target.value = '';
      }}
    />
  );

  return (
    <div>
      <p className="mb-1.5 text-caption font-medium text-foreground">{t('form.file')}</p>
      {shown ? (
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl border p-3',
            error ? 'border-destructive' : 'border-border/60'
          )}
        >
          <FileKindIcon mimeType={shown.mimeType} extension={shown.extension} className="size-11" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body font-semibold">{shown.fileName}</p>
            <p className="text-caption text-muted-foreground tabular-nums">
              {formatBytes(shown.size, i18n.language)}
              {file && current && <> · {t('form.fileNew')}</>}
            </p>
          </div>
          {input}
          <label
            htmlFor={id}
            className={cn(
              'inline-flex h-9 shrink-0 cursor-pointer items-center rounded-full border border-border/60 px-3.5 text-sm font-bold transition-colors hover:bg-foreground/[0.06]',
              disabled && 'pointer-events-none opacity-50'
            )}
          >
            {current ? t('form.fileReplace') : t('form.fileChange')}
          </label>
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={event => {
            event.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={event => {
            event.preventDefault();
            setDragging(false);
            if (!disabled) pick(event.dataTransfer.files);
          }}
          className={cn(
            'flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors',
            dragging
              ? 'border-foreground bg-foreground/[0.05]'
              : error
                ? 'border-destructive'
                : 'border-border hover:bg-foreground/[0.03]',
            disabled && 'pointer-events-none opacity-50'
          )}
        >
          {input}
          <span className="grid size-11 place-items-center rounded-full bg-foreground/[0.07]">
            <CloudUpload className="size-5" aria-hidden="true" />
          </span>
          <span className="text-body font-semibold">{t('form.filePick')}</span>
          <span className="text-caption text-muted-foreground">
            {t('form.fileHint', { max: formatBytes(FILE_SHARE_MAX_FILE_SIZE, i18n.language) })}
          </span>
        </label>
      )}
      {error && (
        <p role="alert" className="mt-1.5 text-caption text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};
