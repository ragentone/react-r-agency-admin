import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import {
  Cropper,
  CropperArea as CropperAreaComponent,
  CropperImage,
} from '@ui/shad-cn/components/cropper';
import { Slider } from '@ui/shad-cn/components/slider';
import {
  Crop,
  Download,
  ImagePlus,
  Loader2,
  Redo2,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Type,
  Undo2,
  Wand2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DEFAULT_ASPECT_RATIOS,
  DEFAULT_EDITOR_STATE,
  DEFAULT_EXPORT_OPTIONS,
} from './constants';
import { ImageEditorAdjustments } from './ImageEditorAdjustments';
import { ImageEditorCropTransform } from './ImageEditorCropTransform';
import { ImageEditorFilters } from './ImageEditorFilters';
import { ImageEditorText } from './ImageEditorText';
import type {
  AspectRatioValue,
  EditedImageResult,
  FilterPresetId,
  ImageAdjustments,
  ImageCropArea,
  ImageEditorProps,
  ImageEditorState,
  ImageEditorTab,
  ImageTextOverlay,
  ImageTransformations,
} from './types';
import { compressImageToWebp, getCssFilterString, processAndExportImage } from './utils';

/** Bounding box of a rotated rectangle (same as the cropper). */
const rotatedSize = (width: number, height: number, rotation: number) => {
  const rad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  };
};

/**
 * Inverse of the cropper's `getCroppedArea`: zoom + crop position that show the given area
 * (percentages of the rotated image) in a crop box of `cropSize` (displayed px).
 */
const cropFromPercent = (
  area: ImageCropArea,
  media: { width: number; height: number },
  cropSize: { width: number; height: number },
  rotation: number
): { zoom: number; crop: { x: number; y: number } } | null => {
  const box = rotatedSize(media.width, media.height, rotation);
  if (!box.width || !box.height || area.width <= 0 || area.height <= 0) return null;
  const zoom = Math.min(3, Math.max(1, (cropSize.width * 100) / (box.width * area.width)));
  return {
    zoom,
    crop: {
      x: (box.width * zoom - cropSize.width) / 2 - (area.x * box.width * zoom) / 100,
      y: (box.height * zoom - cropSize.height) / 2 - (area.y * box.height * zoom) / 100,
    },
  };
};

