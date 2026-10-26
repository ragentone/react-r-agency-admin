import { DEFAULT_EXPORT_OPTIONS } from './constants';
import type {
  EditedImageResult,
  ImageAdjustments,
  ImageEditorState,
  ImageExportOptions,
} from './types';

/**
 * Safely determines the original byte size of an image source (File, Blob, base64, or URL).
 */
export async function getSourceByteSize(source: string | File | Blob): Promise<number> {
  if (source instanceof Blob) {
    return source.size;
  }
  if (typeof source === 'string') {
    if (source.startsWith('data:')) {
      const base64Index = source.indexOf(';base64,');
      if (base64Index !== -1) {
        const base64Data = source.substring(base64Index + 8);
        const padding = (base64Data.match(/=+$/) || [''])[0].length;
        return Math.floor((base64Data.length * 3) / 4 - padding);
      }
    }
    try {
      const resp = await fetch(source);
      const blob = await resp.blob();
      return blob.size;
    } catch {
      // Ignore network errors / cross-origin fetch restrictions
    }
  }
  return 0;
}

/**
 * Exports a canvas element to Blob & DataURL while ensuring the output file size
 * does not exceed maxSizeBytes (if specified). Iteratively adjusts quality and dimensions if needed.
 */
export async function exportCanvasWithMaxSizeBytes({
  canvas,
  mimeType = 'image/webp',
  initialQuality = 0.85,
  maxSizeBytes,
  fileName = 'edited-image.webp',
}: {
  canvas: HTMLCanvasElement;
  mimeType?: string;
  initialQuality?: number;
  maxSizeBytes?: number;
  fileName?: string;
}): Promise<{ blob: Blob; file: File; dataUrl: string; width: number; height: number }> {
  let currentQuality = Math.min(Math.max(initialQuality, 0.1), 1.0);
  let currentCanvas = canvas;
  let targetWidth = canvas.width;
  let targetHeight = canvas.height;

  // 1. Initial attempt
  let currentBlob = await new Promise<Blob | null>(resolve => {
    currentCanvas.toBlob(resolve, mimeType, currentQuality);
  });

  // 2. If maxSizeBytes is specified and blob exceeds it, adaptively reduce quality
  if (maxSizeBytes && maxSizeBytes > 0 && currentBlob && currentBlob.size > maxSizeBytes) {
    const qualitySteps = [0.82, 0.75, 0.68, 0.60, 0.50, 0.40, 0.30, 0.20];
    for (const stepQuality of qualitySteps) {
      if (stepQuality >= currentQuality) continue;
      const testBlob = await new Promise<Blob | null>(resolve => {
        currentCanvas.toBlob(resolve, mimeType, stepQuality);
      });
      if (testBlob) {
        currentBlob = testBlob;
        currentQuality = stepQuality;
        if (currentBlob.size <= maxSizeBytes) {
          break;
        }
      }
    }

    // 3. If quality reduction alone wasn't enough (e.g. tiny budget or complex image),
    // progressively downscale canvas dimensions
    while (
      currentBlob &&
      currentBlob.size > maxSizeBytes &&
      targetWidth > 120 &&
      targetHeight > 120
    ) {
      targetWidth = Math.round(targetWidth * 0.88);
      targetHeight = Math.round(targetHeight * 0.88);

      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = targetWidth;
      scaledCanvas.height = targetHeight;
      const ctx = scaledCanvas.getContext('2d');
      if (!ctx) break;
      ctx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);
      currentCanvas = scaledCanvas;

      const testBlob = await new Promise<Blob | null>(resolve => {
        currentCanvas.toBlob(resolve, mimeType, currentQuality);
      });
      if (testBlob) {
        currentBlob = testBlob;
      }
    }
  }

  if (!currentBlob) {
    throw new Error('Canvas export failed');
  }

  const dataUrl = currentCanvas.toDataURL(mimeType, currentQuality);
  const file = new File([currentBlob], fileName, { type: mimeType });

  return {
    blob: currentBlob,
    file,
    dataUrl,
    width: currentCanvas.width,
    height: currentCanvas.height,
  };
}

/**
 * Compresses and converts an image (File, Blob, or URL) into a WebP Blob / File / DataUrl on load.
 */
