import type { CroppedImageResult, CropperArea } from './types';

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

/**
 * Converts degree to radians
 */
export const getRadianAngle = (degreeValue: number): number => {
  return (degreeValue * Math.PI) / 180;
};

/**
 * Calculates the bounding box of a rotated rectangle
 */
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

/** Longest output side in px – keeps canvas memory within iOS Safari limits. */
export const MAX_OUTPUT_SIZE = 2048;

/**
 * Extracts and crops an image using canvas.
 * The rotated/flipped source is drawn directly into the (optionally downscaled)
 * crop area. No full-size intermediate canvas is created – large phone photos
 * otherwise exceed the mobile canvas memory limit and the export silently fails.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropperArea,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  outputMimeType = 'image/jpeg',
  outputQuality = 0.92,
  fileName = 'cropped-image.jpg',
  maxOutputSize = MAX_OUTPUT_SIZE
): Promise<CroppedImageResult> {
  const image = await createImage(imageSrc);

  const cropW = Math.max(1, Math.round(pixelCrop.width));
  const cropH = Math.max(1, Math.round(pixelCrop.height));
  const scale = Math.min(1, maxOutputSize / Math.max(cropW, cropH));

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(cropW * scale));
  canvas.height = Math.max(1, Math.round(cropH * scale));

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not available');
  }

  // bounding box of the rotated image, centre of rotation = centre of bbox
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  ctx.imageSmoothingQuality = 'high';
  ctx.scale(scale, scale);
  ctx.translate(-pixelCrop.x, -pixelCrop.y);
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }

        const dataUrl = canvas.toDataURL(outputMimeType, outputQuality);
        const file = new File([blob], fileName, { type: outputMimeType });

        resolve({
          blob,
          dataUrl,
          file,
          area: pixelCrop,
          width: canvas.width,
          height: canvas.height,
        });
      },
      outputMimeType,
      outputQuality
    );
  });
}