export const ImageEditor: React.FC<ImageEditorProps> = ({
  image,
  imageSrc: imageSrcProp,
  initialState,
  aspectRatioOptions = DEFAULT_ASPECT_RATIOS,
  exportOptions = {},
  className,
  containerClassName,
  disabled = false,
  applyLabel,
  cancelLabel,
  onSave,
  onApply,
  onCancel,
  onChange,
  onImageChange,
}) => {
  const { t } = useTranslation('media');

  // Local uploaded image (when user selects a new image via file picker)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const rawSourceImage = uploadedImage ?? image ?? imageSrcProp;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Natural dimensions of the source image
  const [naturalDimensions, setNaturalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Compressed WebP source state
  const [compressedImageSrc, setCompressedImageSrc] = useState<string>('');
  const [isCompressingOnLoad, setIsCompressingOnLoad] = useState<boolean>(false);
  const [originalSourceByteSize, setOriginalSourceByteSize] = useState<number>(0);
  const [loadedByteSize, setLoadedByteSize] = useState<number>(0);

  // Compress source image to WebP upon loading
  useEffect(() => {
    let isCancelled = false;

    if (!rawSourceImage) {
      Promise.resolve().then(() => {
        if (!isCancelled) {
          setCompressedImageSrc('');
          setNaturalDimensions(null);
          setOriginalSourceByteSize(0);
          setLoadedByteSize(0);
        }
      });
      return;
    }

    Promise.resolve().then(() => {
      if (!isCancelled) {
        setIsCompressingOnLoad(true);
      }
    });

    compressImageToWebp(rawSourceImage, {
      quality: exportOptions.quality ?? DEFAULT_EXPORT_OPTIONS.quality ?? 0.85,
      maxWidth: exportOptions.maxWidth,
      maxHeight: exportOptions.maxHeight,
      maxSizeBytes: exportOptions.maxSizeBytes,
    })
      .then(result => {
        if (!isCancelled) {
          setCompressedImageSrc(result.dataUrl);
          const origSize = result.originalSize || result.blob.size;
          setOriginalSourceByteSize(origSize);
          setLoadedByteSize(result.blob.size);
          setNaturalDimensions({
            width: result.width,
            height: result.height,
          });
        }
      })
      .catch(err => {
        console.error('Failed to compress image to WebP on load:', err);
        // Fallback: use raw source
        if (!isCancelled) {
          if (typeof rawSourceImage === 'string') {
            setCompressedImageSrc(rawSourceImage);
          } else if (typeof rawSourceImage === 'object') {
            setCompressedImageSrc(URL.createObjectURL(rawSourceImage));
            if ('size' in rawSourceImage && typeof rawSourceImage.size === 'number') {
              setOriginalSourceByteSize(rawSourceImage.size);
              setLoadedByteSize(rawSourceImage.size);
            }
          }
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsCompressingOnLoad(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    rawSourceImage,
    exportOptions.quality,
    exportOptions.maxWidth,
    exportOptions.maxHeight,
    exportOptions.maxSizeBytes,
  ]);

  const imageSrc = compressedImageSrc;

  // Formatted file size in MB
  const formattedSizeInMb = useMemo(() => {
    const sizeToUse = loadedByteSize || originalSourceByteSize;
    if (!sizeToUse || sizeToUse <= 0) return null;
    const mb = sizeToUse / (1024 * 1024);
    return mb < 0.01 ? '< 0.01' : mb.toFixed(2);
  }, [loadedByteSize, originalSourceByteSize]);

  // Current active tab
  const [activeTab, setActiveTab] = useState<ImageEditorTab>('crop');

  // Currently selected text overlay item
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  // Zoom + position inside Cropper view (controlled, so a saved crop can be restored)
  const [zoom, setZoom] = useState(1);
  const [cropPoint, setCropPoint] = useState({ x: 0, y: 0 });
  /** Crop of `initialState` to restore once image + crop box are measured. */
  const pendingCropRef = useRef<ImageCropArea | null>(initialState?.cropPercent ?? null);
  const mediaDisplayRef = useRef<{ width: number; height: number } | null>(null);
  const cropSizeRef = useRef<{ width: number; height: number } | null>(null);
  const initialRotationRef = useRef(initialState?.transform?.rotation ?? 0);
  const cropPercentRef = useRef<ImageCropArea | null>(initialState?.cropPercent ?? null);

  /** Saved crop → zoom + position, as soon as image and crop box sizes are known. */
  const restoreCrop = useCallback(() => {
    const area = pendingCropRef.current;
    const media = mediaDisplayRef.current;
    const box = cropSizeRef.current;
    if (!area || !media || !box) return;
    pendingCropRef.current = null;
    const restored = cropFromPercent(area, media, box, initialRotationRef.current);
    if (!restored) return;
    setZoom(restored.zoom);
    setCropPoint(restored.crop);
  }, [setZoom]);

  const handleMediaLoaded = useCallback(
    (mediaSize: {
      width?: number;
      height?: number;
      naturalWidth: number;
      naturalHeight: number;
    }) => {
      if (!mediaSize || !mediaSize.naturalWidth || !mediaSize.naturalHeight) return;
      if (mediaSize.width && mediaSize.height) {
        mediaDisplayRef.current = { width: mediaSize.width, height: mediaSize.height };
        restoreCrop();
      }
      setNaturalDimensions(prev => {
        if (
          prev &&
          prev.width === mediaSize.naturalWidth &&
          prev.height === mediaSize.naturalHeight
        ) {
          return prev;
        }
        return {
          width: mediaSize.naturalWidth,
          height: mediaSize.naturalHeight,
        };
      });
    },
    [restoreCrop]
  );

  // Editor State
  const [editorState, setEditorState] = useState<ImageEditorState>(() => ({
    ...DEFAULT_EDITOR_STATE,
    ...initialState,
  }));

  // Undo / Redo History
  const [history, setHistory] = useState<ImageEditorState[]>([
    { ...DEFAULT_EDITOR_STATE, ...initialState },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [customCropSize, setCustomCropSize] = useState<{ width: number; height: number } | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Compare mode (holding button to view original)
  const [showOriginal, setShowOriginal] = useState(false);

  // Store crop area pixels and crop size from cropper component
  const cropAreaPixelsRef = useRef<ImageCropArea | null>(null);

  const updateState = useCallback(
    (next: Partial<ImageEditorState>, recordHistory = true) => {
      setEditorState(prev => {
        const updated = { ...prev, ...next };
        onChange?.(updated);

        if (recordHistory) {
          setHistory(h => [...h.slice(0, historyIndex + 1), updated]);
          setHistoryIndex(prevIndex => prevIndex + 1);
        }

        return updated;
      });
    },
    [historyIndex, onChange]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevState = history[prevIndex];
      setHistoryIndex(prevIndex);
      setEditorState(prevState);
      onChange?.(prevState);
    }
  }, [history, historyIndex, onChange]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextState = history[nextIndex];
      setHistoryIndex(nextIndex);
      setEditorState(nextState);
      onChange?.(nextState);
    }
  }, [history, historyIndex, onChange]);

  const handleResetAll = () => {
    const resetState = { ...DEFAULT_EDITOR_STATE };
    pendingCropRef.current = null;
    cropPercentRef.current = null;
    setEditorState(resetState);
    setZoom(1);
    setCropPoint({ x: 0, y: 0 });
    setCustomCropSize(null);
    setHistory([resetState]);
    setHistoryIndex(0);
    setSelectedTextId(null);
    onChange?.(resetState);
  };

  // Handle changing to a new image via file picker
  const handleOpenFilePicker = () => {
    if (disabled || isProcessing) return;
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const newUrl = URL.createObjectURL(file);

    setUploadedImage(file);
    setOriginalSourceByteSize(file.size);
    setZoom(1);
    setCropPoint({ x: 0, y: 0 });
    setCustomCropSize(null);
    cropAreaPixelsRef.current = null;
    pendingCropRef.current = null;
    cropPercentRef.current = null;
    onImageChange?.(file, newUrl);

    // Reset crop & transform for new image while keeping filter/text/adjustments
    updateState({
      cropArea: null,
      aspectRatio: null,
      transform: { ...DEFAULT_EDITOR_STATE.transform },
    });

    // Reset input so re-selecting same file works
    event.target.value = '';
  };

  const handleCropChange = useCallback(
    (percentages: ImageCropArea, pixels: ImageCropArea) => {
      cropAreaPixelsRef.current = pixels;
      // Not while a saved crop waits to be restored (the cropper reports its default first).
      if (!pendingCropRef.current) cropPercentRef.current = percentages;
    },
    []
  );

  const handleCropSizeChange = useCallback(
    (size: { width: number; height: number }) => {
      cropSizeRef.current = size;
      restoreCrop();
    },
    [restoreCrop]
  );

  const handleAdjustmentsChange = useCallback(
    (adjustments: ImageAdjustments) => {
      updateState({ adjustments, selectedFilter: 'normal' }, false);
    },
    [updateState]
  );

  const handleFilterSelect = useCallback(
    (filterId: FilterPresetId, adjustments: ImageAdjustments) => {
      updateState({ selectedFilter: filterId, adjustments });
    },
    [updateState]
  );

  const handleAspectRatioChange = useCallback(
    (aspectRatio: AspectRatioValue) => {
      setCustomCropSize(null);
      updateState({ aspectRatio });
    },
    [updateState]
  );

  const handleTransformChange = useCallback(
    (transform: ImageTransformations) => {
      setCustomCropSize(null);
      updateState({ transform });
    },
    [updateState]
  );

  const handleTextsChange = useCallback(
    (texts: ImageTextOverlay[]) => {
      updateState({ texts });
    },
    [updateState]
  );

  // Drag and resize crop grid on image stage
  const handleResizePointerDown = (
    e: React.PointerEvent,
    direction: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e'
  ) => {
    if (activeTab !== 'crop' || disabled || isProcessing) return;
    e.stopPropagation();
    e.preventDefault();

    const stageEl = stageRef.current;
    if (!stageEl) return;

    const cropAreaEl = stageEl.querySelector<HTMLElement>('[data-slot="cropper-area"]');
    const startW =
      customCropSize?.width ??
      cropSizeRef.current?.width ??
      cropAreaEl?.offsetWidth ??
      300;
    const startH =
      customCropSize?.height ??
      cropSizeRef.current?.height ??
      cropAreaEl?.offsetHeight ??
      300;
    const startX = e.clientX;
    const startY = e.clientY;
    const stageRect = stageEl.getBoundingClientRect();
    const maxW = Math.max(100, stageRect.width - 24);
    const maxH = Math.max(100, stageRect.height - 24);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let nextW = startW;
      let nextH = startH;

      if (direction === 'e') {
        nextW = startW + dx * 2;
      } else if (direction === 'w') {
        nextW = startW - dx * 2;
      } else if (direction === 's') {
        nextH = startH + dy * 2;
      } else if (direction === 'n') {
        nextH = startH - dy * 2;
      } else if (direction === 'se') {
        nextW = startW + dx * 2;
        nextH = startH + dy * 2;
      } else if (direction === 'sw') {
        nextW = startW - dx * 2;
        nextH = startH + dy * 2;
      } else if (direction === 'ne') {
        nextW = startW + dx * 2;
        nextH = startH - dy * 2;
      } else if (direction === 'nw') {
        nextW = startW - dx * 2;
        nextH = startH - dy * 2;
      }

      if (editorState.aspectRatio !== null && editorState.aspectRatio > 0) {
        if (direction === 'n' || direction === 's') {
          nextW = nextH * editorState.aspectRatio;
        } else if (direction === 'e' || direction === 'w') {
          nextH = nextW / editorState.aspectRatio;
        } else {
          const scaleW = nextW / startW;
          const scaleH = nextH / startH;
          const scale = Math.max(scaleW, scaleH);
          nextW = startW * scale;
          nextH = nextW / editorState.aspectRatio;
        }
      }

      const clampedW = Math.max(50, Math.min(maxW, Math.round(nextW)));
      const clampedH = Math.max(50, Math.min(maxH, Math.round(nextH)));

      setCustomCropSize({ width: clampedW, height: clampedH });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Drag text overlay item on image stage
  const handleTextPointerDown = (e: React.PointerEvent, textId: string) => {
    if (activeTab !== 'text' || disabled || isProcessing) return;
    e.stopPropagation();
    e.preventDefault();
    setSelectedTextId(textId);

    // Use the crop area container if available, otherwise fallback to stage
    const cropAreaEl =
      stageRef.current?.querySelector<HTMLElement>('[data-slot="cropper-area"]') ||
      stageRef.current;
    if (!cropAreaEl) return;

    const cropAreaRect = cropAreaEl.getBoundingClientRect();
    const targetText = editorState.texts.find(t => t.id === textId);
    if (!targetText) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialTextX = targetText.x;
    const initialTextY = targetText.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const percentDeltaX = (deltaX / cropAreaRect.width) * 100;
      const percentDeltaY = (deltaY / cropAreaRect.height) * 100;

      const nextX = Math.max(5, Math.min(95, initialTextX + percentDeltaX));
      const nextY = Math.max(5, Math.min(95, initialTextY + percentDeltaY));

      setEditorState(prev => ({
        ...prev,
        texts: prev.texts.map(t =>
          t.id === textId ? { ...t, x: Math.round(nextX), y: Math.round(nextY) } : t
        ),
      }));
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      setEditorState(latest => {
        updateState({ texts: latest.texts }, true);
        return latest;
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const effectiveAspectRatio = useMemo(() => {
    if (editorState.aspectRatio !== null && editorState.aspectRatio > 0) {
      return editorState.aspectRatio;
    }
    if (naturalDimensions && naturalDimensions.height > 0 && naturalDimensions.width > 0) {
      const isRotated90 = editorState.transform.rotation % 180 !== 0;
      const w = isRotated90 ? naturalDimensions.height : naturalDimensions.width;
      const h = isRotated90 ? naturalDimensions.width : naturalDimensions.height;
      return w / h;
    }
    return 1;
  }, [editorState.aspectRatio, editorState.transform.rotation, naturalDimensions]);

  const handleApply = async () => {
    if (disabled || isProcessing) return;

    try {
      setIsProcessing(true);
      const pixels = cropAreaPixelsRef.current;
      const stateToExport: ImageEditorState = {
        ...editorState,
        // Free crop box resized by hand → keep its shape as ratio, so it can be restored.
        aspectRatio:
          editorState.aspectRatio ??
          (customCropSize && pixels && pixels.height > 0 ? pixels.width / pixels.height : null),
        cropArea: pixels,
        cropPercent: cropPercentRef.current,
      };

      const result: EditedImageResult = await processAndExportImage(
        imageSrc,
        stateToExport,
        {
          ...exportOptions,
          maxSizeBytes:
            exportOptions.maxSizeBytes ??
            (originalSourceByteSize > 0 ? originalSourceByteSize : undefined),
        },
        rawSourceImage
      );

      onSave?.(result);
      onApply?.(result);
    } catch (error) {
      console.error('Failed to process edited image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const cssFilter = useMemo(() => {
    if (showOriginal) return 'none';
    return getCssFilterString(editorState.adjustments);
  }, [editorState.adjustments, showOriginal]);

  const warmthOverlayStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (showOriginal || !editorState.adjustments.warmth) return undefined;
    const warmth = editorState.adjustments.warmth;
    const color =
      warmth > 0
        ? `rgba(255, 140, 0, ${Math.min(warmth / 300, 0.35)})`
        : `rgba(0, 150, 255, ${Math.min(Math.abs(warmth) / 300, 0.35)})`;

    return {
      backgroundColor: color,
      mixBlendMode: 'color' as const,
      pointerEvents: 'none' as const,
    };
  }, [editorState.adjustments.warmth, showOriginal]);

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col overflow-hidden bg-black text-white select-none',
        className
      )}
    >
      {/* Hidden File Input for new image selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Top Header Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-800 bg-black px-2.5 py-1.5 sm:px-4 sm:py-2">
        {/* Undo / Redo & Compare */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={disabled || !imageSrc || historyIndex <= 0}
            title={t('undo', { defaultValue: 'Rückgängig' })}
            className="h-8 w-8 rounded-full p-0 text-neutral-400 hover:bg-neutral-900 hover:text-white disabled:opacity-30"
          >
            <Undo2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={disabled || !imageSrc || historyIndex >= history.length - 1}
            title={t('redo', { defaultValue: 'Wiederholen' })}
            className="h-8 w-8 rounded-full p-0 text-neutral-400 hover:bg-neutral-900 hover:text-white disabled:opacity-30"
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          <div className="mx-1 h-4 w-px bg-neutral-800 sm:mx-1.5" />

          <Button
            variant="ghost"
            size="sm"
            onMouseDown={() => setShowOriginal(true)}
            onMouseUp={() => setShowOriginal(false)}
            onTouchStart={() => setShowOriginal(true)}
            onTouchEnd={() => setShowOriginal(false)}
            disabled={disabled || !imageSrc}
            className="h-8 gap-1.5 rounded-full px-2 text-xs font-medium text-neutral-400 hover:bg-neutral-900 hover:text-white sm:px-2.5"
            title={t('holdForOriginal', { defaultValue: 'Vergleichen' })}
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {showOriginal
                ? t('showingOriginal', { defaultValue: 'Original' })
                : t('holdForOriginal', { defaultValue: 'Vergleichen' })}
            </span>
          </Button>
        </div>

        {/* Center: Image Resolution & File Size Badge */}
        {naturalDimensions && formattedSizeInMb && (
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-3 py-1 text-xs text-neutral-300">
            <span className="font-mono">
              {naturalDimensions.width} × {naturalDimensions.height} px
            </span>
            <span className="text-neutral-600">•</span>
            <span className="font-mono font-medium text-neutral-200">
              {formattedSizeInMb} MB
            </span>
          </div>
        )}

        {/* Change Image & Global Reset */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenFilePicker}
            disabled={disabled || isProcessing}
            className="h-8 gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/60 px-2.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white sm:px-3"
            title={t('changeImage', { defaultValue: 'Neues Bild' })}
          >
            <ImagePlus className="h-3.5 w-3.5" />
            <span className="hidden xs:inline sm:inline">
              {t('changeImage', { defaultValue: 'Neues Bild' })}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetAll}
            disabled={disabled || !imageSrc}
            className="h-8 gap-1.5 rounded-full px-2 text-xs font-medium text-neutral-400 hover:bg-neutral-900 hover:text-white sm:px-2.5"
            title={t('resetAll', { defaultValue: 'Zurücksetzen' })}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden md:inline">
              {t('resetAll', { defaultValue: 'Zurücksetzen' })}
            </span>
          </Button>
        </div>
      </div>

      {/* Main Content Area: Stage (left/center) + Tools Drawer (right) */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        {/* Left/Center: Canvas / Cropper Stage */}
        <div
          className={cn(
            'relative flex min-h-55 flex-1 items-center justify-center overflow-hidden bg-black p-2 sm:p-4',
            containerClassName
          )}
        >
          {isCompressingOnLoad ? (
            <div className="flex flex-col items-center justify-center gap-2 text-neutral-400">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
              <span className="text-xs font-medium">
                {t('compressingImage', { defaultValue: 'Bild wird geladen & optimiert...' })}
              </span>
            </div>
          ) : imageSrc ? (
            <div
              ref={stageRef}
              className="relative h-full w-full max-h-full max-w-full"
              style={{
                filter: cssFilter !== 'none' ? cssFilter : undefined,
                transition: 'filter 150ms ease-out',
              }}
            >
            <Cropper
              aspectRatio={effectiveAspectRatio}
              cropSize={customCropSize}
                crop={cropPoint}
                onCropChange={setCropPoint}
              zoom={zoom}
              rotation={editorState.transform.rotation}
              withGrid={false}
              allowOverflow={false}
              onCropSizeChange={handleCropSizeChange}
              onCropAreaChange={handleCropChange}
              onCropComplete={handleCropChange}
              onZoomChange={setZoom}
              onMediaLoaded={handleMediaLoaded}
              className="h-full w-full"
            >
              <CropperImage
                src={imageSrc}
                alt="Editor media"
                style={{
                  transform: `scaleX(${editorState.transform.flipHorizontal ? -1 : 1}) scaleY(${editorState.transform.flipVertical ? -1 : 1})`,
                }}
              />
              <CropperAreaComponent
                withGrid={false}
                className={cn(
                  'border-2 border-white transition-opacity duration-200 z-10 overflow-visible',
                  activeTab === 'crop'
                    ? 'opacity-100 shadow-[0_0_0_9999px_rgba(0,0,0,0.75)] pointer-events-none'
                    : 'opacity-40 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none'
                )}
              >
                {activeTab === 'crop' && (
                  <>
                    {/* 3x3 Crop Grid */}
                    <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                      <div className="border-r border-b border-white/40" />
                      <div className="border-r border-b border-white/40" />
                      <div className="border-b border-white/40" />
                      <div className="border-r border-b border-white/40" />
                      <div className="border-r border-b border-white/40" />
                      <div className="border-b border-white/40" />
                      <div className="border-r border-b border-white/40" />
                      <div className="border-r border-b border-white/40" />
                      <div />
                    </div>

                    {/* Corner Drag & Resize Handles */}
                    <div
                      onPointerDown={e => handleResizePointerDown(e, 'nw')}
                      className="group absolute -top-3.5 -left-3.5 z-30 flex h-8 w-8 cursor-nwse-resize items-center justify-center pointer-events-auto touch-none"
                    >
                      <span className="h-4.5 w-4.5 border-t-[3px] border-l-[3px] border-white drop-shadow transition-transform group-hover:scale-110" />
                    </div>

                    <div
                      onPointerDown={e => handleResizePointerDown(e, 'ne')}
                      className="group absolute -top-3.5 -right-3.5 z-30 flex h-8 w-8 cursor-nesw-resize items-center justify-center pointer-events-auto touch-none"
                    >
                      <span className="h-4.5 w-4.5 border-t-[3px] border-r-[3px] border-white drop-shadow transition-transform group-hover:scale-110" />
                    </div>

                    <div
                      onPointerDown={e => handleResizePointerDown(e, 'sw')}
                      className="group absolute -bottom-3.5 -left-3.5 z-30 flex h-8 w-8 cursor-nesw-resize items-center justify-center pointer-events-auto touch-none"
                    >
                      <span className="h-4.5 w-4.5 border-b-[3px] border-l-[3px] border-white drop-shadow transition-transform group-hover:scale-110" />
                    </div>

                    <div
                      onPointerDown={e => handleResizePointerDown(e, 'se')}
                      className="group absolute -bottom-3.5 -right-3.5 z-30 flex h-8 w-8 cursor-nwse-resize items-center justify-center pointer-events-auto touch-none"
                    >
                      <span className="h-4.5 w-4.5 border-b-[3px] border-r-[3px] border-white drop-shadow transition-transform group-hover:scale-110" />
                    </div>

                    {/* Edge Drag & Resize Handles */}
                    <div
                      onPointerDown={e => handleResizePointerDown(e, 'n')}
                      className="group absolute -top-2.5 left-1/2 -translate-x-1/2 z-30 flex h-6 w-14 cursor-ns-resize items-center justify-center pointer-events-auto touch-none"
                    >
                      <span className="h-1.5 w-8 rounded-full bg-white drop-shadow transition-transform group-hover:scale-110" />
                    </div>

                    <div
                      onPointerDown={e => handleResizePointerDown(e, 's')}
                      className="group absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-30 flex h-6 w-14 cursor-ns-resize items-center justify-center pointer-events-auto touch-none"
                    >
                      <span className="h-1.5 w-8 rounded-full bg-white drop-shadow transition-transform group-hover:scale-110" />
                    </div>

                    <div
                      onPointerDown={e => handleResizePointerDown(e, 'w')}
                      className="group absolute -left-2.5 top-1/2 -translate-y-1/2 z-30 flex h-14 w-6 cursor-ew-resize items-center justify-center pointer-events-auto touch-none"
                    >
                      <span className="h-8 w-1.5 rounded-full bg-white drop-shadow transition-transform group-hover:scale-110" />
                    </div>

                    <div
                      onPointerDown={e => handleResizePointerDown(e, 'e')}
                      className="group absolute -right-2.5 top-1/2 -translate-y-1/2 z-30 flex h-14 w-6 cursor-ew-resize items-center justify-center pointer-events-auto touch-none"
                    >
                      <span className="h-8 w-1.5 rounded-full bg-white drop-shadow transition-transform group-hover:scale-110" />
                    </div>
                  </>
                )}

                {/* Interactive Text Overlays Layer rendered directly inside Cropper Area for 100% WYSIWYG match */}
                {editorState.texts &&
                  editorState.texts.length > 0 &&
                  editorState.texts.map(item => {
                    const isSelected = item.id === selectedTextId;
                    return (
                      <div
                        key={item.id}
                        onPointerDown={e => handleTextPointerDown(e, item.id)}
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedTextId(item.id);
                          if (activeTab !== 'text') setActiveTab('text');
                        }}
                        className={cn(
                          'absolute select-none transition-shadow z-20',
                          activeTab === 'text'
                            ? 'cursor-move pointer-events-auto touch-none'
                            : 'pointer-events-none'
                        )}
                        style={{
                          left: `${item.x}%`,
                          top: `${item.y}%`,
                          transform: 'translate(-50%, -50%)',
                          fontSize: `${item.fontSize}px`,
                          color: item.color || '#ffffff',
                          backgroundColor: item.backgroundColor || 'transparent',
                          fontWeight: item.fontWeight || 'bold',
                          fontStyle: item.fontStyle || 'normal',
                          textAlign: item.textAlign || 'center',
                          textShadow: item.shadow ? '0 2px 8px rgba(0,0,0,0.85)' : 'none',
                          borderRadius:
                            item.backgroundColor && item.backgroundColor !== 'transparent'
                              ? `${item.fontSize * 0.25}px`
                              : undefined,
                          padding:
                            item.backgroundColor && item.backgroundColor !== 'transparent'
                              ? `${item.fontSize * 0.25}px ${item.fontSize * 0.45}px`
                              : undefined,
                          whiteSpace: 'pre-wrap',
                          maxWidth: '90%',
                          zIndex: isSelected ? 30 : 25,
                        }}
                      >
                        {item.text}
                        {activeTab === 'text' && isSelected && (
                          <div className="pointer-events-none absolute -inset-1.5 rounded border border-dashed border-white/90 ring-1 ring-black/50" />
                        )}
                      </div>
                    );
                  })}
              </CropperAreaComponent>
            </Cropper>

            {/* Warmth Color Overlay */}
            {warmthOverlayStyle && (
              <div
                className="pointer-events-none absolute inset-0 z-10"
                style={warmthOverlayStyle}
              />
            )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-neutral-400">
              <Button
                variant="outline"
                onClick={handleOpenFilePicker}
                className="gap-2 border-neutral-800 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 hover:text-white"
              >
                <ImagePlus className="h-4 w-4" />
                <span>{t('selectImage', { defaultValue: 'Bild auswählen' })}</span>
              </Button>
            </div>
          )}

          {/* Floating Image Meta Info (Dimensions & File Size in MB) */}
          {naturalDimensions && formattedSizeInMb && (
            <div className="absolute left-3 bottom-3 flex items-center gap-1.5 rounded-full border border-neutral-800 bg-black/80 px-2.5 py-1 text-xs text-neutral-300 shadow-lg backdrop-blur-md">
              <span className="font-mono">
                {naturalDimensions.width} × {naturalDimensions.height} px
              </span>
              <span className="text-neutral-600">•</span>
              <span className="font-mono font-medium text-white">
                {formattedSizeInMb} MB
              </span>
            </div>
          )}

          {/* Floating Zoom Controls */}
          <div className="absolute right-3 bottom-3 flex items-center gap-2 rounded-full border border-neutral-800 bg-black/80 px-3 py-1 text-white shadow-lg backdrop-blur-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(prev => Math.max(1, prev - 0.2))}
              disabled={zoom <= 1}
              className="h-6 w-6 rounded-full p-0 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-30"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.05}
              onValueChange={vals => vals[0] !== undefined && setZoom(vals[0])}
              className="w-20"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
              disabled={zoom >= 3}
              className="h-6 w-6 rounded-full p-0 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-30"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Right Drawer / Sidebar for Tools: Crop, Filters, Adjustments, Text */}
        <div className="flex shrink-0 flex-col border-t border-neutral-800 bg-black md:w-80 md:border-t-0 md:border-l lg:w-96 min-h-0 h-[42vh] sm:h-[45vh] md:h-full">
          {/* Navigation Tabs (Twitter Style) */}
          <div className="flex shrink-0 border-b border-neutral-800/80 px-2 pt-1">
            <button
              type="button"
              disabled={disabled || !imageSrc}
              onClick={() => setActiveTab('crop')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                activeTab === 'crop'
                  ? 'border-white text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              )}
            >
              <Crop className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[11px] sm:text-xs">
                {t('crop', { defaultValue: 'Zuschnitt' })}
              </span>
            </button>

            <button
              type="button"
              disabled={disabled || !imageSrc}
              onClick={() => setActiveTab('filters')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                activeTab === 'filters'
                  ? 'border-white text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              )}
            >
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[11px] sm:text-xs">
                {t('filters', { defaultValue: 'Filter' })}
              </span>
            </button>

            <button
              type="button"
              disabled={disabled || !imageSrc}
              onClick={() => setActiveTab('adjust')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                activeTab === 'adjust'
                  ? 'border-white text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[11px] sm:text-xs">
                {t('adjustments', { defaultValue: 'Anpassen' })}
              </span>
            </button>

            <button
              type="button"
              disabled={disabled || !imageSrc}
              onClick={() => setActiveTab('text')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                activeTab === 'text'
                  ? 'border-white text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              )}
            >
              <Type className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[11px] sm:text-xs">
                {t('text', { defaultValue: 'Text' })}
              </span>
            </button>
          </div>

          {/* Scrollable Tab Content Area */}
          <div className="flex-1 min-h-0 overflow-y-auto bg-black">
            {activeTab === 'crop' && (
              <ImageEditorCropTransform
                aspectRatio={editorState.aspectRatio}
                aspectRatioOptions={aspectRatioOptions}
                transform={editorState.transform}
                onAspectRatioChange={handleAspectRatioChange}
                onTransformChange={handleTransformChange}
                disabled={disabled || !imageSrc || isProcessing}
              />
            )}

            {activeTab === 'filters' && (
              <ImageEditorFilters
                imageSrc={imageSrc}
                selectedFilter={editorState.selectedFilter}
                onSelectFilter={handleFilterSelect}
                disabled={disabled || !imageSrc || isProcessing}
              />
            )}

            {activeTab === 'adjust' && (
              <ImageEditorAdjustments
                adjustments={editorState.adjustments}
                onChange={handleAdjustmentsChange}
                disabled={disabled || !imageSrc || isProcessing}
              />
            )}

            {activeTab === 'text' && (
              <ImageEditorText
                texts={editorState.texts}
                selectedTextId={selectedTextId}
                onSelectTextId={setSelectedTextId}
                onChangeTexts={handleTextsChange}
                disabled={disabled || !imageSrc || isProcessing}
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-neutral-800 bg-black p-3 sm:px-4">
            {onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={disabled || isProcessing}
                className="h-9 gap-1.5 rounded-full border-neutral-800 bg-transparent px-4 text-xs font-semibold text-white hover:bg-neutral-900 hover:border-neutral-700"
              >
                <X className="h-3.5 w-3.5" />
                {cancelLabel || t('cancel', { defaultValue: 'Abbrechen' })}
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={handleApply}
              disabled={disabled || isProcessing}
              className="h-9 gap-1.5 rounded-full bg-white px-5 text-xs font-bold text-black shadow-sm transition-all hover:bg-neutral-200"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin text-black" />
              ) : (
                <Download className="h-3.5 w-3.5 text-black" />
              )}
              {applyLabel || t('save', { defaultValue: 'Speichern' })}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
