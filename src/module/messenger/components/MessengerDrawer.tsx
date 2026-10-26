import { UserRole } from '@core/auth';
import { cn } from '@ui/lib/utils.ts';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import { useIsMobile } from '@ui/shad-cn/hooks/use-mobile.ts';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { MESSENGER_PRIMARY_COLOR, MESSENGER_USER_ROLE } from '../const.ts';
import { useMessengerStore } from '../store.ts';
import { MessengerChat } from './MessengerChat.tsx';
import { MessengerCompose } from './MessengerCompose.tsx';
import { MessengerInbox } from './MessengerInbox.tsx';

/**
 * Sizing: fullscreen on phones (like the Messenger app), a large centered sheet from `md`
 * with inbox + chat side by side. Inline style → wins over the drawer's default max height.
 */
const SIZE_STYLE = {
  '--drawer-content-max-height': 'var(--messenger-height)',
  '--drawer-height': 'var(--messenger-height)',
} as React.CSSProperties;

/** Messenger (Facebook Messenger look): inbox, chat, "new message". */
export const MessengerDrawer: React.FC = () => {
  const { t } = useTranslation('messenger');
  const open = useMessengerStore(state => state.open);
  const activePeerId = useMessengerStore(state => state.activePeerId);
  const composing = useMessengerStore(state => state.composing);
  const closeMessenger = useMessengerStore(state => state.closeMessenger);
  const mobile = useIsMobile();
  const reduceMotion = useReducedMotion();

  const side = composing ? <MessengerCompose /> : <MessengerInbox />;
  // Phones: one view at a time, sliding like a native stack.
  const mobileView = activePeerId ? 'chat' : composing ? 'compose' : 'inbox';
  const slide = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : mobileView === 'inbox'
      ? {
          initial: { x: '-25%', opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: '-25%', opacity: 0 },
        }
      : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } };

  return (
    <Drawer open={open} onOpenChange={next => !next && closeMessenger()}>
      <DrawerContent
        style={SIZE_STYLE}
        className={cn(
          'mx-auto w-full overflow-hidden [--messenger-height:100dvh] md:max-w-260 md:[--messenger-height:min(88dvh,56rem)]',
          // Phones: edge to edge like an app screen.
          'max-md:rounded-none max-md:border-0 max-md:[--drawer-inset:0px]'
        )}
      >
        <UserRole role={MESSENGER_USER_ROLE}>
          <DrawerTitle className="sr-only">{t('title')}</DrawerTitle>
          <DrawerDescription className="sr-only">{t('description')}</DrawerDescription>

          {mobile ? (
            <div className="relative min-h-0 flex-1 overflow-hidden pt-[env(safe-area-inset-top)]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={mobileView}
                  {...slide}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex flex-col bg-background"
                >
                  {mobileView === 'chat' && activePeerId ? (
                    <MessengerChat peerId={activePeerId} />
                  ) : mobileView === 'compose' ? (
                    <MessengerCompose />
                  ) : (
                    <MessengerInbox />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1">
              <aside className="flex w-85 shrink-0 flex-col border-r border-border/60 lg:w-90">
                {side}
              </aside>
              <section className="flex min-w-0 flex-1 flex-col">
                {activePeerId ? (
                  <MessengerChat key={activePeerId} peerId={activePeerId} />
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                    <span
                      className="grid size-20 place-items-center rounded-full text-white"
                      style={{ background: MESSENGER_PRIMARY_COLOR }}
                    >
                      <MessageCircle className="size-10" strokeWidth={2} />
                    </span>
                    <h2 className="text-xl font-bold">{t('inbox.selectTitle')}</h2>
                    <p className="max-w-xs text-body text-muted-foreground">
                      {t('inbox.selectText')}
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}
        </UserRole>
      </DrawerContent>
    </Drawer>
  );
};
