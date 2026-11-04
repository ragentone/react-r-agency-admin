import { AppDrawer } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { usePluginConfirmStore } from './plugin.confirm';
import type { IPluginConfirmOptions } from './plugin.types';

/**
 * Renders the plugin confirm drawer (`api.confirm`). Mounted once in the app root.
 * Drawer instead of dialog: bottom sheet on phones, buttons within thumb reach.
 */
export const PluginConfirmHost = () => {
  const { t } = useTranslation('base');
  const request = usePluginConfirmStore(state => state.request);
  const answer = usePluginConfirmStore(state => state.answer);

  // Keep the last question while the drawer slides out, so the content does not vanish mid-animation.
  const lastRequest = useRef<IPluginConfirmOptions | undefined>(undefined);
  if (request) lastRequest.current = request;
  const shown = request ?? lastRequest.current;
  const destructive = shown?.variant === 'destructive';

  return (
    <AppDrawer
      open={request !== undefined}
      onOpenChange={next => !next && answer(false)}
      title={shown?.title ?? ''}
      description={shown?.description ?? shown?.title}
      size="auto"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" size="lg" fullWidth className="sm:w-auto" onClick={() => answer(false)}>
            {shown?.cancelLabel ?? t('confirm.cancel')}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            size="lg"
            fullWidth
            className="sm:w-auto"
            onClick={() => answer(true)}
          >
            {shown?.confirmLabel ?? t('confirm.ok')}
          </Button>
        </div>
      }
    >
      {shown?.description && <p className="text-body text-muted-foreground">{shown.description}</p>}
    </AppDrawer>
  );
};
