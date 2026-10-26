import { parseCssWidthOrHeight } from '@core/utils';
import { cn } from '@ui/lib';

import { useImageLoader } from '../hooks/use.image.loader.ts';

/**
 * Interface representing properties for a media image component.
 * @interface IMediaImageProps
 */
export interface IMediaImageProps {
  src: string | undefined;
  alt?: string;
  className?: string;
  height?: string | number;
  width?: string | number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onClick?(): void;
}

/**
 * A functional React component that renders an image with customizable properties such as dimensions, object fit, and click behavior.
 * @param {IMediaImageProps} props - The properties passed to configure the MediaImage component.
 * @param {string} props.src - The source URL of the image.
 * @param {string} [props.alt] - An alternative text description for the image.
 * @param {number | string} [props.width] - The width of the image. Can be a number (in pixels) or a string (CSS value).
 * @param {number | string} [props.height] - The height of the image. Can be a number (in pixels) or a string (CSS value).
 * @param {string} [props.objectFit] - Defines how the image content is resized to fit its container. Accepts CSS object-fit values such as 'contain', 'cover', 'fill', 'none', or 'scale-down'.
 * @param {string} [props.className] - Additional CSS classes to apply to the outer container of the image.
 * @param {Function} [props.onClick] - Click handler function triggered when the image container is clicked.
 */
const MediaImage = (props: IMediaImageProps) => {
  const { image } = useImageLoader({
    src: props.src,
  });

  return (
    <div
      style={{
        height: props.height ? parseCssWidthOrHeight(props.height) : undefined,
        width: props.width ? parseCssWidthOrHeight(props.width) : undefined,
      }}
      className={cn(
        'relative',
        {
          'cursor-pointer': props.onClick,
        },
        props.className
      )}
      onClick={props.onClick}
    >
      {image && (
        <img
          className={cn('w-full h-full', {
            'object-contain': props.objectFit === 'contain',
            'object-cover': props.objectFit === 'cover',
            'object-fill': props.objectFit === 'fill',
            'object-none': props.objectFit === 'none',
            'object-scale-down': props.objectFit === 'scale-down',
          })}
          src={image.element.src}
          alt={image.element.alt ?? 'image'}
        />
      )}
    </div>
  );
};

export { MediaImage };
