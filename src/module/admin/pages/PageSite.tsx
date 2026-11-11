import { RoutePage } from '@router/components';
import { useNavigate, useParams, useRouter } from '@tanstack/react-router';
import { FullscreenPage } from '@ui/base/FullscreenPage.tsx';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SitePageView } from '../components/SitePageView';
import { useSitePage } from '../hooks';
import { useSitePageDisplayMode } from '../hooks/use.site.page.mode';

/**
 * `/site/$slug`: public dynamic page. The display mode is read first: `route` inside the app
 * layout (full width – the blocks keep their own column), `fullscreen` as overlay over the screen.
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
  const heroFirst = state.status === 'ready' && state.page.blocks?.[0]?.type === 'hero';
  // Banner first: the bar floats over it instead of pushing it down.
  const floating = heroFirst;
  // Back: the previous page of the app, or the start page when this page was opened directly.
  const back = () =>
    window.history.length > 1 ? router.history.back() : void navigate({ to: '/' });
  const view = <SitePageView slug={slug} state={state} retry={retry} replace={replace} />;

  // Mode not known yet: neutral surface, so no layout flashes before the wrapper is chosen.
  if (mode === null) return <div aria-busy="true" className="min-h-dvh" />;

  const bar = (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center gap-2 px-2',
        floating
          ? mode === 'fullscreen'
            ? 'pointer-events-none absolute inset-x-0 top-0 z-10'
            : 'pointer-events-none sticky top-0 z-10 -mb-14'
          : mode === 'fullscreen'
            ? 'border-b border-border/50 bg-background/80 backdrop-blur-md'
            : 'sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-md'
      )}
    >
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={back}
        aria-label={t('back')}
        className={cn(floating && 'pointer-events-auto bg-background/70 backdrop-blur-md')}
      >
        <ArrowLeft className="size-5" />
      </Button>
      <p className={cn('min-w-0 flex-1 truncate text-title font-bold', floating && 'sr-only')}>
        {title}
      </p>
    </header>
  );

  if (mode === 'fullscreen') {
    return (
      <FullscreenPage open title={title} layout="full" onClose={back}>
        <div className="relative flex min-h-0 flex-1 flex-col">
          {bar}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(2rem,env(safe-area-inset-bottom))]">
            {view}
          </div>
        </div>
      </FullscreenPage>
    );
  }
  return (
    <RoutePage width="100%" scrollable={true} classes={{ scroll: 'p-0 sm:border-x-0' }}>
      {bar}
      {view}
    </RoutePage>
  );
};
