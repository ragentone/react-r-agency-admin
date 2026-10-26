import type { IExtension, IExtensionContext } from '@core/extension/types.ts';

import { ExtensionProvider } from './ExtensionProvider.tsx';

interface IProps {
  index: number;
  extension: IExtension;
  context: IExtensionContext;
}

const ExtensionLoader = (props: IProps) => {
  // Rendered as a component (not called as a function) → own hook state per extension.
  const Component = props.extension.component;
  return (
    <ExtensionProvider context={props.context}>
      {() => <Component index={props.index} context={props.context} />}
    </ExtensionProvider>
  );
};

export { ExtensionLoader };
