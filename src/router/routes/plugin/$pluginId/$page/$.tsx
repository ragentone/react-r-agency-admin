import { PageManager } from '@core/page/page.manager.tsx';
import {
  type IPluginPageProps,
  pagePermission,
  usePluginPage,
  usePluginsLoaded,
  usePluginUser,
} from '@core/plugin';
import { RoutePage } from '@router/components';
import { createFileRoute, type NotFoundRouteProps, useNavigate } from '@tanstack/react-router';
import { FullscreenPage } from '@ui/base/FullscreenPage';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty';
import { Spinner } from '@ui/shad-cn/components/spinner';
import { createElement, type FunctionComponent } from 'react';
import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@ui/lib';

/** Width of a `route` page, as CSS for `RoutePage`. `default` keeps the page's own default. */
const WIDTH: Record<'narrow' | 'default' | 'wide' | 'full', string | undefined> = {
  narrow: '480px',
  default: undefined,
  wide: '1100px',
  full: '100%',
};

/**
 * One route for every plugin page: `/plugin/<pluginId>/<page>` and `/plugin/<pluginId>/<page>/<path…>?<search>`.
 * `display: 'route'` renders inside the app (`RoutePage`), `display: 'fullscreen'` as overlay (`FullscreenPage`).
 * The plugin registers its page after the plugin list is loaded, so the route waits for that and then
 * looks the page up. Unknown plugin, unknown page, or a page the user may not open → 404.
 */
export const Route = createFileRoute('/plugin/$pluginId/$page/$')({
  // Keep every query parameter; the page decides what it means.
  validateSearch: (search: Record<string, unknown>) => search,
  component: PluginPageRoute,
});

function PluginPageRoute() {
  const { pluginId, page, _splat } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const loaded = usePluginsLoaded('admin');
  const entry = usePluginPage(pluginId, page);
  const user = usePluginUser();
  const { t } = useTranslation('base');

  if (!loaded) return <Spinner />;
  if (!entry) {
    console.warn(`[plugin:${pluginId}] page "${page}" is not available`);
    return createElement(
      PageManager.getPage('404') as FunctionComponent<NotFoundRouteProps>,
      {} as NotFoundRouteProps
    );
  }

  const access = pagePermission(entry, user);
  if (access === 'loading') return <Spinner />;

  // The router has already decoded `_splat`, so the segments are used as they are.
  const props: IPluginPageProps = { pluginId, path: _splat ? _splat.split('/') : [], search };
  // The page component is registered once by the plugin and stored outside React, so it keeps
  // its identity between renders (no state reset). `createElement` makes that explicit to the
  // react-hooks lint rule, which cannot see that the reference is stable.
  const content =
    access === 'denied' ? (
      <div className="flex h-full w-full items-center justify-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Lock className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>{t('plugin.pageDenied.title', { defaultValue: 'Kein Zugriff' })}</EmptyTitle>
            <EmptyDescription>
              {t('plugin.pageDenied.description', {
                defaultValue: 'Diese Seite ist für dein Konto nicht verfügbar.',
              })}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    ) : (
      createElement(entry.component, props)
    );

  if (entry.display === 'fullscreen') {
    // Escape / close leaves the page and goes back to the start page.
    return (
      <FullscreenPage open title={page} layout="full" onClose={() => void navigate({ to: '/' })}>
        {content}
      </FullscreenPage>
    );
  }
  return (
    <RoutePage
      width={WIDTH[entry.width]}
      scrollable={entry.scrollable}
      classes={{
        scroll: cn('', {
          'p-0': true,
          'sm:border-x-0': entry.width === 'full',
        }),
      }}
    >
      {content}
    </RoutePage>
  );
}
