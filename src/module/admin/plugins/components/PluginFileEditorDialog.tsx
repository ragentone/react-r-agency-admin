import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import type { Extension } from '@codemirror/state';
import { Alert, AlertDescription, AlertTitle } from '@ui/shad-cn/components/alert.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@ui/shad-cn/components/dialog.tsx';
import CodeMirror from '@uiw/react-codemirror';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { PluginApi } from '../api';

interface IPluginFileEditorDialogProps {
  pluginId: string;
  pluginName: string;
  /** File to edit; `null` = dialog closed. */
  path: string | null;
  onClose: () => void;
}

/** Syntax highlighting by file extension. Other text files are shown without highlighting. */
const languageOf = (path: string): Extension[] => {
  const ext = path.slice(path.lastIndexOf('.'));
  if (ext === '.ts' || ext === '.tsx') return [javascript({ jsx: ext === '.tsx', typescript: true })];
  if (['.js', '.jsx', '.mjs', '.cjs'].includes(ext)) return [javascript({ jsx: ext === '.jsx' })];
  if (ext === '.json') return [json()];
  if (ext === '.css') return [css()];
  if (ext === '.md') return [markdown()];
  return [];
};

/**
 * Editor for one project file, as dialog (full screen on phones). Save with the button or
 * Ctrl/Cmd+S. Unsaved changes block closing. Changes take effect after „Neu deployen“.
 */
export const PluginFileEditorDialog: React.FC<IPluginFileEditorDialogProps> = ({
  pluginId,
  pluginName,
  path,
  onClose,
}) => {
  const { t } = useTranslation('admin');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [original, setOriginal] = useState('');
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<{ error: string; errors: string[] } | null>(null);
  const dirty = path !== null && !loading && draft !== original;

  useEffect(() => {
    if (path === null) return;
    let active = true;
    setLoading(true);
    setLoadError(null);
    setSaveError(null);
    void PluginApi.readFile(pluginId, path).then(result => {
      if (!active) return;
      setLoading(false);
      if (result.success) {
        setOriginal(result.content ?? '');
        setDraft(result.content ?? '');
      } else {
        setLoadError(result.error ?? 'unknown');
      }
    });
    return () => {
      active = false;
    };
  }, [pluginId, path]);

  const close = () => {
    if (dirty) {
      toast.warning(t('plugins.code.unsaved'));
      return;
    }
    onClose();
  };

  const save = async () => {
    if (path === null || !dirty || saving) return;
    setSaving(true);
    setSaveError(null);
    const result = await PluginApi.writeFile(pluginId, path, draft);
    setSaving(false);
    if (result.success) {
      setOriginal(draft);
      toast.success(t('plugins.code.saved', { path }));
    } else {
      setSaveError({ error: result.error ?? 'unknown', errors: result.errors ?? [] });
    }
  };

  return (
    <Dialog open={path !== null} onOpenChange={open => !open && close()}>
      <DialogContent
        className="top-0 left-0 flex h-dvh max-h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none p-0 sm:top-[50%] sm:left-[50%] sm:h-[90dvh] sm:w-[min(72rem,95vw)] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-none"
        onKeyDown={event => {
          if (event.key === 's' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            void save();
          }
        }}
      >
        <DialogHeader className="border-b border-border px-4 py-3 text-left sm:px-6">
          <DialogTitle className="truncate font-mono text-body">{path}</DialogTitle>
          <DialogDescription className="truncate">{pluginName}</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="min-w-0 flex-1 basis-40 truncate text-caption text-muted-foreground">
              {dirty ? `● ${t('plugins.code.hint')}` : t('plugins.code.hint')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={!dirty || saving}
              onClick={() => {
                setDraft(original);
                setSaveError(null);
              }}
            >
              {t('plugins.code.discard')}
            </Button>
            <Button size="sm" disabled={!dirty || saving} onClick={() => void save()}>
              {saving ? t('plugins.code.saving') : t('plugins.code.save')}
            </Button>
          </div>

          {loadError && (
            <Alert variant="destructive">
              <AlertTitle>
                {t(`plugins.code.errors.${loadError}`, { defaultValue: t('plugins.code.errors.unknown') })}
              </AlertTitle>
            </Alert>
          )}

          {saveError && (
            <Alert variant="destructive">
              <AlertTitle>
                {t(`plugins.code.errors.${saveError.error}`, { defaultValue: t('plugins.code.errors.unknown') })}
              </AlertTitle>
              {saveError.errors.length > 0 && (
                <AlertDescription>
                  <ul className="list-disc pl-4">
                    {saveError.errors.map(message => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </AlertDescription>
              )}
            </Alert>
          )}

          <div className="min-h-0 min-w-0 flex-1 overflow-hidden border border-border">
            {path !== null && !loading && !loadError && (
              <CodeMirror
                value={draft}
                height="100%"
                className="h-full"
                theme="light"
                extensions={languageOf(path)}
                editable={!saving}
                onChange={value => setDraft(value)}
                basicSetup={{ foldGutter: false }}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
