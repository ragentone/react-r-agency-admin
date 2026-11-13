import { PageHeader } from '@core/layout';
import { RoutePage } from '@router/components';
import { useNavigate, useParams, useRouter } from '@tanstack/react-router';
import { FullscreenPage } from '@ui/base/FullscreenPage.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SitePageView } from '../components/SitePageView';
import { useSitePage } from '../hooks';
import { useSitePageDisplayMode } from '../hooks/use.site.page.mode';

/**
 * `/site/$slug`: public dynamic page. The display mode is read first: `route` inside the app
 * layout (route page header, full width – the blocks keep their own column), `fullscreen` as
 * overlay over the screen (shared page header).
 */
export const PageSite: React.FC = () => {
  const { slug } = useParams({ strict: false }) as { slug?: string };
  return <SitePageLoader key={slug} slug={slug ?? ''} />;
};

/** Loads the page and its display mode in parallel; the wrapper waits for the mode. */
const SitePageLoader: React.FC<{ slug: string }> = ({ slug }) => {
  const navigate = useNavigate();
  const router = useRouter();
  const { t } = useTranslation('admin');
  const { state, retry, replace } = useSitePage(slug);
  const mode = useSitePageDisplayMode(slug);
  const title = state.status === 'ready' ? state.page.title : '';
  // Back: the previous page of the app, or the start page when this page was opened directly.
  const back = () =>
    window.history.length > 1 ? router.history.back() : void navigate({ to: '/' });
  const view = <SitePageView slug={slug} state={state} retry={retry} replace={replace} />;

  // Mode not known yet: neutral surface, so no layout flashes before the wrapper is chosen.
  if (mode === null) return <div aria-busy="true" className="min-h-dvh" />;

  const backButton = (
    <Button variant="ghost" size="icon-lg" onClick={back} aria-label={t('back')}>
      <ArrowLeft className="size-5" />
    </Button>
  );

  if (mode === 'fullscreen') {
    return (
      <FullscreenPage open title={title} layout="full" onClose={back}>
        <div className="flex min-h-0 flex-1 flex-col">
          <PageHeader title={title} fullWidth={true} leading={backButton} />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(2rem,env(safe-area-inset-bottom))]">
            {view}
          </div>
        </div>
      </FullscreenPage>
    );
  }

  return (
    <RoutePage
      width="100%"
      scrollable={true}
      classes={{ scroll: 'p-0 sm:border-x-0' }}
      header={{ title, leading: backButton }}
    >
      {view}
    </RoutePage>
  );
};
