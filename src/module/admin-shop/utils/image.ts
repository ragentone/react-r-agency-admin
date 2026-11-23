import Compressor from 'compressorjs';

import { SHOP_IMAGE_MAX_DIMENSION, SHOP_IMAGE_QUALITY } from '../const';

const EXTENSIONS: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg' };
const withExtension = (name: string, type: string) =>
  `${name.replace(/\.[^.]+$/, '') || 'image'}.${EXTENSIONS[type] ?? 'img'}`;

let webpSupport: boolean | null = null;

/** Can this browser *encode* WebP via canvas? (Checked once.) */
export const canEncodeWebp = (): boolean => {
  if (webpSupport !== null) return webpSupport;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    webpSupport = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    webpSupport = false;
  }
  return webpSupport;
};

/**
 * Step 2 of the image workflow (select → compress → crop): longest edge max
 * `SHOP_IMAGE_MAX_DIMENSION`, WebP (JPEG where WebP can't be encoded), EXIF orientation applied,
 * metadata removed. Never throws – on failure the original file is returned.
 */
export const compressShopImage = (file: File): Promise<File> =>
  new Promise(resolve => {
    const webp = canEncodeWebp();
    new Compressor(file, {
      quality: SHOP_IMAGE_QUALITY,
      maxWidth: SHOP_IMAGE_MAX_DIMENSION,
      maxHeight: SHOP_IMAGE_MAX_DIMENSION,
      mimeType: webp ? 'image/webp' : 'image/jpeg',
      convertTypes: webp ? [] : ['image/png', 'image/webp'],
      convertSize: 0,
      checkOrientation: true,
      retainExif: false,
      strict: true,
      success: result => {
        if (result.size >= file.size) return resolve(file);
        const type = result.type || (webp ? 'image/webp' : 'image/jpeg');
        resolve(
          new File([result], withExtension(file.name, type), { type, lastModified: Date.now() })
        );
      },
      error: () => resolve(file),
    });
  });
