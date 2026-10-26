import type {
  AspectRatioOption,
  FilterPreset,
  ImageAdjustments,
  ImageEditorState,
  ImageExportOptions,
  ImageTransformations,
} from './types';

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  exposure: 0,
  blur: 0,
  sepia: 0,
  grayscale: 0,
  invert: 0,
  hueRotate: 0,
};

export const DEFAULT_TRANSFORM: ImageTransformations = {
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
};

export const DEFAULT_EDITOR_STATE: ImageEditorState = {
  adjustments: { ...DEFAULT_ADJUSTMENTS },
  transform: { ...DEFAULT_TRANSFORM },
  selectedFilter: 'normal',
  cropArea: null,
  aspectRatio: null,
  texts: [],
};

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'normal',
    name: 'Original',
    adjustments: {},
  },
  {
    id: 'vivid',
    name: 'Vivid',
    adjustments: {
      brightness: 5,
      contrast: 20,
      saturation: 35,
    },
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    adjustments: {
      contrast: 35,
      saturation: -15,
      exposure: -5,
    },
  },
  {
    id: 'mono',
    name: 'B&W',
    adjustments: {
      grayscale: 100,
      contrast: 25,
      brightness: 5,
    },
  },
  {
    id: 'vintage',
    name: 'Vintage',
    adjustments: {
      sepia: 50,
      contrast: -10,
      warmth: 20,
      brightness: 5,
    },
  },
  {
    id: 'warm',
    name: 'Warm',
    adjustments: {
      warmth: 40,
      saturation: 15,
      brightness: 5,
    },
  },
  {
    id: 'cool',
    name: 'Cool',
    adjustments: {
      warmth: -40,
      saturation: -10,
      hueRotate: 15,
    },
  },
  {
    id: 'fade',
    name: 'Fade',
    adjustments: {
      contrast: -25,
      brightness: 10,
      saturation: -20,
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    adjustments: {
      contrast: 40,
      saturation: 60,
      hueRotate: 60,
    },
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    adjustments: {
      contrast: 30,
      saturation: -10,
      warmth: 15,
      brightness: -5,
    },
  },
];

export const DEFAULT_ASPECT_RATIOS: AspectRatioOption[] = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:2', value: 3 / 2 },
  { label: '9:16', value: 9 / 16 },
];

export const DEFAULT_EXPORT_OPTIONS: ImageExportOptions = {
  mimeType: 'image/webp',
  quality: 0.85,
  fileName: 'edited-image.webp',
};
