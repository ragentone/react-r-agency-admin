import './App.css';
import './index.css';

import { ApplicationProvider } from '@core/app';
import { ProviderComposer } from '@core/components';
import { ErrorBoundary } from '@core/error';
import { EventsProvider } from '@core/event';
import { GeoProvider } from '@core/geo';
import { LocaleProvider } from '@core/i18n';
import { MeshProvider } from '@core/mesh';
import { NotifyProvider } from '@core/notify';
import { ThemeProvider } from '@core/theme';
import { RouterProvider } from '@tanstack/react-router';

import { router } from './router/router.instance.ts';

/**
 * Represents the main App component of the application.
 * It wraps the content with a MeshProvider.
 */
function App() {
  return (
    <ErrorBoundary>
      <ProviderComposer
        providers={[
          { provider: NotifyProvider },
          {
            provider: MeshProvider,
            props: {
              afterLoadDelay:0,
            },
          },
          { provider: EventsProvider },
          { provider: GeoProvider },
          { provider: ThemeProvider },
          { provider: LocaleProvider },
        ]}
      >
        <ApplicationProvider providers={[]}>
          <RouterProvider router={router} />
        </ApplicationProvider>
      </ProviderComposer>
    </ErrorBoundary>
  );
}

export default App;
