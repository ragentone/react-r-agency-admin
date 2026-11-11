import { RoutePage } from '@router/components';
import { useNavigate, useParams } from '@tanstack/react-router';
import { FullscreenPage } from '@ui/base/FullscreenPage.tsx';
import React from 'react';

import { SitePageView } from '../components/SitePageView';
import { useSitePage } from '../hooks';

/**
 * `/site/$slug`: public dynamic page (created in the admin area). The page decides how it opens:
 * `route` inside the app layout (full width – the blocks keep their own column), `fullscreen`
 * as overlay over the whole screen. Same behaviour as for visitors.
 */
export const PageSite: React.FC = () => {
  const { slug } = useParams({ strict: false }) as { slug?: string };
  return <SitePageLoader key={slug} slug={slug ?? ''} />;
};

/** Loads the page once and picks the wrapper from its display mode. */
const SitePageLoader: React.FC<{ slug: string }> = ({ slug }) => {
  const navigate = useNavigate();
  const { state, retry, replace } = useSitePage(slug);
  const page = state.status === 'ready' ? state.page : null;
  const view = (
    <SitePageView slug={slug} state={state} retry={retry} replace={replace} />
  );

  if (page?.displayMode === 'fullscreen') {
    // Escape / close leaves the page and goes back to the start page.
    return (
      <FullscreenPage
        open
        title={page.title}
        layout="full"
        contentClassName="overflow-y-auto overscroll-contain pb-[max(2rem,env(safe-area-inset-bottom))]"
        onClose={() => void navigate({ to: '/' })}
      >
        {view}
      </FullscreenPage>
    );
  }
  return (
    <RoutePage width="100%" scrollable={true} classes={{ scroll: 'p-0 sm:border-x-0' }}>
      {view}
    </RoutePage>
  );
};
