import type { IEventContext } from '@core/event/components/events.context.ts';
import type { ILocaleContext } from '@core/i18n/components/locale.context.ts';
import type { IThemeContext } from '@core/theme/components/theme.context.ts';
import { createContext } from 'react';

import type { ILayoutContent } from '../../layout/hooks/use.layout.content.ts';

export interface IApplicationContext {
  mounted: boolean;
  focused: boolean;
  layout: {
    content: ILayoutContent;
  };
  locale: ILocaleContext;
  theme: IThemeContext;
  events: IEventContext;
}

export const ApplicationContext = createContext<IApplicationContext | undefined>(undefined);
