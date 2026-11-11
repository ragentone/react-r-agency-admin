import { AppDialog } from '@ui/components';
import { Alert, AlertTitle } from '@ui/shad-cn/components/alert.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Form, Formik } from 'formik';
import React, { useEffect,useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { PluginApi } from '../api';
import { parseEnv, serializeEnv } from '../env.format';
import { createEnvValidationSchema, type IEnvFormValues } from '../env.validation';
import { PluginEnvEditor } from './PluginEnvEditor';

interface IPluginEnvDialogProps {
  pluginId: string;
  pluginName: string;
  /** Env file of the project, e.g. `.env.dev`. */
  path: string;
  onClose: () => void;
}

/** Env file as dialog with a validated key/value form. Mount it with a `key` per path. */
export const PluginEnvDialog: React.FC<IPluginEnvDialogProps> = ({
  pluginId,
  pluginName,
  path,
  onClose,
}) => {
  const { t } = useTranslation('admin');
  const [content, setContent] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const schema = useMemo(() => createEnvValidationSchema(t), [t]);
  const initialValues = useMemo<IEnvFormValues>(
    () => ({ rows: parseEnv(content ?? '') }),
    [content]
  );

  useEffect(() => {
    let active = true;
    void PluginApi.readFile(pluginId, path).then(result => {
      if (!active) return;
      if (result.success) setContent(result.content ?? '');
      else setLoadError(result.error ?? 'unknown');
    });
    return () => {
      active = false;
    };
  }, [pluginId, path]);

  const onSubmit = async (values: IEnvFormValues) => {
    setSaveError(null);
    const result = await PluginApi.writeFile(pluginId, path, serializeEnv(values.rows));
    if (result.success) {
      toast.success(t('plugins.code.saved', { path }));
      onClose();
    } else {
      setSaveError(result.error ?? 'unknown');
    }
  };

  return (
    <Formik<IEnvFormValues>
      initialValues={initialValues}
      validationSchema={schema}
      enableReinitialize
      onSubmit={onSubmit}
    >
      {({ dirty, isSubmitting, isValid, resetForm }) => {
        const requestClose = () => {
          if (dirty) {
            toast.warning(t('plugins.code.unsaved'));
            return;
          }
          onClose();
        };
        return (
          <AppDialog
            open
            onOpenChange={open => !open && requestClose()}
            title={path}
            description={pluginName}
            size="lg"
            footer={
              <div className="flex w-full justify-end gap-2">
                <Button
                  variant="outline"
                  disabled={!dirty || isSubmitting}
                  onClick={() => resetForm()}
                >
                  {t('plugins.code.discard')}
                </Button>
                <Button variant="outline" disabled={isSubmitting} onClick={requestClose}>
                  {t('plugins.code.env.cancel')}
                </Button>
                <Button
                  type="submit"
                  form="plugin-env-form"
                  disabled={!dirty || !isValid || isSubmitting || content === null}
                >
                  {isSubmitting ? t('plugins.code.saving') : t('plugins.code.save')}
                </Button>
              </div>
            }
          >
            <Form id="plugin-env-form" className="flex flex-col gap-3 py-4 px-3">
              {loadError && (
                <Alert variant="destructive">
                  <AlertTitle>
                    {t(`plugins.code.errors.${loadError}`, {
                      defaultValue: t('plugins.code.errors.unknown'),
                    })}
                  </AlertTitle>
                </Alert>
              )}
              {saveError && (
                <Alert variant="destructive">
                  <AlertTitle>
                    {t(`plugins.code.errors.${saveError}`, {
                      defaultValue: t('plugins.code.errors.unknown'),
                    })}
                  </AlertTitle>
                </Alert>
              )}
              {content === null && !loadError && (
                <p className="text-sm text-muted-foreground">{t('plugins.code.loading')}</p>
              )}
              {content !== null && <PluginEnvEditor disabled={isSubmitting} />}
            </Form>
          </AppDialog>
        );
      }}
    </Formik>
  );
};
