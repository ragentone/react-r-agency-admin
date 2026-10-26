import { CoreVariables } from '@core/core.variables.ts';
import { FooterCopyRight } from '@core/layout/components/FooterCopyRight.tsx';
import { useMenuText } from '@core/menu/components/use.menu.text.ts';
import { RoutePage } from '@router/components';
import { useParams, useRouter } from '@tanstack/react-router';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty.tsx';
import { ArrowLeft, Link2Off, Share2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { LinkContentView } from '../components/LinkContent.tsx';
import { getLinkPath, LINK_GROUP_LEGAL } from '../const.ts';
import { useLinkAccess, useLinkRegistry, useLinkRoute, useLinks } from '../hooks';
import { LinkManager } from '../manager.ts';
import { formatLinkDate } from '../utils.ts';

/** Sticky, blurred X-style top bar: back arrow, title (+ "last updated"), share. */
const LinkPageHeader: React.FC<{
  title: string;
  subtitle?: string;
  onBack: () => void;
  onShare?: () => void;
}> = ({ title, subtitle, onBack, onShare }) => {
  const { t } = useTranslation('links');
  return (
    <header className="sticky top-0 z-20 border-b border-border/50 bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex min-h-14 items-center gap-4 px-2 py-1.5 sm:gap-6 sm:px-3">
        <Button variant="ghost" size="icon-md" onClick={onBack} aria-label={t('back')}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl leading-6 font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-caption leading-4 text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {onShare && (
          <Button variant="ghost" size="icon-md" onClick={onShare} aria-label={t('share')}>
            <Share2 className="size-[1.125rem]" />
          </Button>
        )}
      </div>
    </header>
  );
};

/** The other legal pages + copyright under the content (X footer style). */
const LinkPageFooter: React.FC<{ currentId: string }> = ({ currentId }) => {
  const text = useMenuText();
  const { openLink } = useLinkRoute();
  const { links } = useLinks({ groups: [LINK_GROUP_LEGAL] });
  const others = links.filter(link => link.id !== currentId);

  return (
    <footer className="mt-10 flex flex-col gap-2 border-t border-border/50 px-4 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6">
      {others.length > 0 && (
        <nav className="-ml-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          {others.map(link => (
            <Button
              key={link.id}
              variant="link"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() =>
                link.content.type === 'url' ? LinkManager.open(link.id) : openLink(link.id)
              }
            >
              {text(link.label)}
            </Button>
          ))}
        </nav>
      )}
      <FooterCopyRight className="text-micro font-medium" />
    </footer>
  );
};

/**
 * `/link/$linkId` – imprint, terms, privacy and app links as a regular page inside the layout
 * (menu / dock stay visible). Back arrow: back in the history or to the start page.
 */
export const PageLink: React.FC = () => {
  const { t, i18n } = useTranslation('links');
  const text = useMenuText();
  const router = useRouter();
  const { close } = useLinkRoute();
  const { linkId } = useParams({ strict: false }) as { linkId?: string };
  useLinkRegistry();
  const { allowed } = useLinkAccess();

  const entry = linkId ? LinkManager.get(linkId) : undefined;
  const link = entry && allowed(entry) ? entry : undefined;
  const title = link ? text(link.label) : t('notFound.title');
  const subtitle = link?.updatedAt
    ? t('updatedAt', { date: formatLinkDate(link.updatedAt, i18n.language) })
    : undefined;

  useEffect(() => {
    document.title = title;
  }, [title]);

  const share = async () => {
    if (!link) return;
    const url = `${window.location.origin}${getLinkPath(link.id)}`;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success(t('copied'));
    } catch {
      /* closed by the user / clipboard blocked */
    }
  };

  return (
    // Same 600px column as profile / account; phones edge to edge (no page padding).
    <RoutePage width={600} scrollable={true} classes={{ scroll: 'p-0 overscroll-contain' }}>
      {() => (
        <article className="flex min-h-full flex-col">
          <LinkPageHeader
            title={title}
            subtitle={subtitle}
            onBack={close}
            onShare={link ? () => void share() : undefined}
          />
          {link ? (
            <div className="flex-1 px-4 py-5 sm:px-6">
              <LinkContentView key={link.id} link={link} close={close} />
            </div>
          ) : (
            <Empty className="flex-1 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Link2Off />
                </EmptyMedia>
                <EmptyTitle>{t('notFound.title')}</EmptyTitle>
                <EmptyDescription>{t('notFound.description')}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  onClick={() =>
                    void router.navigate({ to: CoreVariables.routePathHome, replace: true })
                  }
                >
                  {t('toHome')}
                </Button>
              </EmptyContent>
            </Empty>
          )}
          <LinkPageFooter currentId={link?.id ?? ''} />
        </article>
      )}
    </RoutePage>
  );
};
