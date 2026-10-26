import {
  authButtonPrimary,
  authButtonSecondary,
  authInput,
} from '@core/auth/components/auth.styles.ts';
import { AuthProgressBar } from '@core/auth/components/AuthProgressBar.tsx';
import { useAuth } from '@core/auth/components/use.auth.ts';
import { CoreVariables } from '@core/core.variables.ts';
import type { ExtensionComponent } from '@core/extension';
import { useGraphQl } from '@core/mesh';
import { UserDeleteDocument } from '@generated/graphql/graphql.ts';
import { useRouter } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/shad-cn/components/dialog.tsx';
import { Field, FieldContent, FieldGroup } from '@ui/shad-cn/components/field.tsx';
import { Input } from '@ui/shad-cn/components/input';
import { Spinner } from '@ui/shad-cn/components/spinner.tsx';
import { Formik } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Extension component that listens for a `user_deleted_request` event and displays an alert
 * with the password payload when the event is triggered.
 * The component uses the `useEffect` hook to register an event listener on the core events of the context.
 * It specifically listens for the `auth:user_deleted_request` event and reacts by
 * invoking the provided callback function.
 * Note: The event listener is registered only once due to the empty dependencies array
 * in the `useEffect` hook.
 */
const ExtensionDeleteUser: ExtensionComponent = props => {
  const { t } = useTranslation('auth');
  const { userMeta, destroy } = useAuth();
  const { mutate } = useGraphQl();
  const { navigate } = useRouter();

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [progress, setProgress] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setDeleteConfirm(open);
    if (!open) {
      setCountdown(5);
    }
  };

  useEffect(() => {
    if (!deleteConfirm) {
      return;
    }

    const interval = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [deleteConfirm]);

  const handleConfirm = useCallback(
    async (pwd: string) => {
      setProgress(true);
      const { data } = await mutate({
        mutation: UserDeleteDocument,
        variables: {
          pwd,
        },
      });

      if (!data?.userDelete?.success) {
        setProgress(false);
        return;
      }

      destroy();
      setDeleteConfirm(false);
      await navigate({
        to: CoreVariables.routePathHome,
      });
      setProgress(false);
    },
    [destroy, mutate, navigate]
  );

  // Unsubscribe on unmount – otherwise a remounted extension leaves a dead listener behind.
  useEffect(
    () =>
      props.context.events.core.on('auth:user_deleted_request', async () => {
        setCountdown(5);
        setDeleteConfirm(true);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return userMeta ? (
    <Dialog open={deleteConfirm} onOpenChange={handleOpenChange}>
      <DialogContent>
        <Formik<{ pwd: string }>
          initialValues={{ pwd: '' }}
          onSubmit={async values => {
            await handleConfirm(values.pwd);
          }}
        >
          {({ submitForm, handleChange, values }) => (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t('deleteDialog.title', { defaultValue: 'Delete Account' })}
                </DialogTitle>
                <DialogDescription>
                  {t('deleteDialog.description', {
                    defaultValue:
                      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.',
                  })}
                </DialogDescription>
                <AuthProgressBar active={progress} />
              </DialogHeader>

              {userMeta.userType === 'default' && (
                <FieldGroup>
                  <Field>
                    <FieldContent>
                      <Input
                        disabled={countdown > 0 || progress}
                        onChange={handleChange}
                        value={values.pwd}
                        type={'password'}
                        name={'pwd'}
                        autoComplete={'current-password'}
                        className={authInput}
                        placeholder={t('deleteDialog.password', {
                          defaultValue: 'Password',
                        })}
                      />
                    </FieldContent>
                  </Field>
                </FieldGroup>
              )}

              <DialogFooter className={'flex flex-col gap-3 sm:flex-row'}>
                <Button
                  className={cn(authButtonPrimary, 'sm:flex-1')}
                  disabled={countdown > 0 || progress}
                  onClick={submitForm}
                >
                  {progress && <Spinner />}
                  {t('deleteDialog.confirm', { defaultValue: 'Delete my user' })}
                  {countdown > 0 ? ` ${countdown}` : ''}
                </Button>
                <Button
                  className={cn(authButtonSecondary, 'sm:w-auto sm:px-6')}
                  disabled={progress}
                  onClick={() => handleOpenChange(false)}
                >
                  {t('deleteDialog.cancel', { defaultValue: 'Abort' })}
                </Button>
              </DialogFooter>
            </>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  ) : null;
};

export { ExtensionDeleteUser };
