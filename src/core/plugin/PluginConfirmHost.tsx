import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { useTranslation } from 'react-i18next';

import { usePluginConfirmStore } from './plugin.confirm';

/** Renders the plugin confirm dialog (`api.confirm`). Mounted once in the app root. */
export const PluginConfirmHost = () => {
  const { t } = useTranslation('base');
  const request = usePluginConfirmStore(state => state.request);
  const answer = usePluginConfirmStore(state => state.answer);
  const destructive = request?.variant === 'destructive';

  return (
    <AlertDialog open={request !== undefined} onOpenChange={next => !next && answer(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{request?.title}</AlertDialogTitle>
          {request?.description && <AlertDialogDescription>{request.description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline" size="lg" fullWidth className="sm:w-auto" onClick={() => answer(false)}>
            {request?.cancelLabel ?? t('confirm.cancel')}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            size="lg"
            fullWidth
            className="sm:w-auto"
            onClick={() => answer(true)}
          >
            {request?.confirmLabel ?? t('confirm.ok')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
