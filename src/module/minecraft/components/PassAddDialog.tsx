import { AppDialog } from '@ui/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';

/** Neuen Gamertag direkt eintragen (aktiv auf allen Servern). */
export const PassAddDialog: React.FC<{ onDone: () => void; onClose: () => void }> = ({
  onDone,
  onClose,
}) => {
  const { t } = useTranslation('minecraft');
  const [gamertag, setGamertag] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async () => {
    setBusy(true);
    const result = await AdminMinecraftApi.createPass(gamertag.trim());
    setBusy(false);
    if (!result.success) {
      toast.error(
        t(`pass.error.${result.error ?? 'unknown'}`, { defaultValue: t('action.error.unknown') })
      );
      return;
    }
    toast.success(t('pass.addDone'));
    onDone();
    onClose();
  };

  return (
    <AppDialog
      open
      onOpenChange={open => !open && onClose()}
      title={t('pass.addTitle')}
      description={t('pass.addText')}
      size="sm"
      bodyClassName="flex flex-col gap-4 p-4"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('form.cancel')}
          </Button>
          <Button isLoading={busy} disabled={!gamertag.trim()} onClick={() => void add()}>
            {t('pass.add')}
          </Button>
        </>
      }
    >
      <Input
        autoFocus
        value={gamertag}
        maxLength={15}
        placeholder={t('pass.addPlaceholder')}
        onChange={event => setGamertag(event.target.value)}
        onKeyDown={event => event.key === 'Enter' && gamertag.trim() && void add()}
      />
    </AppDialog>
  );
};
