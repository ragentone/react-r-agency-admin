import { FooterCopyRight } from '@core/layout/components/FooterCopyRight.tsx';
import { useMenuText } from '@core/menu/components/use.menu.text.ts';
import { useRouterState } from '@tanstack/react-router';
import { cn } from '@ui/lib';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import { motion } from 'framer-motion';
import { ChevronRight, ExternalLink, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { getLinkPath, LINKS_MENU_SIDE } from '../const.ts';
import { useLinks } from '../hooks';
import { LinkManager } from '../manager.ts';
import { useLinkOpenStore } from '../store.ts';
import { LINK_KIND_ICONS } from '../utils.ts';

/**
 * Links menu ("Legal & links"): own drawer from the right with all visible links, grouped
 * (legal, app groups, custom). A tap opens the link page `/link/<id>` (or a new tab for urls).
 */
export const LinksMenuDrawer: React.FC = () => {
  const { t } = useTranslation('links');
  const text = useMenuText();
  const open = useLinkOpenStore(state => state.menuOpen);
  const setOpen = useLinkOpenStore(state => state.setMenuOpen);
  const { groups } = useLinks();
  const pathname = useRouterState({ select: state => state.location.pathname });
  let index = 0;

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection={LINKS_MENU_SIDE}>
      <DrawerContent className="[--drawer-inset:0px] data-[swipe-axis=x]:[--drawer-content-width:min(86vw,22rem)] rounded-none rounded-l-3xl border-0 border-l border-border/50 bg-background">
        <div className="flex h-full min-h-0 flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-between gap-2 py-3 pr-3 pl-6">
            <div className="min-w-0 flex-1">
              <DrawerTitle className="truncate text-title font-bold tracking-tight">
                {t('menu.title')}
              </DrawerTitle>
              <DrawerDescription className="truncate text-caption text-muted-foreground">
                {t('menu.description')}
              </DrawerDescription>
            </div>
            <button
              type="button"
              aria-label={t('menu.close')}
              onClick={() => setOpen(false)}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav
            aria-label={t('menu.title')}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-border/50 px-3 pb-3"
          >
            {groups.length === 0 && (
              <p className="px-3 py-8 text-center text-body text-muted-foreground">
                {t('menu.empty')}
              </p>
            )}
            {groups.map((group, groupIndex) => (
              <section
                key={group.id}
                className={cn(groupIndex > 0 && 'mt-2 border-t border-border/50 pt-2')}
              >
                <h3 className="px-3 pt-3 pb-1 text-micro font-semibold tracking-wider text-muted-foreground uppercase">
                  {text(group.config.label)}
                </h3>
                <ul className="flex flex-col gap-0.5">
                  {group.links.map(link => {
                    const Icon = link.icon ?? LINK_KIND_ICONS[link.kind ?? 'custom'];
                    const external = link.content.type === 'url';
                    const current = !external && pathname === getLinkPath(link.id);
                    const delay = Math.min(index++, 12) * 0.03;
                    return (
                      <motion.li
                        key={link.id}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 + delay, duration: 0.25, ease: 'easeOut' }}
                      >
                        <button
                          type="button"
                          aria-current={current ? 'page' : undefined}
                          onClick={() => {
                            if (!external) setOpen(false);
                            LinkManager.open(link.id);
                          }}
                          className="flex w-full items-center gap-4 rounded-2xl px-3 py-2.5 text-left text-foreground/90 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:bg-foreground/[0.06] [-webkit-tap-highlight-color:transparent] hover:bg-foreground/[0.04] aria-[current=page]:bg-foreground/[0.06] aria-[current=page]:font-bold"
                        >
                          <Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-body font-medium">
                              {text(link.label)}
                            </span>
                            {link.description && (
                              <span className="truncate text-caption text-muted-foreground">
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
                      </motion.li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </nav>

          {/* Copyright – lives with the legal links (imprint, terms, privacy). */}
          <div className="shrink-0 border-t border-border/50 px-6 py-3">
            <FooterCopyRight className="text-micro font-medium" />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
