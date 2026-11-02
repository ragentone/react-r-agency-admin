import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/shad-cn/components/dialog.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Label } from '@ui/shad-cn/components/label.tsx';
import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { PluginApi } from '../api';

interface IPluginNewFileDialogProps {
  pluginId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the new path after the file was created. */
  onCreated: (path: string) => void;
}

/** Starting content by file type. A `.tsx` file gets a small component so it builds right away. */
const starterFor = (path: string): string => {
  const name = path.slice(path.lastIndexOf('/') + 1);
  const base = name.slice(0, name.lastIndexOf('.'));
  const component = `C${base.replace(/[^A-Za-z0-9]/g, '')}`;
  if (path.endsWith('.tsx')) {
    return `export function ${component}() {\n  return <p>${component}</p>;\n}\n`;
  }
  if (path.endsWith('.ts')) return 'export {};\n';
  return '';
};

const PATH_PATTERN = /^[A-Za-z0-9_\-./]+$/;

/** Creates a new source file in the plugin project. Existing files are never overwritten. */
export const PluginNewFileDialog: React.FC<IPluginNewFileDialogProps> = ({
  pluginId,
  open,
  onOpenChange,
  onCreated,
}) => {
  const { t } = useTranslation('admin');
  const inputId = useId();
  const [path, setPath] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmed = path.trim();
  const valid = PATH_PATTERN.test(trimmed) && !trimmed.startsWith('/') && !trimmed.includes('..');

  const create = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    const existing = await PluginApi.files(pluginId);
    if (!existing.success) {
      setBusy(false);
      setError(existing.error ?? 'unknown');
      return;
    }
    if ((existing.files ?? []).some(file => file.path === trimmed)) {
      setBusy(false);
      setError('exists');
      return;
    }
    const result = await PluginApi.writeFile(pluginId, trimmed, starterFor(trimmed));
    setBusy(false);
    if (!result.success) {
      setError(result.error ?? 'unknown');
      return;
    }
    toast.success(t('plugins.code.created', { path: trimmed }));
    setPath('');
    onCreated(trimmed);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={next => !busy && onOpenChange(next)}>
      <DialogContent className="flex flex-col gap-4">
        <DialogHeader className="text-left">
          <DialogTitle>{t('plugins.code.newFileTitle')}</DialogTitle>
          <DialogDescription>{t('plugins.code.newFileHint')}</DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-2"
          onSubmit={event => {
            event.preventDefault();
            void create();
          }}
        >
          <Label htmlFor={inputId}>{t('plugins.code.newFileLabel')}</Label>
          <Input
            id={inputId}
            value={path}
            disabled={busy}
            autoComplete="off"
            placeholder="src/components/Card.tsx"
            onChange={event => {
              setPath(event.target.value);
              setError(null);
            }}
            className="h-12 font-mono text-base"
          />
          {error && (
            <p className="text-caption text-destructive" role="alert">
              {t(`plugins.code.errors.${error}`, { defaultValue: t('plugins.code.errors.unknown') })}
            </p>
          )}
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" size="lg" disabled={busy} onClick={() => onOpenChange(false)}>
              {t('plugins.deploy.cancel')}
            </Button>
            <Button type="submit" size="lg" disabled={!valid || busy}>
              {busy ? t('plugins.code.saving') : t('plugins.code.createFile')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
