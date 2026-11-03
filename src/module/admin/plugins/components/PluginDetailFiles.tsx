import React from 'react';
import { useTranslation } from 'react-i18next';

import { PluginFileTree } from './PluginFileTree';

interface IPluginDetailFilesProps {
  pluginId: string;
  onOpenFile: (path: string) => void;
}

/** Source files of a development project as tree. Files are opened and edited, not created. */
export const PluginDetailFiles: React.FC<IPluginDetailFilesProps> = ({ pluginId, onOpenFile }) => {
  const { t } = useTranslation('admin');

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-body font-bold">{t('plugins.code.files')}</h2>
      <PluginFileTree pluginId={pluginId} onOpenFile={onOpenFile} />
    </section>
  );
};
