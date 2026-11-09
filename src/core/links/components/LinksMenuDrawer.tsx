import { FooterCopyRight } from '@core/layout/components/FooterCopyRight.tsx';
import { useMenuText } from '@core/menu/components/use.menu.text.ts';
import { useRouterState } from '@tanstack/react-router';
import { cn } from '@ui/lib';
import { AppDrawer } from '@ui/patterns';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from '@ui/shad-cn/components/empty.tsx';
import { ChevronRight, ExternalLink, Link2Off } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { getLinkPath, LINKS_MENU_SIDE } from '../const.ts';
import { useLinks } from '../hooks';
import { LinkManager } from '../manager.ts';
import { useLinkOpenStore } from '../store.ts';
import { LINK_KIND_ICONS } from '../utils.ts';

/**
 * Links menu ("Legal & links"): own bottom drawer with all visible links, grouped
 * (legal, app groups, custom). A tap opens the link page `/link/<id>` (or a new tab for urls).
 */
export const LinksMenuDrawer: React.FC = () => {
  const { t } = useTranslation('links');
  const text = useMenuText();
  const open = useLinkOpenStore(state => state.menuOpen);
  const setOpen = useLinkOpenStore(state => state.setMenuOpen);
  const { groups } = useLinks();
  const pathname = useRouterState({ select: state => state.location.pathname });

  return (
    <AppDrawer
      open={open}
      onOpenChange={setOpen}
      title={t('menu.title')}
      description={t('menu.description')}
      closeLabel={t('menu.close')}
      direction={LINKS_MENU_SIDE}
      bodyClassName="px-0 pt-0"
      // Copyright – lives with the legal links (imprint, terms, privacy).
      footer={<FooterCopyRight className="text-micro font-medium" />}
    >
      <nav aria-label={t('menu.title')}>
        {groups.length === 0 && (
          <Empty className="px-8 py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Link2Off aria-hidden="true" />
              </EmptyMedia>
              <EmptyDescription>{t('menu.empty')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        {groups.map((group, groupIndex) => (
          <section
            key={group.id}
            className={cn(groupIndex > 0 && 'mt-2 border-t border-border/50 pt-2')}
          >
            <h3 className="px-4 pt-3 pb-1 text-micro font-medium tracking-wider text-muted-foreground uppercase">
              {text(group.config.label)}
            </h3>
            <ul className="flex flex-col">
              {group.links.map(link => {
                const Icon = link.icon ?? LINK_KIND_ICONS[link.kind ?? 'custom'];
                const external = link.content.type === 'url';
                const current = !external && pathname === getLinkPath(link.id);
                return (
                  <li key={link.id}>
                    <button
                      type="button"
                      aria-current={current ? 'page' : undefined}
                      onClick={() => {
                        if (!external) setOpen(false);
                        LinkManager.open(link.id);
                      }}
                      className="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left font-medium text-foreground transition-colors outline-none [-webkit-tap-highlight-color:transparent] hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset active:bg-accent aria-[current=page]:font-bold"
                    >
                      <Icon className="size-5 shrink-0" aria-hidden="true" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-body">{text(link.label)}</span>
                        {link.description && (
                          <span className="truncate text-caption font-normal text-muted-foreground">
                            {text(link.description)}
                          </span>
                        )}
                      </span>
                      {external ? (
                        <ExternalLink
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-label={t('external.hint')}
                        />
                      ) : (
                        <ChevronRight
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>
    </AppDrawer>
  );
};
