import { type IImageEditorShowProps, ImageEditorDialog } from '@core/media/image-editor';
import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { type IMediaContext, MediaContext } from './media.context';

interface IProps {
  children: ReactNode;
}

export const MediaProvider = ({ children }: IProps) => {
  const [ready, setReady] = useState<boolean>(false);
  const [imageEditorOpen, setImageEditorOpen] = useState<boolean>(false);
  const [imageEditorProps, setImageEditorProps] = useState<IImageEditorShowProps | undefined>(
    undefined
  );

  const showImageEditor = (props: IImageEditorShowProps) => {
    setImageEditorProps(props);
    setImageEditorOpen(true);
  };

  const contextValue = useMemo<IMediaContext>(() => {
    return { ready, imageEditorOpen, showImageEditor, imageEditorProps };
  }, [ready, imageEditorOpen, imageEditorProps]);

  useEffect(() => {
    const init = () => {
      setReady(true);
    };
    init();
    return () => {
      setReady(false);
    };
  }, []);

  return (
    <MediaContext.Provider value={contextValue}>
      <>
        {children}
        <ImageEditorDialog
          open={imageEditorOpen}
          {...imageEditorProps}
          onOpenChange={function (open: boolean): void {
            setImageEditorOpen(open);
          }}
        />
      </>
    </MediaContext.Provider>
  );
};
