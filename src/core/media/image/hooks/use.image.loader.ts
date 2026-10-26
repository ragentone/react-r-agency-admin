import { useCallback, useEffect, useMemo, useState } from 'react';

import { imageLazyLoad } from '../utils/image.ts';

/**
 * Interface representing a media image loader that handles loading and tracking the state of an image.
 */
export interface IMediaImageLoader {
  loading: boolean;
  loaded: boolean;
  hasError: boolean;
  load(src: string): void;
  image: ILoadedImage | undefined;
}

/**
 * Represents configuration options for a specific functionality.
 * This interface allows customization and handling of certain behaviors through optional properties.
 */
interface IOptions {
  onError?: () => void;
  src?: string;
  alt?: string;
}

export interface ILoadedImage {
  src: string;
  element: HTMLImageElement;
}
/**
 * A custom hook that manages the lifecycle of image loading, providing utilities
 * for tracking loading state, error state, and completion state. It utilizes lazy loading
 * for optimized performance and exposes methods to control the image loading process.
 */
const useImageLoader = (options: IOptions = {}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [src, setSrc] = useState<string | undefined>(options.src);
  const [image, setImage] = useState<ILoadedImage | undefined>(undefined);

  const load = useCallback(
    (src: string) => {
      if (loading) return;
      setSrc(src);
    },
    [loading]
  );

  useEffect(() => {
    const init = async () => {
      if (!src) return;
      setLoading(true);

      const result = await imageLazyLoad({ src, onError: options.onError });
      if (result.img) {
        setImage({ src: result.img.src, element: result.img });
        setLoaded(true);
        setLoading(false);
      } else {
        setImage(undefined);
        setHasError(result.hasError);
        setLoading(false);
      }
    };
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return useMemo<IMediaImageLoader>(
    () => ({
      loading,
      loaded,
      hasError,
      load,
      image,
    }),
    [loading, loaded, hasError, load, image]
  );
};

export { useImageLoader };
