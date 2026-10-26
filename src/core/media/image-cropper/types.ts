export type CropperShape = 'rectangle' | 'circle';

export interface CropperPoint {
  x: number;
  y: number;
}

export interface CropperArea {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface AspectRatioOption {
  label: string;
  value: number | null; // null for free / original
  shape?: CropperShape;
}

export interface CroppedImageResult {
  blob: Blob;
  dataUrl: string;
  file?: File;
  area: CropperArea;
  width: number;
  height: number;
}

export interface ImageCropperProps {
  image: string | File | Blob;
  aspectRatio?: number | null;
  shape?: CropperShape;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  rotation?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  showGrid?: boolean;
  showControls?: boolean;
  showAspectRatioSelector?: boolean;
  aspectRatioOptions?: AspectRatioOption[];
  outputMimeType?: string;
  outputQuality?: number;
  fileName?: string;
  className?: string;
  containerClassName?: string;
  onCropChange?: (areaPercentages: CropperArea, areaPixels: CropperArea) => void;
  onCropComplete?: (result: CroppedImageResult) => void;
  onCancel?: () => void;
  disabled?: boolean;
  applyLabel?: string;
  cancelLabel?: string;
}

export interface ImageCropperDialogProps extends Omit<ImageCropperProps, 'onCancel'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onCancel?: () => void;
}
