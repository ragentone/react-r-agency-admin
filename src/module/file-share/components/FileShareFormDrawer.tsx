import { AppFormDrawer } from '@ui/patterns';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Textarea } from '@ui/shad-cn/components/textarea.tsx';
import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  FILE_SHARE_DESCRIPTION_MAX,
  FILE_SHARE_MAX_FILE_SIZE,
  FILE_SHARE_TITLE_MAX,
} from '../const';
import type { IFileShareItem, IFileShareValues, IFileShareWriteResult } from '../types';
import { formatBytes, titleFromFileName } from '../utils';
import { FilePicker } from './FilePicker';
import { ShareLinkSection } from './ShareLinkSection';
import { VisibilityPicker } from './VisibilityPicker';

/** New files are only visible to signed-in users until the admin decides otherwise. */
const EMPTY: IFileShareValues = { title: '', description: '', visibility: 'authenticated' };

const valuesOf = (file: IFileShareItem | null): IFileShareValues =>
  file ? { title: file.title, description: file.description, visibility: file.visibility } : EMPTY;

export interface IFileShareFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` = upload a new file. */
  item: IFileShareItem | null;
  saving: boolean;
  onSubmit: (values: IFileShareValues, file: File | null) => Promise<IFileShareWriteResult>;
  onDelete: (id: string) => Promise<IFileShareWriteResult>;
  onCreateLink: (id: string) => Promise<IFileShareWriteResult>;
  onRevokeLink: (id: string) => Promise<IFileShareWriteResult>;
}

/** Upload / edit a shared file (bottom drawer): file, title, description, visibility + delete. */
export const FileShareFormDrawer: React.FC<IFileShareFormDrawerProps> = ({
  open,
  onOpenChange,
  item,
  saving,
  onSubmit,
  onDelete,
  onCreateLink,
  onRevokeLink,
}) => {
  const { t, i18n } = useTranslation('file-share');
  const [values, setValues] = useState<IFileShareValues>(() => valuesOf(item));
  const [file, setFile] = useState<File | null>(null);
  const [touched, setTouched] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fresh form whenever the drawer opens (new upload or another file) – adjusted during render.
  // Compared by id: a new share link updates `item` but must keep unsaved edits.
  const itemId = item?.id ?? null;
  const [source, setSource] = useState<{ open: boolean; itemId: string | null }>({
    open: false,
    itemId: null,
  });
  if (open && (!source.open || source.itemId !== itemId)) {
    setSource({ open, itemId });
    setValues(valuesOf(item));
    setFile(null);
    setTouched(false);
    setConfirmDelete(false);
  } else if (!open && source.open) {
    setSource({ open: false, itemId: null });
  }

  const title = values.title.trim();
  const titleError = !title
    ? t('form.titleRequired')
    : title.length > FILE_SHARE_TITLE_MAX
      ? t('form.tooLong', { max: FILE_SHARE_TITLE_MAX })
      : null;
  const descriptionError =
    values.description.trim().length > FILE_SHARE_DESCRIPTION_MAX
      ? t('form.tooLong', { max: FILE_SHARE_DESCRIPTION_MAX })
      : null;
  const fileError =
    file && file.size > FILE_SHARE_MAX_FILE_SIZE
      ? t('error.tooLarge', { max: formatBytes(FILE_SHARE_MAX_FILE_SIZE, i18n.language) })
      : file && file.size === 0
        ? t('error.empty')
        : !item && !file
          ? t('form.fileRequired')
          : null;
  const invalid = Boolean(titleError || descriptionError || fileError);

  const set = <K extends keyof IFileShareValues>(key: K, value: IFileShareValues[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setTouched(true);
  };

  const pickFile = (next: File | null) => {
    setFile(next);
    // Title suggestion from the file name – never overwrites a typed title.
    if (next && !values.title.trim()) {
      setValues(prev => ({
        ...prev,
        title: titleFromFileName(next.name).slice(0, FILE_SHARE_TITLE_MAX),
      }));
    }
  };

  const close = (next: boolean) => {
    if (saving) return;
    onOpenChange(next);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (invalid || saving) return;
    const result = await onSubmit(
      { ...values, title, description: values.description.trim() },
      file
    );
    if (result.ok) onOpenChange(false);
  };

  const uploading = saving && Boolean(file);
  const showErrors = touched;

  return (
    <AppFormDrawer
      open={open}
      onOpenChange={close}
      title={item ? t('form.editTitle') : t('form.createTitle')}
      description={t('form.description')}
      closeLabel={t('form.cancel')}
      submitLabel={uploading ? t('form.uploading') : item ? t('form.save') : t('form.upload')}
      submitDisabled={saving || (showErrors && invalid)}
      busy={saving}
      submitPlacement="header"
      onSubmit={submit}
      bodyClassName="space-y-5 py-5 sm:px-6"
    >
      <FilePicker
        file={file}
        onChange={next => {
          pickFile(next);
          setTouched(true);
        }}
        current={item}
        error={showErrors || file ? fileError : null}
        disabled={saving}
      />

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="file-share-title" className="text-caption font-medium text-foreground">
            {t('form.title')}
          </label>
          <span className="text-xs text-muted-foreground tabular-nums">
            {values.title.length} / {FILE_SHARE_TITLE_MAX}
          </span>
        </div>
        <Input
          id="file-share-title"
          value={values.title}
          onChange={e => set('title', e.target.value)}
          placeholder={t('form.titlePlaceholder')}
          disabled={saving}
          aria-invalid={Boolean(showErrors && titleError)}
          className="h-12 rounded-xl text-base font-semibold sm:text-body"
        />
        {showErrors && titleError && (
          <p role="alert" className="mt-1.5 text-caption text-destructive">
            {titleError}
          </p>
        )}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="file-share-description"
            className="text-caption font-medium text-foreground"
          >
            {t('form.descriptionLabel')}
          </label>
          <span
            className={
              descriptionError
                ? 'text-xs text-destructive tabular-nums'
                : 'text-xs text-muted-foreground tabular-nums'
            }
          >
            {values.description.length} / {FILE_SHARE_DESCRIPTION_MAX}
          </span>
        </div>
        <Textarea
          id="file-share-description"
          value={values.description}
          onChange={e => set('description', e.target.value)}
          placeholder={t('form.descriptionPlaceholder')}
          disabled={saving}
          aria-invalid={Boolean(descriptionError)}
          rows={4}
          className="min-h-28 rounded-xl text-base sm:text-body"
        />
        {descriptionError && (
          <p role="alert" className="mt-1.5 text-caption text-destructive">
            {descriptionError}
          </p>
        )}
      </div>

      <VisibilityPicker
        value={values.visibility}
        onChange={value => set('visibility', value)}
        disabled={saving}
      />

      {item && (
        <ShareLinkSection
          item={item}
          saving={saving}
          onCreate={onCreateLink}
          onRevoke={onRevokeLink}
        />
      )}

      {item && (
        <Button
          type="button"
          onClick={() => setConfirmDelete(true)}
          disabled={saving}
          variant="destructive-outline"
          size="lg"
          fullWidth
        >
          <Trash2 className="size-4" aria-hidden="true" />
          {t('delete.action')}
        </Button>
      )}

      {item && (
        <AlertDialog open={confirmDelete} onOpenChange={next => !saving && setConfirmDelete(next)}>
          <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[340px] gap-6 rounded-2xl p-8">
            <AlertDialogHeader className="space-y-2 text-left">
              <AlertDialogTitle className="text-xl font-bold tracking-tight">
                {t('delete.title')}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-body leading-5">
                {t('delete.description', { title: item.title })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-3 sm:flex-col sm:space-x-0">
              <Button
                type="button"
                disabled={saving}
                onClick={async () => {
                  const result = await onDelete(item.id);
                  if (result.ok) {
                    setConfirmDelete(false);
                    onOpenChange(false);
                  }
                }}
                variant="destructive"
                size="lg"
                fullWidth
                isLoading={saving}
              >
                {t('delete.confirm')}
              </Button>
              <AlertDialogCancel disabled={saving} className="mt-0 h-11 w-full text-body sm:mt-0">
                {t('form.cancel')}
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AppFormDrawer>
  );
};
