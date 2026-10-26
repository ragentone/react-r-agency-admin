/**
 * An object containing a collection of commonly used aspect ratios for various media formats.
 * Each key represents a descriptive name of the aspect ratio, and its corresponding value represents the aspect ratio in a string format of "width:height".
 */
export const DEFAULT_ASPECT_RATIOS = {
  SQUARE: '1:1',
  STANDARD: '4:3',
  WIDESCREEN: '16:9',
  PHOTO: '3:2',
  PORTRAIT: '2:3',
  STORY: '9:16',
  ULTRAWIDE: '21:9',
  CLASSIC: '3:4',
} as const;
/**
 * An object that defines the default supported image formats and their corresponding MIME types.
 * This constant can be used for validating or specifying image format types in applications
 * that handle image processing or rendering.
 *
 * Properties:
 * - `JPEG`: MIME type for JPEG images (`image/jpeg`).
 * - `PNG`: MIME type for PNG images (`image/png`).
 * - `WEBP`: MIME type for WebP images (`image/webp`).
 * - `AVIF`: MIME type for AVIF images (`image/avif`).
 * - `SVG`: MIME type for SVG images (`image/svg+xml`).
 * - `GIF`: MIME type for GIF images (`image/gif`).
 */
export const DEFAULT_IMAGE_FORMATS = {
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  WEBP: 'image/webp',
  AVIF: 'image/avif',
  SVG: 'image/svg+xml',
  GIF: 'image/gif',
} as const;
/**
 * An object defining the default file extensions for various common image formats.
 * The object contains key-value pairs where the keys represent the image format names
 * and the values represent their corresponding file extensions.
 *
 * This constant is used to standardize and reference commonly used image file extensions
 * across the application.
 *
 * - `JPEG`: The file extension for JPEG images (.jpg).
 * - `PNG`: The file extension for PNG images (.png).
 * - `WEBP`: The file extension for WebP images (.webp).
 * - `AVIF`: The file extension for AVIF images (.avif).
 * - `SVG`: The file extension for SVG images (.svg).
 * - `GIF`: The file extension for GIF images (.gif).
 */
export const DEFAULT_IMAGE_EXTENSIONS = {
  JPEG: '.jpg',
  PNG: '.png',
  WEBP: '.webp',
  AVIF: '.avif',
  SVG: '.svg',
  GIF: '.gif',
} as const;
/**
 * A constant object defining standardized dimensions for various web image types.
 * Each property represents a specific image category and includes both width and height dimensions.
 *
 * Properties:
 * - HERO: Dimensions for hero images, typically used for large banners or main headers.
 * - BLOG_POST: Dimensions for images used in blog post previews or featured articles.
 * - THUMBNAIL: Dimensions for small thumbnail images, commonly used in galleries or previews.
 * - PRODUCT: Dimensions for product images in e-commerce platforms or catalogs.
 * - PROFILE: Dimensions for profile pictures or user avatars.
 * - BANNER_LEADERBOARD: Dimensions for leaderboard banners used in advertisements.
 * - BACKGROUND: Dimensions for background images or large decorative visuals.
 */
export const DEFAULT_WEB_IMAGE_SIZES = {
  HERO: { width: 1920, height: 1080 },
  BLOG_POST: { width: 1200, height: 630 },
  THUMBNAIL: { width: 150, height: 150 },
  PRODUCT: { width: 1000, height: 1000 },
  PROFILE: { width: 400, height: 400 },
  BANNER_LEADERBOARD: { width: 728, height: 90 },
  BACKGROUND: { width: 1920, height: 1080 },
} as const satisfies Record<string, { width: number; height: number }>;
