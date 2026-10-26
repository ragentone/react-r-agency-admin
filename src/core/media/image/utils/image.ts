/**
 * Represents the properties required for a lazy-loaded media image component.
 */
export interface IMediaImageLazyProps {
  src: string;
  delay?: number;
  onError?: () => void;
  onLoaded?: (src: string) => void;
  alt?: string;
}

/**
 * Represents the result of a lazy-loaded media image.
 * This interface is used to define the structure of a result object that
 * provides details about the process and status of lazy-loading an image.
 */
export interface IMediaImageLazyResult {
  hasError: boolean;
  img: HTMLImageElement | undefined;
}

/**
 * Lazily loads an image with optional delay and event handling for load and error events.
 * @param {IMediaImageLazyProps} props - The properties required to load the image lazily.
 * @param {string} props.src - The source URL of the image to be loaded.
 * @param {number} [props.delay] - Optional delay in milliseconds before the load event is resolved.
 * @param {function} [props.onLoaded] - Optional callback function invoked when the image is successfully loaded.
 * @param {function} [props.onError] - Optional callback function invoked when the image fails to load.
 * @returns {Promise<IMediaImageLazyResult>} A promise that resolves with the result of the image load operation.
 * The promise resolves with an object containing:
 * - `src`: The source URL of the loaded image (or `undefined` if an error occurs).
 * - `hasError`: A boolean indicating whether an error occurred during the loading process.
 * - `img`: The loaded `HTMLImageElement` instance (or `undefined` if an error occurs).
 */
const imageLazyLoad = (props: IMediaImageLazyProps): Promise<IMediaImageLazyResult> => {
  return new Promise(resolve => {
    const img = new Image();

    if (props.alt) {
      img.alt = props.alt;
    }

    img.addEventListener('load', () => {
      setTimeout(() => {
        props.onLoaded?.(img.src);
        resolve({ hasError: false, img });
      }, props.delay ?? 0);
    });
    img.addEventListener('error', () => {
      props.onError?.();
      resolve({ hasError: true, img: undefined });
    });
    img.src = props.src;
  });
};

export { imageLazyLoad };
