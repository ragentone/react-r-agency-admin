export type ImageEditorTab = 'crop' | 'adjust' | 'filters' | 'text';

export type AspectRatioValue = number | null; // null for free / custom

export interface AspectRatioOption {
  label: string;
  value: AspectRatioValue;
  icon?: string;
}

export interface ImageTextOverlay {
  id: string;
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number; // base font size in px (e.g. 14 to 96)
  color: string; // hex / css color
  backgroundColor?: string; // transparent, black, white, etc.
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  shadow?: boolean;
}

export interface ImageAdjustments {
  brightness: number; // -100 to 100, default 0
  contrast: number; // -100 to 100, default 0
  saturation: number; // -100 to 100, default 0
  warmth: number; // -100 to 100, default 0 (color balance)
  exposure: number; // -100 to 100, default 0
  blur: number; // 0 to 20 px, default 0
  sepia: number; // 0 to 100, default 0
  grayscale: number; // 0 to 100, default 0
  invert: number; // 0 to 100, default 0
  hueRotate: number; // -180 to 180, default 0
}

export type FilterPresetId =
  | 'normal'
  | 'vivid'
  | 'dramatic'
  | 'mono'
  | 'vintage'
  | 'warm'
  | 'cool'
  | 'fade'
  | 'cyberpunk'
  | 'cinematic';

export interface FilterPreset {
  id: FilterPresetId;
  name: string;
  adjustments: Partial<ImageAdjustments>;
}

export interface ImageCropArea {
  x: number; // 0-100 percentage or pixel values based on context
  y: number;
  width: number;
  height: number;
}

export interface ImageTransformations {
  rotation: number; // 0, 90, 180, 270 (or custom degrees)
  flipHorizontal: boolean;
  flipVertical: boolean;
}

export interface ImageEditorState {
  adjustments: ImageAdjustments;
  transform: ImageTransformations;
  selectedFilter: FilterPresetId;
  cropArea: ImageCropArea | null; // null = entire image
  aspectRatio: AspectRatioValue;
  texts: ImageTextOverlay[];
  /**
   * Crop as percentages of the (rotated) image – size independent, so a saved state can
   * restore the exact crop when the editor opens the original again (non-destructive editing).
   */
  cropPercent?: ImageCropArea | null;
}

export interface ImageExportOptions {
  mimeType?: 'image/webp' | 'image/jpeg' | 'image/png';
  quality?: number; // 0 to 1, default 0.85
  fileName?: string;
  maxWidth?: number;
  maxHeight?: number;
  maxSizeBytes?: number; // Maximum file size in bytes (guaranteed not to exceed)
}

export interface EditedImageResult {
  blob: Blob;
  dataUrl: string;
  file?: File;
  width: number;
  height: number;
  state: ImageEditorState;
}

export interface ImageEditorProps {
  image?: string | File | Blob;
  imageSrc?: string | File | Blob;
  initialState?: Partial<ImageEditorState>;
  aspectRatioOptions?: AspectRatioOption[];
  exportOptions?: ImageExportOptions;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
  applyLabel?: string;
  cancelLabel?: string;
  onSave?: (result: EditedImageResult) => void;
  onApply?: (result: EditedImageResult) => void;
  onCancel?: () => void;
  onChange?: (state: ImageEditorState) => void;
  onImageChange?: (file: File, dataUrl: string) => void;
}

export interface ImageEditorDrawerProps extends Omit<ImageEditorProps, 'onCancel'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onCancel?: () => void;
}

export type ImageEditorDialogProps = ImageEditorDrawerProps;

export interface IImageEditorShowProps {
  onSave: (result: EditedImageResult) => void;
  onCancel?: () => void;
  exportOptions?: ImageExportOptions;
  image?: string | File | Blob;
  /** Saved state of an earlier edit (`EditedImageResult.state`) – restores crop, filters, text … */
  initialState?: Partial<ImageEditorState>;
  aspectRatioOptions?: AspectRatioOption[];
  title?: string;
}
