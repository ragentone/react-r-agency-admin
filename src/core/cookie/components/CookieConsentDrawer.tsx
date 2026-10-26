import { Core } from '@core/core.api.ts';
import { isLinkPath } from '@core/links/const.ts';
import { useRouterState } from '@tanstack/react-router';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import { Cookie, ShieldCheck } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useCookieStore } from '../store.ts';

export const CookieConsentDrawer: React.FC = () => {
  const { t } = useTranslation('cookie');
  const isOpen = useCookieStore(s => s.isOpen);
  const status = useCookieStore(s => s.status);
  // First visit: the banner steps aside while privacy / imprint are read (link pages) and
  // comes back afterwards – the consent stays pending until the user decides.
  const onLinkPage = useRouterState({ select: state => isLinkPath(state.location.pathname) });
  const hidden = status === 'pending' && onLinkPage;
  const isLoading = useCookieStore(s => s.isLoading);
  const accept = useCookieStore(s => s.accept);
  const reject = useCookieStore(s => s.reject);

  return (
    <Drawer
      open={isOpen && !hidden}
      onOpenChange={open => {
        if (!open) {
          useCookieStore.getState().close();
        }
      }}
      dismissible={false}
      nested={false}
    >
      <DrawerContent className="max-w-2xl mx-auto rounded-t-2xl sm:rounded-2xl sm:mb-4 outline-none border border-border shadow-2xl bg-card">
        <DrawerHeader className="text-left space-y-3 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Cookie className="h-5 w-5" />
            </div>
            <div>
              <DrawerTitle className="text-lg font-semibold tracking-tight">
                {t('title', 'Cookie-Einstellungen')}
              </DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground mt-1">
                {t(
                  'description',
                  'Wir verwenden Cookies und ähnliche Technologien, um Ihnen ein optimales Webseiten-Erlebnis zu bieten und unsere Dienste stetig zu verbessern.'
                )}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="px-4 py-2 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border bg-muted/40 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-medium text-foreground block">
                  {t('essential.title', 'Notwendige Cookies')}
                </span>
                <span className="text-muted-foreground block leading-relaxed">
                  {t(
                    'essential.description',
                    'Diese Cookies sind für den grundlegenden Betrieb der Website erforderlich und können nicht deaktiviert werden.'
                  )}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-muted/40 flex items-start gap-2.5">
              <Cookie className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-medium text-foreground block">
                  {t('analytics.title', 'Analyse & Personalisierung')}
                </span>
                <span className="text-muted-foreground block leading-relaxed">
                  {t(
                    'analytics.description',
                    'Helfen uns zu verstehen, wie Besucher mit der Website interagieren, um die Benutzerfreundlichkeit zu optimieren.'
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-1">
            <button
              type="button"
              onClick={() => Core.links.open('privacy')}
              className="hover:underline hover:text-foreground transition-colors cursor-pointer"
            >
              {t('privacyPolicy', 'Datenschutzerklärung')}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => Core.links.open('imprint')}
              className="hover:underline hover:text-foreground transition-colors cursor-pointer"
            >
              {t('imprint', 'Impressum')}
            </button>
          </div>
        </div>

        <DrawerFooter className="flex-col sm:flex-row-reverse gap-2 pt-2">
          <Button
            type="button"
            className="w-full sm:w-auto font-medium"
            disabled={isLoading}
            onClick={() => void accept()}
          >
            {t('actions.acceptAll', 'Alle akzeptieren')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto font-medium"
            disabled={isLoading}
            onClick={() => void reject()}
          >
            {t('actions.rejectAll', 'Nur essenzielle akzeptieren')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
