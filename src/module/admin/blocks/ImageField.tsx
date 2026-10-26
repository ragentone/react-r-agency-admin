import type {
  EditedImageResult,
  ImageEditorState,
  ImageExportOptions,
} from '@core/media/image-editor';
import { useMedia } from '@core/media/provider/use.media.ts';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Crosshair, ImagePlus, Link2, Loader2, SlidersHorizontal, Undo2, X } from 'lucide-react';
import React, { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SITE_PAGE_IMAGE_ACCEPT, useAdminPageImageUpload } from '../hooks/use.admin.page.image';
import { usePageImageTracker } from './image.session';

const LABEL =
  'mb-1.5 flex items-center justify-between gap-2 text-caption font-medium text-foreground';

/** Result of the image editor: WebP, same limits as the upload shrink. */
const EDITOR_EXPORT: ImageExportOptions = {
  mimeType: 'image/webp',
  quality: 0.9,
  maxWidth: 2400,
  maxHeight: 2400,
  maxSizeBytes: 6 * 1024 * 1024,
  fileName: 'image.webp',
};

const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

export interface IImageFieldProps {
  label: string;
  hint?: string;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
  /** Tailwind aspect class of the preview. */
  aspect?: string;
  /** Focus point (0–100) – tap / click on the preview or arrow keys move it. */
  focus?: { x: number; y: number };
  onFocusChange?: (focus: { x: number; y: number }) => void;
  /** Non-destructive editing: untouched upload behind `value` ('' = not edited). */
  original?: string;
  /** Editor state of the last edit – reopens the original with crop, filters, text … */
  editState?: Record<string, unknown> | null;
  /** Offers the image editor; called with the new result (or the restored original). */
  onEdited?: (next: IImageEditResult) => void;
}

export interface IImageEditResult {
  /** Image to show (edited result or, after restoring, the original). */
  url: string;
  /** Untouched upload – '' after restoring. */
  original: string;
  state: ImageEditorState | null;
}

/**
 * Block image: upload (shrunk in the browser first), replace, remove, optional external url
 * and focus point. Every upload is registered with the editor's image session, so images that
 * end up unsaved are deleted on the server again (see `image.session.tsx`).
 */
