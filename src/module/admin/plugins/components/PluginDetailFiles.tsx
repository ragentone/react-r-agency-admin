import { Button } from '@ui/shad-cn/components/button.tsx';
import { FilePlus } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { PluginFileTree } from './PluginFileTree';

interface IPluginDetailFilesProps {
  pluginId: string;
  busy: boolean;
  reloadKey: number;
  onNewFile: () => void;
  onOpenFile: (path: string) => void;
}

/** Source files of a development project: header with "new file", then the tree. */
export const PluginDetailFiles: React.FC<IPluginDetailFilesProps> = ({
  pluginId,
  busy,
  reloadKey,
  onNewFile,
  onOpenFile,
}) => {
  const { t } = useTranslation('admin');

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-body font-bold">{t('plugins.code.files')}</h2>
        <Button variant="outline" size="sm" disabled={busy} onClick={onNewFile}>
          <FilePlus className="size-4" />
          {t('plugins.code.newFile')}
        </Button>
      </div>
      <PluginFileTree pluginId={pluginId} reloadKey={reloadKey} onOpenFile={onOpenFile} />
    </section>
  );
};
