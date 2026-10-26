import { cn } from '@ui/lib/utils';
import {
  Cropper,
  CropperArea as CropperAreaComponent,
  CropperImage,
} from '@ui/shad-cn/components/cropper';
import { Slider } from '@ui/shad-cn/components/slider';
import {
  Check,
  Circle,
  FlipHorizontal as FlipHIcon,
  FlipVertical as FlipVIcon,
  Grid,
  Loader2,
  Maximize2,
  Ratio,
  RotateCcw,
  RotateCw,
  Square,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AspectRatioOption, CropperArea, CropperShape, ImageCropperProps } from './types';
import { getCroppedImg } from './utils';

const DEFAULT_ASPECT_RATIOS: AspectRatioOption[] = [
  { label: 'Free', value: null, shape: 'rectangle' },
  { label: '1:1', value: 1, shape: 'rectangle' },
  { label: '4:3', value: 4 / 3, shape: 'rectangle' },
  { label: '16:9', value: 16 / 9, shape: 'rectangle' },
  { label: 'Circle', value: 1, shape: 'circle' },
];

export const ImageCropper: React.FC<ImageCropperProps> = ({
  image,
  aspectRatio: initialAspectRatio = null,
  shape: initialShape = 'rectangle',
  zoom: initialZoom = 1,
  minZoom = 1,
  maxZoom = 3,
  zoomStep = 0.05,
  rotation: initialRotation = 0,
  flipHorizontal: initialFlipH = false,
  flipVertical: initialFlipV = false,
  showGrid: initialShowGrid = true,
  showControls = true,
  showAspectRatioSelector = true,
  aspectRatioOptions = DEFAULT_ASPECT_RATIOS,
  outputMimeType = 'image/jpeg',
  outputQuality = 0.92,
  fileName = 'cropped-image.jpg',
  className,
  containerClassName,
  onCropChange,
  onCropComplete,
  onCancel,
  disabled = false,
  applyLabel,
  cancelLabel,
}) => {
  const { t } = useTranslation('media');

  const imageSrc = useMemo(() => {
    if (typeof image === 'string') {
      return image;
    }
    return URL.createObjectURL(image);
  }, [image]);

  useEffect(() => {
    return () => {
      if (typeof image !== 'string' && imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [image, imageSrc]);

  const [aspectRatio, setAspectRatio] = useState<number | null>(initialAspectRatio);
  const [shape, setShape] = useState<CropperShape>(initialShape);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [rotation, setRotation] = useState<number>(initialRotation);
  const [flip, setFlip] = useState<{ horizontal: boolean; vertical: boolean }>({
    horizontal: initialFlipH,
    vertical: initialFlipV,
  });
  const [showGrid, setShowGrid] = useState<boolean>(initialShowGrid);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropperArea | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropChange = useCallback(
    (croppedAreaPercentages: CropperArea, pixels: CropperArea) => {
      setCroppedAreaPixels(pixels);
      onCropChange?.(croppedAreaPercentages, pixels);
    },
    [onCropChange]
  );

  const handleZoomChange = useCallback((values: number[]) => {
    if (values[0] !== undefined) {
      setZoom(values[0]);
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.2, maxZoom));
  }, [maxZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.2, minZoom));
  }, [minZoom]);

  const handleRotateLeft = useCallback(() => {
    setRotation(prev => (prev - 90 + 360) % 360);
  }, []);

  const handleRotateRight = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handleFlipHorizontal = useCallback(() => {
    setFlip(prev => ({ ...prev, horizontal: !prev.horizontal }));
  }, []);

  const handleFlipVertical = useCallback(() => {
    setFlip(prev => ({ ...prev, vertical: !prev.vertical }));
  }, []);

  const handleAspectRatioSelect = useCallback((option: AspectRatioOption) => {
    setAspectRatio(option.value);
    if (option.shape) {
      setShape(option.shape);
    }
  }, []);

  const handleReset = useCallback(() => {
    setZoom(initialZoom);
    setRotation(initialRotation);
    setFlip({ horizontal: initialFlipH, vertical: initialFlipV });
    setAspectRatio(initialAspectRatio);
    setShape(initialShape);
    setShowGrid(initialShowGrid);
  }, [
    initialZoom,
    initialRotation,
    initialFlipH,
    initialFlipV,
    initialAspectRatio,
    initialShape,
    initialShowGrid,
  ]);

  const handleApply = useCallback(async () => {
    if (!croppedAreaPixels || isProcessing) return;

    try {
      setIsProcessing(true);
      const result = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        flip,
        outputMimeType,
        outputQuality,
        fileName
      );
      onCropComplete?.(result);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [
    croppedAreaPixels,
    isProcessing,
    imageSrc,
    rotation,
    flip,
    outputMimeType,
    outputQuality,
    fileName,
    onCropComplete,
  ]);

  /** Round icon button (touch target 40px), `active` for toggles. */
  const toolButton = (active = false) =>
    cn(
      'grid size-10 shrink-0 place-items-center rounded-full text-foreground transition-colors',
      'hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
      'disabled:pointer-events-none disabled:opacity-40',
      active && 'bg-foreground text-background hover:bg-foreground/90'
    );

  return (
    <div
      className={cn(
        'flex w-full max-w-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-background',
        className
      )}
    >
      {/* Canvas – black like a photo editor, fills the available height */}
      <div
        className={cn(
          'relative flex h-[min(60dvh,540px)] min-h-[260px] w-full touch-none items-center justify-center overflow-hidden bg-black select-none',
          containerClassName
        )}
      >
        <Cropper
          aspectRatio={aspectRatio ?? undefined}
          shape={shape}
          zoom={zoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          rotation={rotation}
          withGrid={showGrid}
          onCropAreaChange={handleCropChange}
          onCropComplete={handleCropChange}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          className="relative h-full w-full"
        >
          <CropperImage
            src={imageSrc}
            alt="Cropper media"
            style={{
              transform: `scaleX(${flip.horizontal ? -1 : 1}) scaleY(${flip.vertical ? -1 : 1})`,
            }}
          />
          <CropperAreaComponent shape={shape} withGrid={showGrid} />
        </Cropper>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex flex-col gap-4 border-t border-border/50 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {/* Aspect ratio – one scrollable row of pills on phones */}
          {showAspectRatioSelector && aspectRatioOptions.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="hidden shrink-0 items-center gap-1.5 text-caption font-medium text-muted-foreground sm:inline-flex">
                <Ratio className="size-4" aria-hidden="true" />
                {t('aspectRatio', { defaultValue: 'Format' })}
              </span>
              <div
                role="group"
                aria-label={t('aspectRatio', { defaultValue: 'Format' })}
                className="-mx-4 flex min-w-0 flex-1 gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
              >
                {aspectRatioOptions.map((opt, idx) => {
                  const isSelected =
                    aspectRatio === opt.value && (opt.shape ? shape === opt.shape : true);
                  const displayLabel =
                    opt.label === 'Free'
                      ? t('ratios.free', { defaultValue: 'Frei' })
                      : opt.label === 'Circle'
                        ? t('ratios.circle', { defaultValue: 'Kreis' })
                        : opt.label;

                  return (
                    <button
                      key={idx}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => handleAspectRatioSelect(opt)}
                      disabled={disabled}
                      className={cn(
                        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium tabular-nums transition-colors',
                        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-40',
                        isSelected
                          ? 'bg-foreground text-background'
                          : 'border border-border/50 text-foreground hover:bg-foreground/[0.05]'
                      )}
                    >
                      {opt.shape === 'circle' ? (
                        <Circle className="size-3.5" aria-hidden="true" />
                      ) : opt.value === 1 ? (
                        <Square className="size-3.5" aria-hidden="true" />
                      ) : null}
                      {displayLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Zoom */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={toolButton()}
              onClick={handleZoomOut}
              disabled={disabled || zoom <= minZoom}
              title={t('zoomOut', { defaultValue: 'Verkleinern' })}
              aria-label={t('zoomOut', { defaultValue: 'Verkleinern' })}
            >
              <ZoomOut className="size-5" />
            </button>
            <Slider
              value={[zoom]}
              min={minZoom}
              max={maxZoom}
              step={zoomStep}
              onValueChange={handleZoomChange}
              disabled={disabled}
              className="flex-1 cursor-pointer"
            />
            <button
              type="button"
              className={toolButton()}
              onClick={handleZoomIn}
              disabled={disabled || zoom >= maxZoom}
              title={t('zoomIn', { defaultValue: 'Vergrößern' })}
              aria-label={t('zoomIn', { defaultValue: 'Vergrößern' })}
            >
              <ZoomIn className="size-5" />
            </button>
            <span className="w-11 shrink-0 text-right text-caption text-muted-foreground tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Tools + actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="-mx-1 flex items-center justify-between sm:justify-start sm:gap-1">
              <button
                type="button"
                className={toolButton()}
                onClick={handleRotateLeft}
                disabled={disabled}
                title={t('rotateLeft', { defaultValue: '90° nach links drehen' })}
                aria-label={t('rotateLeft', { defaultValue: '90° nach links drehen' })}
              >
                <RotateCcw className="size-5" />
              </button>
              <button
                type="button"
                className={toolButton()}
                onClick={handleRotateRight}
                disabled={disabled}
                title={t('rotateRight', { defaultValue: '90° nach rechts drehen' })}
                aria-label={t('rotateRight', { defaultValue: '90° nach rechts drehen' })}
              >
                <RotateCw className="size-5" />
              </button>
              <button
                type="button"
                className={toolButton(flip.horizontal)}
                aria-pressed={flip.horizontal}
                onClick={handleFlipHorizontal}
                disabled={disabled}
                title={t('flipHorizontal', { defaultValue: 'Horizontal spiegeln' })}
                aria-label={t('flipHorizontal', { defaultValue: 'Horizontal spiegeln' })}
              >
                <FlipHIcon className="size-5" />
              </button>
              <button
                type="button"
                className={toolButton(flip.vertical)}
                aria-pressed={flip.vertical}
                onClick={handleFlipVertical}
                disabled={disabled}
                title={t('flipVertical', { defaultValue: 'Vertikal spiegeln' })}
                aria-label={t('flipVertical', { defaultValue: 'Vertikal spiegeln' })}
              >
                <FlipVIcon className="size-5" />
              </button>
              <button
                type="button"
                className={toolButton(showGrid)}
                aria-pressed={showGrid}
                onClick={() => setShowGrid(prev => !prev)}
                disabled={disabled}
                title={t('toggleGrid', { defaultValue: 'Raster umschalten' })}
                aria-label={t('toggleGrid', { defaultValue: 'Raster umschalten' })}
              >
                <Grid className="size-5" />
              </button>
              <button
                type="button"
                className={toolButton()}
                onClick={handleReset}
                disabled={disabled}
                title={t('reset', { defaultValue: 'Zurücksetzen' })}
                aria-label={t('reset', { defaultValue: 'Zurücksetzen' })}
              >
                <Maximize2 className="size-5" />
              </button>
            </div>

            {/* Apply / Cancel – full width on phones, compact on desktop */}
            {(onCropComplete || onCancel) && (
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={disabled || isProcessing}
                    className={cn(
                      'inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-border/50 px-5 text-body font-bold text-foreground transition-colors sm:h-10',
                      'hover:bg-foreground/[0.05] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-40',
                      !onCropComplete && 'col-span-2'
                    )}
                  >
                    <X className="size-4" aria-hidden="true" />
                    {cancelLabel || t('cancel', { defaultValue: 'Abbrechen' })}
                  </button>
                )}
                {onCropComplete && (
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={disabled || isProcessing}
                    className={cn(
                      'inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-foreground px-5 text-body font-bold text-background transition-opacity sm:h-10',
                      'hover:opacity-85 active:opacity-75 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:opacity-40',
                      !onCancel && 'col-span-2'
                    )}
                  >
                    {isProcessing ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Check className="size-4" aria-hidden="true" />
                    )}
                    {applyLabel || t('apply', { defaultValue: 'Übernehmen' })}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