export const ImageField: React.FC<IImageFieldProps> = ({
  label,
  hint,
  disabled,
  value,
  onChange,
  aspect = 'aspect-[16/9]',
  focus,
  onFocusChange,
  original = '',
  editState = null,
  onEdited,
}) => {
  const { t } = useTranslation('admin');
  const upload = useAdminPageImageUpload();
  const tracker = usePageImageTracker();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const urlId = useId();
  const hintId = useId();

  const { showImageEditor } = useMedia();
  /** Files uploaded here, by url – edited locally instead of downloaded again. */
  const files = useRef(new Map<string, File>());

  /** Uploads one file – returns its url (null + toast on error). */
  const send = async (file: File): Promise<string | null> => {
    setBusy(true);
    const result = await upload(file);
    setBusy(false);
    if (result.ok && result.url) {
      tracker?.track(result.url);
      files.current.set(result.url, file);
      return result.url;
    }
    toast.error(t(result.error ?? 'error.imageUpload'));
    return null;
  };

  const pick = async (file: File | undefined) => {
    if (!file) return;
    const url = await send(file);
    if (url) onChange(url);
  };

  /**
   * Non-destructive: the editor always opens the **original** (with the saved state of the last
   * edit), the result is uploaded as the shown image. Older results are cleaned up like any
   * replaced image (session discard / server on save); the original stays as long as it's used.
   */
  const edit = async () => {
    const sourceUrl = original || value;
    let source: File | Blob | undefined = files.current.get(sourceUrl);
    if (!source) {
      setBusy(true);
      try {
        const response = await fetch(sourceUrl, { mode: 'cors' });
        if (!response.ok) throw new Error(String(response.status));
        source = await response.blob();
      } catch {
        toast.error(t('blocks.field.editLoadError'));
        return;
      } finally {
        setBusy(false);
      }
    }
    showImageEditor({
      image: source,
      exportOptions: EDITOR_EXPORT,
      initialState: original && editState ? (editState as Partial<ImageEditorState>) : undefined,
      onSave: (result: EditedImageResult) => {
        const type = result.blob.type || 'image/webp';
        const file =
          result.file ?? new File([result.blob], `image.${type.split('/')[1] ?? 'webp'}`, { type });
        void send(file).then(url => {
          if (url) onEdited?.({ url, original: sourceUrl, state: result.state });
        });
      },
    });
  };

  /** Back to the untouched upload (the edited result is cleaned up like a replaced image). */
  const restore = () => {
    if (original) onEdited?.({ url: original, original: '', state: null });
  };

  const setFocusFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!onFocusChange || disabled) return;
    const box = event.currentTarget.getBoundingClientRect();
    onFocusChange({
      x: clamp(((event.clientX - box.left) / box.width) * 100),
      y: clamp(((event.clientY - box.top) / box.height) * 100),
    });
  };

  const moveFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!focus || !onFocusChange || disabled) return;
    const step = event.shiftKey ? 10 : 2;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = delta[event.key];
    if (!move) return;
    event.preventDefault();
    onFocusChange({ x: clamp(focus.x + move[0]), y: clamp(focus.y + move[1]) });
  };

  const openPicker = () => input.current?.click();
  const withFocus = Boolean(value && focus && onFocusChange);

  return (
    <div>
      <p className={LABEL}>{label}</p>
      <input
        ref={input}
        type="file"
        accept={SITE_PAGE_IMAGE_ACCEPT}
        className="hidden"
        onChange={e => {
          void pick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {value ? (
        <div
          className={cn(
            'relative overflow-hidden rounded-xl border border-border/60 bg-muted',
            // Focus mode: the whole image (no crop), so a tap maps 1:1 to image coordinates.
            withFocus ? 'flex justify-center' : aspect
          )}
        >
          <div className={cn('relative', withFocus ? 'w-fit' : 'size-full')}>
            <img
              src={value}
              alt=""
              draggable={false}
              className={cn(
                'select-none',
                withFocus
                  ? 'block max-h-[min(60dvh,26rem)] w-auto max-w-full'
                  : 'size-full object-cover'
              )}
            />
            {withFocus && focus && (
              <div
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-label={t('blocks.hero.focus')}
                aria-describedby={hintId}
                aria-valuetext={`${focus.x}% / ${focus.y}%`}
                aria-valuenow={focus.x}
                aria-valuemin={0}
                aria-valuemax={100}
                onPointerDown={setFocusFromPointer}
                onKeyDown={moveFocus}
                className="absolute inset-0 cursor-crosshair touch-none outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-inset"
              >
                <span
                  aria-hidden="true"
                  style={{ left: `${focus.x}%`, top: `${focus.y}%` }}
                  className="pointer-events-none absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-black/40 shadow-lg"
                >
                  <Crosshair className="size-4 text-white" />
                </span>
              </div>
            )}
          </div>
          <div className="absolute top-2 right-2 flex gap-1.5">
            {onEdited && (
              <Button
                type="button"
                size="sm"
                pill
                variant="secondary"
                onClick={() => void edit()}
                disabled={disabled || busy}
                className="bg-background/90 shadow-sm backdrop-blur"
              >
                <SlidersHorizontal aria-hidden="true" />
                {t('blocks.field.imageEdit')}
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              pill
              variant="secondary"
              onClick={openPicker}
              disabled={disabled || busy}
              className="bg-background/90 shadow-sm backdrop-blur"
            >
              {busy ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus aria-hidden="true" />
              )}
              {t('blocks.field.imageReplace')}
            </Button>
            <Button
              type="button"
              size="icon-sm"
              pill
              variant="secondary"
              onClick={() => onChange('')}
              disabled={disabled || busy}
              aria-label={t('blocks.field.imageRemove')}
              className="bg-background/90 shadow-sm backdrop-blur"
            >
              <X />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled || busy}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-50',
            aspect
          )}
        >
          {busy ? (
            <Loader2 className="size-6 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="size-6" aria-hidden="true" />
          )}
          <span className="text-body font-semibold">
            {busy ? t('blocks.field.imageUploading') : t('blocks.field.imageUpload')}
          </span>
          <span className="text-caption">{t('blocks.field.imageFormats')}</span>
        </button>
      )}

      <div className="mt-1.5 flex items-start justify-between gap-2">
        <p id={hintId} className="text-caption text-muted-foreground">
          {withFocus ? t('blocks.hero.focusHint') : hint}
        </p>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => setShowUrl(open => !open)}
          aria-expanded={showUrl}
          aria-controls={urlId}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <Link2 aria-hidden="true" />
          {t('blocks.field.imageUrl')}
        </Button>
      </div>
      {value && original && onEdited && (
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={restore}
          disabled={disabled || busy}
          className="text-muted-foreground hover:text-foreground"
        >
          <Undo2 aria-hidden="true" />
          {t('blocks.field.imageRestore')}
        </Button>
      )}
      {withFocus && focus && (focus.x !== 50 || focus.y !== 50) && (
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => onFocusChange?.({ x: 50, y: 50 })}
          disabled={disabled}
          className="text-muted-foreground hover:text-foreground"
        >
          <Crosshair aria-hidden="true" />
          {t('blocks.hero.focusReset')}
        </Button>
      )}
      {showUrl && (
        <Input
          id={urlId}
          value={value}
          onChange={e => onChange(e.target.value.trim())}
          placeholder="https://…"
          inputMode="url"
          autoCapitalize="none"
          spellCheck={false}
          disabled={disabled}
          aria-label={t('blocks.field.imageUrl')}
          className="mt-1.5 h-11 rounded-xl text-base sm:text-body"
        />
      )}
    </div>
  );
};
