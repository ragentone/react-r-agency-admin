import { Input } from '@ui/shad-cn/components/input.tsx';
import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';

/** Folder of the frontend source on the live server (absolute path). Empty = no frontend deploy. */
export const SystemBuildPathField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}> = ({ value, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const id = useId();
  return (
    <div className="mt-4">
      <label htmlFor={id} className="mb-1.5 block text-body font-semibold">
        {t('system.deploys.next.buildPath.label')}
      </label>
      <Input
        id={id}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={t('system.deploys.next.buildPath.placeholder')}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        className="h-11 rounded-xl"
      />
      <p className="mt-1.5 text-caption text-muted-foreground">
        {t('system.deploys.next.buildPath.hint')}
      </p>
    </div>
  );
};
