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

/**
 * Extracts and crops an image using canvas
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropperArea,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  outputMimeType = 'image/jpeg',
  outputQuality = 0.92,
  fileName = 'cropped-image.jpg'
): Promise<CroppedImageResult> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context is not available');
  }

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  // set canvas size to match the bounding boxes
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('Cropped canvas 2D context is not available');
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = Math.round(pixelCrop.width);
  croppedCanvas.height = Math.round(pixelCrop.height);

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }

        const dataUrl = croppedCanvas.toDataURL(outputMimeType, outputQuality);
        const file = new File([blob], fileName, { type: outputMimeType });

        resolve({
          blob,
          dataUrl,
          file,
          area: pixelCrop,
          width: croppedCanvas.width,
          height: croppedCanvas.height,
        });
      },
      outputMimeType,
      outputQuality
    );
  });
}
