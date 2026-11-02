import { AppFormDrawer } from '@ui/patterns';
import { Alert, AlertDescription, AlertTitle } from '@ui/shad-cn/components/alert.tsx';
import { Checkbox } from '@ui/shad-cn/components/checkbox.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Label } from '@ui/shad-cn/components/label.tsx';
import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePluginCreate } from '../hooks/use-plugin-create';
import { PLUGIN_SLOT_OPTIONS } from '../types';

interface IPluginCreateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (pluginId: string) => void;
}

const ID_PATTERN = /^[a-z][a-z0-9-]{1,47}$/;
const ERROR_KEYS = ['invalid_manifest', 'exists', 'not_authorized'] as const;

/** Form for a new development plugin: id, name and the slots it will use. */
export const PluginCreateDrawer: React.FC<IPluginCreateDrawerProps> = ({
  open,
  onOpenChange,
  onCreated,
}) => {
  const { t } = useTranslation('admin');
  const idId = useId();
  const nameId = useId();
  const [pluginId, setPluginId] = useState('');
  const [name, setName] = useState('');
  const [slots, setSlots] = useState<string[]>(['home.widget']);
  const { busy, result, create, reset } = usePluginCreate(() => undefined);

  const idValid = ID_PATTERN.test(pluginId);
  const valid = idValid && name.trim().length > 0 && slots.length > 0;

  const toggleSlot = (slot: string, checked: boolean) =>
    setSlots(current => (checked ? [...current, slot] : current.filter(item => item !== slot)));

  const close = (next: boolean) => {
    if (busy) return;
    if (!next) {
      setPluginId('');
      setName('');
      setSlots(['home.widget']);
      reset();
    }
    onOpenChange(next);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!valid) return;
    const response = await create({ pluginId, name: name.trim(), slots });
    if (response.success) {
      onCreated(pluginId);
      close(false);
    }
  };

  const errorKey =
    result?.error && (ERROR_KEYS as readonly string[]).includes(result.error)
      ? result.error
      : 'unknown';

  return (
    <AppFormDrawer
      open={open}
      onOpenChange={close}
      title={t('plugins.create.title')}
      description={t('plugins.create.description')}
      onSubmit={submit}
      submitLabel={busy ? t('plugins.create.busy') : t('plugins.create.submit')}
      submitDisabled={!valid}
      busy={busy}
      locked={busy}
    >
      <div className="flex flex-col gap-4 px-4 py-3">
        <p className="text-caption text-muted-foreground">{t('plugins.create.description')}</p>
        <div className="flex flex-col gap-2">
          <Label htmlFor={idId}>{t('plugins.create.idLabel')}</Label>
          <Input
            id={idId}
            value={pluginId}
            disabled={busy}
            autoComplete="off"
            onChange={event => setPluginId(event.target.value.trim())}
            className="h-12 text-base"
          />
          <p className="text-caption text-muted-foreground">{t('plugins.create.idHint')}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={nameId}>{t('plugins.create.nameLabel')}</Label>
          <Input
            id={nameId}
            value={name}
            disabled={busy}
            onChange={event => setName(event.target.value)}
            className="h-12 text-base"
          />
        </div>
        <fieldset className="flex flex-col gap-3">
          <legend className="text-caption font-medium">{t('plugins.create.slotsLabel')}</legend>
          {PLUGIN_SLOT_OPTIONS.map(slot => (
            <label key={slot} className="flex items-center gap-3 text-body">
              <Checkbox
                checked={slots.includes(slot)}
                disabled={busy}
                onCheckedChange={checked => toggleSlot(slot, checked === true)}
              />
              <span className="font-mono text-caption">{slot}</span>
            </label>
          ))}
        </fieldset>
        {result && !result.success && (
          <Alert variant="destructive">
            <AlertTitle>{t(`plugins.create.errors.${errorKey}`)}</AlertTitle>
            {result.errors && result.errors.length > 0 && (
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {result.errors.map(message => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </AlertDescription>
            )}
          </Alert>
        )}
      </div>
    </AppFormDrawer>
  );
};
