import { useApp } from '@core/app';
import { CoreVariables } from '@core/core.variables.ts';
import { useRouter } from '@tanstack/react-router';
import { AppHeader, type AppHeaderProps } from '@ui/components/AppHeader';
import { useTranslation } from 'react-i18next';

import { useHideOnScroll } from '../hooks/use.hide.on.scroll.ts';

export interface IPageTopBarProps extends Omit<AppHeaderProps, 'onBack' | 'onTitleClick'> {
  /** `true`: back arrow with browser back (home without history). Function: own handler. */
  back?: boolean | (() => void);
  /** Tap on the title. Default: scroll the page content to the top. */
  onScrollTop?: () => void;
  /** Phones: hide the bar while scrolling down, show it again when scrolling up (like X). */
  hideOnScroll?: boolean;
}

/**
 * The top bar of a route page: `AppHeader` wired to the app – back navigation, translated
 * back label and "tap the title to scroll to the top".
 */
export const PageTopBar = ({
  back,
  backLabel,
  onScrollTop,
  hideOnScroll = false,
  ...props
}: IPageTopBarProps) => {
  const { t } = useTranslation('layout');
  const router = useRouter();
  const { layout } = useApp();
  const hidden = useHideOnScroll(hideOnScroll);

  const goBack = () => {
    if (typeof back === 'function') return back();
    if (window.history.length > 1) router.history.back();
    else void router.navigate({ to: CoreVariables.routePathHome });
  };

  return (
    <AppHeader
      {...props}
      hidden={hidden}
      onBack={back ? goBack : undefined}
      backLabel={backLabel ?? t('back')}
      onTitleClick={onScrollTop ?? (() => layout.content.scrollTop(true))}
    />
  );
};
