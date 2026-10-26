import i18n from 'i18next';
import { type ReactNode, useCallback, useEffect, useMemo } from 'react';

import { type ILocaleContext, LocaleContext } from './locale.context.ts';

interface IProps {
  children: ReactNode;
}

const LocaleProvider = (props: IProps) => {
  const { language, changeLanguage } = i18n;

  const setLanguage = useCallback(
    (language: string) => {
      void changeLanguage(language);
    },
    [changeLanguage]
  );

  const contextValue = useMemo<ILocaleContext>(() => {
    return {
      language,
      setLanguage,
    };
  }, [language, setLanguage]);

  useEffect(() => {}, [language]);

  return <LocaleContext.Provider value={contextValue}>{props.children}</LocaleContext.Provider>;
};

export { LocaleProvider };