export async function compressImageToWebp(
  source: string | File | Blob,
  options: { quality?: number; maxWidth?: number; maxHeight?: number; maxSizeBytes?: number } = {}
): Promise<{ blob: Blob; file: File; dataUrl: string; width: number; height: number; originalSize: number }> {
  const { quality = DEFAULT_EXPORT_OPTIONS.quality ?? 0.85, maxWidth, maxHeight } = options;

  const originalSize = await getSourceByteSize(source);
  const maxSizeBytes = options.maxSizeBytes ?? (originalSize > 0 ? originalSize : undefined);

  const tempUrl = typeof source === 'string' ? source : URL.createObjectURL(source);

  try {
    const img = await createImage(tempUrl);
    let targetWidth = img.naturalWidth || img.width;
    let targetHeight = img.naturalHeight || img.height;

    if (
      (maxWidth && targetWidth > maxWidth) ||
      (maxHeight && targetHeight > maxHeight)
    ) {
      if (maxWidth && targetWidth > maxWidth) {
        targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
        targetWidth = maxWidth;
      }
      if (maxHeight && targetHeight > maxHeight) {
        targetWidth = Math.round((targetWidth * maxHeight) / targetHeight);
        targetHeight = maxHeight;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context is not available');
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const originalName =
      source instanceof File
        ? source.name.replace(/\.[^/.]+$/, '.webp')
        : 'compressed-image.webp';

    const exported = await exportCanvasWithMaxSizeBytes({
      canvas,
      mimeType: 'image/webp',
      initialQuality: quality,
      maxSizeBytes,
      fileName: originalName,
    });

    return {
      blob: exported.blob,
      file: exported.file,
      dataUrl: exported.dataUrl,
      width: exported.width,
      height: exported.height,
      originalSize,
    };
  } finally {
    if (typeof source !== 'string' && tempUrl.startsWith('blob:')) {
      URL.revokeObjectURL(tempUrl);
    }
  }
}

/**
 * Creates an Image element from a source URL
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export const getRadianAngle = (degreeValue: number): number => {
  return (degreeValue * Math.PI) / 180;
};

export const rotateSize = (
  width: number,
  height: number,
  rotation: number
): { width: number; height: number } => {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

/**
 * Generates the CSS filter string corresponding to the adjustment settings.
 */
export const getCssFilterString = (adjustments: ImageAdjustments): string => {
  const filters: string[] = [];

  // Brightness: -100..100 -> 0%..200%
  const brightnessVal = 100 + adjustments.brightness + adjustments.exposure * 0.8;
  if (brightnessVal !== 100) {
    filters.push(`brightness(${Math.max(0, brightnessVal)}%)`);
  }

  // Contrast: -100..100 -> 0%..200%
  const contrastVal = 100 + adjustments.contrast;
  if (contrastVal !== 100) {
    filters.push(`contrast(${Math.max(0, contrastVal)}%)`);
  }

  // Saturation: -100..100 -> 0%..200%
  const saturateVal = 100 + adjustments.saturation;
  if (saturateVal !== 100) {
    filters.push(`saturate(${Math.max(0, saturateVal)}%)`);
  }

  // Grayscale: 0..100 -> 0%..100%
  if (adjustments.grayscale > 0) {
    filters.push(`grayscale(${adjustments.grayscale}%)`);
  }

  // Sepia: 0..100 -> 0%..100%
  if (adjustments.sepia > 0) {
    filters.push(`sepia(${adjustments.sepia}%)`);
  }

  // Invert: 0..100 -> 0%..100%
  if (adjustments.invert > 0) {
    filters.push(`invert(${adjustments.invert}%)`);
  }

  // Hue rotate: -180..180 -> deg
  const hue = adjustments.hueRotate + adjustments.warmth * 0.2;
  if (hue !== 0) {
    filters.push(`hue-rotate(${hue}deg)`);
  }

  // Blur: 0..20 -> px
  if (adjustments.blur > 0) {
    filters.push(`blur(${adjustments.blur}px)`);
  }

  return filters.length > 0 ? filters.join(' ') : 'none';
};

/**
 * Applies warmth/color balance tint manually onto canvas context if needed
 */
export const applyCanvasWarmth = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  warmth: number
) => {
  if (!warmth) return;

  ctx.save();
  if (warmth > 0) {
    // Warm: Orange/amber overlay
    ctx.fillStyle = `rgba(255, 140, 0, ${Math.min(warmth / 300, 0.35)})`;
    ctx.globalCompositeOperation = 'color';
    ctx.fillRect(0, 0, width, height);
  } else {
    // Cool: Blue/cyan overlay
    ctx.fillStyle = `rgba(0, 150, 255, ${Math.min(Math.abs(warmth) / 300, 0.35)})`;
    ctx.globalCompositeOperation = 'color';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
};

/**
 * Renders the edited image onto a canvas and extracts the final image blob & dataUrl.
 */
export async function processAndExportImage(
  imageSrc: string,
  state: ImageEditorState,
  exportOptions: ImageExportOptions = {},
  originalSource?: string | File | Blob
): Promise<EditedImageResult> {
  const {
    mimeType = DEFAULT_EXPORT_OPTIONS.mimeType ?? 'image/webp',
    quality = DEFAULT_EXPORT_OPTIONS.quality ?? 0.85,
    fileName = DEFAULT_EXPORT_OPTIONS.fileName ?? 'edited-image.webp',
    maxWidth,
    maxHeight,
    maxSizeBytes,
  } = exportOptions;

  // Determine size limit if maxSizeBytes is not explicitly given
  let effectiveMaxSizeBytes = maxSizeBytes;
  if (!effectiveMaxSizeBytes && originalSource) {
    const origSize = await getSourceByteSize(originalSource);
    if (origSize > 0) {
      effectiveMaxSizeBytes = origSize;
    }
  } else if (!effectiveMaxSizeBytes && imageSrc) {
    const srcSize = await getSourceByteSize(imageSrc);
    if (srcSize > 0) {
      effectiveMaxSizeBytes = srcSize;
    }
  }

  const image = await createImage(imageSrc);
  const { adjustments, transform, cropArea } = state;

  const rotRad = getRadianAngle(transform.rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    transform.rotation
  );

  // 1. Create transformed and filtered canvas
  const transformedCanvas = document.createElement('canvas');
  transformedCanvas.width = bBoxWidth;
  transformedCanvas.height = bBoxHeight;
  const tCtx = transformedCanvas.getContext('2d');

  if (!tCtx) {
    throw new Error('Canvas 2D context is not available');
  }

  // Apply CSS filters directly to canvas context
  const filterString = getCssFilterString(adjustments);
  if (filterString !== 'none') {
    tCtx.filter = filterString;
  }

  tCtx.translate(bBoxWidth / 2, bBoxHeight / 2);
  tCtx.rotate(rotRad);
  tCtx.scale(transform.flipHorizontal ? -1 : 1, transform.flipVertical ? -1 : 1);
  tCtx.translate(-image.width / 2, -image.height / 2);

  tCtx.drawImage(image, 0, 0);

  // Reset filter and apply warmth if set
  tCtx.setTransform(1, 0, 0, 1, 0, 0);
  tCtx.filter = 'none';
  if (adjustments.warmth !== 0) {
    applyCanvasWarmth(tCtx, bBoxWidth, bBoxHeight, adjustments.warmth);
  }

  // 2. Crop if cropArea is provided, or use transformed canvas
  let finalCanvas = transformedCanvas;
  let finalWidth = bBoxWidth;
  let finalHeight = bBoxHeight;

  if (cropArea && cropArea.width > 0 && cropArea.height > 0) {
    const croppedCanvas = document.createElement('canvas');
    const targetCropWidth = Math.max(1, Math.round(cropArea.width));
    const targetCropHeight = Math.max(1, Math.round(cropArea.height));
    croppedCanvas.width = targetCropWidth;
    croppedCanvas.height = targetCropHeight;
    const cCtx = croppedCanvas.getContext('2d');

    if (!cCtx) {
      throw new Error('Cropped canvas 2D context is not available');
    }

    // Safeguard coordinates against out-of-bound/overflow offsets
    const srcX = Math.max(0, cropArea.x);
    const srcY = Math.max(0, cropArea.y);
    const srcWidth = Math.min(bBoxWidth - srcX, cropArea.width);
    const srcHeight = Math.min(bBoxHeight - srcY, cropArea.height);

    const destX = cropArea.x < 0 ? Math.abs(cropArea.x) : 0;
    const destY = cropArea.y < 0 ? Math.abs(cropArea.y) : 0;

    if (srcWidth > 0 && srcHeight > 0) {
      cCtx.drawImage(
        transformedCanvas,
        srcX,
        srcY,
        srcWidth,
        srcHeight,
        destX,
        destY,
        srcWidth,
        srcHeight
      );
    }

    finalCanvas = croppedCanvas;
    finalWidth = croppedCanvas.width;
    finalHeight = croppedCanvas.height;
  }

  // 3. Resize if maxWidth/maxHeight are set
  if ((maxWidth && finalWidth > maxWidth) || (maxHeight && finalHeight > maxHeight)) {
    let targetWidth = finalWidth;
    let targetHeight = finalHeight;

    if (maxWidth && targetWidth > maxWidth) {
      targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
      targetWidth = maxWidth;
    }
    if (maxHeight && targetHeight > maxHeight) {
      targetWidth = Math.round((targetWidth * maxHeight) / targetHeight);
      targetHeight = maxHeight;
    }

    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = targetWidth;
    resizedCanvas.height = targetHeight;
    const rCtx = resizedCanvas.getContext('2d');
    if (rCtx) {
      rCtx.drawImage(finalCanvas, 0, 0, targetWidth, targetHeight);
      finalCanvas = resizedCanvas;
      finalWidth = targetWidth;
      finalHeight = targetHeight;
    }
  }

  // 4. Render Text Overlays
  if (state.texts && state.texts.length > 0) {
    const fCtx = finalCanvas.getContext('2d');
    if (fCtx) {
      // Base scale calculation: relative to image resolution (reference width: 600px)
      const scale = Math.max(0.5, finalWidth / 600);

      for (const item of state.texts) {
        if (!item.text.trim()) continue;

        fCtx.save();
        const fontSize = Math.round((item.fontSize || 24) * scale);
        const fontStyle = item.fontStyle || 'normal';
        const fontWeight = item.fontWeight || 'bold';
        const fontFamily =
          item.fontFamily ||
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        fCtx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        fCtx.textBaseline = 'middle';
        fCtx.textAlign = item.textAlign || 'center';

        const posX = (item.x / 100) * finalWidth;
        const posY = (item.y / 100) * finalHeight;

        const lines = item.text.split('\n');
        const lineHeight = fontSize * 1.25;
        const totalHeight = lines.length * lineHeight;
        const startY = posY - totalHeight / 2 + lineHeight / 2;

        // Measure max width for background pill / box
        if (item.backgroundColor && item.backgroundColor !== 'transparent') {
          let maxLineWidth = 0;
          for (const line of lines) {
            const metrics = fCtx.measureText(line);
            if (metrics.width > maxLineWidth) {
              maxLineWidth = metrics.width;
            }
          }

          const paddingX = fontSize * 0.45;
          const paddingY = fontSize * 0.3;
          const bgWidth = maxLineWidth + paddingX * 2;
          const bgHeight = totalHeight + paddingY * 2;

          let bgX = posX - bgWidth / 2;
          if (item.textAlign === 'left') {
            bgX = posX - paddingX;
          } else if (item.textAlign === 'right') {
            bgX = posX - maxLineWidth - paddingX;
          }
          const bgY = posY - bgHeight / 2;

          fCtx.fillStyle = item.backgroundColor;
          fCtx.beginPath();
          const radius = fontSize * 0.25;
          if (typeof fCtx.roundRect === 'function') {
            fCtx.roundRect(bgX, bgY, bgWidth, bgHeight, radius);
          } else {
            fCtx.rect(bgX, bgY, bgWidth, bgHeight);
          }
          fCtx.fill();
        }

        // Draw text with shadow / color
        if (item.shadow) {
          fCtx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          fCtx.shadowBlur = 6 * scale;
          fCtx.shadowOffsetX = 2 * scale;
          fCtx.shadowOffsetY = 2 * scale;
        } else {
          fCtx.shadowColor = 'transparent';
          fCtx.shadowBlur = 0;
          fCtx.shadowOffsetX = 0;
          fCtx.shadowOffsetY = 0;
        }

        fCtx.fillStyle = item.color || '#ffffff';

        lines.forEach((line, index) => {
          const lineY = startY + index * lineHeight;
          fCtx.fillText(line, posX, lineY);
        });

        fCtx.restore();
      }
    }
  }

  const exported = await exportCanvasWithMaxSizeBytes({
    canvas: finalCanvas,
    mimeType,
    initialQuality: quality,
    maxSizeBytes: effectiveMaxSizeBytes,
    fileName,
  });

  return {
    blob: exported.blob,
    dataUrl: exported.dataUrl,
    file: exported.file,
    width: exported.width,
    height: exported.height,
    state,
  };
}
