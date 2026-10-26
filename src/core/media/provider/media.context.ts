import type { IImageEditorShowProps } from '@core/media/image-editor';
import { createContext } from 'react';

export interface IMediaContext {
  ready: boolean;
  imageEditorOpen: boolean;
  showImageEditor: (props: IImageEditorShowProps) => void;
}

export const MediaContext = createContext<IMediaContext | undefined>(undefined);
