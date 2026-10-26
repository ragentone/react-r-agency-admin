import { ProviderComposer, type ProviderConfig } from '@core/components';
import { useEvents } from '@core/event/components/use.events.ts';
import { useLocale } from '@core/i18n/components/use.locale.ts';
import { useLayoutContent } from '@core/layout/hooks/use.layout.content.ts';
import { ProviderManager } from '@core/provider/manager.ts';
import { useTheme } from '@core/theme/components/use.theme.ts';
import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { ApplicationContext, type IApplicationContext } from './application.context.ts';

interface IProps {
  children: ReactNode;
  providers: ProviderConfig[];
}

const ApplicationProvider = (props: IProps) => {
  const [mounted, setMounted] = useState(false);
  const [focused, setFocused] = useState(false);

  const content = useLayoutContent();
  const locale = useLocale();
  const theme = useTheme();
  const events = useEvents();

  const contextValue = useMemo<IApplicationContext>(() => {
    return {
      mounted,
      focused,
      layout: {
        content,
      },
      locale,
      theme,
      events,
    };
  }, [content, events, focused, locale, mounted, theme]);

  const providers = useMemo<ProviderConfig[]>(() => {
    return ProviderManager.merge(props.providers, 'root');
  }, [props.providers]);

  useEffect(() => {
    const init = () => {
      document.addEventListener('visibilitychange', () =>
        setFocused(document.visibilityState === 'visible')
      );
      setFocused(document.visibilityState === 'visible');
      setMounted(true);
    };
    init();
  }, []);

  return (
    <ApplicationContext.Provider value={contextValue}>
      <ProviderComposer providers={providers}>{props.children}</ProviderComposer>
    </ApplicationContext.Provider>
  );
};

export { ApplicationProvider };
