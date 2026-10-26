import { useApp } from '@core/app';
import { useRouter } from '@tanstack/react-router';
import { type ReactNode, useMemo, useState } from 'react';

import { __application__extensions__ } from '../extension.manager.ts';
import { type IExtension, type IExtensionContext } from '../types.ts';
import { ExtensionLoader } from './ExtensionLoader.tsx';

interface IProps {
  children: ReactNode;
}

const Extensions = ({ children }: IProps) => {
  const { layout, theme, locale, events } = useApp();
  const { navigate, state } = useRouter();

  const context = useMemo<IExtensionContext>(() => {
    return {
      layout,
      theme,
      locale,
      navigate,
      routerState: state,
      events,
    };
  }, [events, layout, locale, navigate, state, theme]);

  /*
   * Claim the extensions once per instance. Before, `mounted` was set during render and the
   * list filtered by it on every render → the next re-render (e.g. router state change after
   * navigation) unmounted all extensions again (delete-account dialog, …). Whether that
   * happened before or after the first use depended on timing – hence "only in production".
   */
  const [extensions] = useState<IExtension[]>(() =>
    __application__extensions__.filter(extension => {
      if (extension.mounted || !extension.active) return false;
      extension.mounted = true;
      return true;
    })
  );

  return (
    <>
      {extensions.map((extension, index) => (
        <ExtensionLoader key={index} index={index} extension={extension} context={context} />
      ))}
      {children}
    </>
  );
};

export { Extensions };
