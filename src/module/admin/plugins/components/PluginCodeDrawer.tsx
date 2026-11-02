import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import type { Extension } from '@codemirror/state';
import { AppDrawer } from '@ui/patterns';
import { Alert, AlertDescription, AlertTitle } from '@ui/shad-cn/components/alert.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { cn } from '@ui/lib/utils';
import CodeMirror from '@uiw/react-codemirror';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { PluginApi } from '../api';
import type { IPluginFileItem, IPluginListItem } from '../types';

interface IPluginCodeDrawerProps {
  plugin: IPluginListItem | null;
  onOpenChange: (open: boolean) => void;
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
 * Edits the source files of a development project. Changes take effect after „Neu deployen“.
 * Save with the button or Ctrl/Cmd+S. Unsaved changes block switching files and closing.
 */
export const PluginCodeDrawer: React.FC<IPluginCodeDrawerProps> = ({ plugin, onOpenChange }) => {
  const { t } = useTranslation('admin');
  const pluginId = plugin?.pluginId ?? null;
  const [files, setFiles] = useState<IPluginFileItem[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [original, setOriginal] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<{ error: string; errors: string[] } | null>(null);
  const dirty = selected !== null && draft !== original;

  useEffect(() => {
    if (!pluginId) return;
    let active = true;
    setFiles(null);
    setListError(null);
    setSelected(null);
    setOriginal('');
    setDraft('');
    setSaveError(null);
    void PluginApi.files(pluginId).then(result => {
      if (!active) return;
      if (result.success) setFiles(result.files ?? []);
      else setListError(result.error ?? 'unknown');
    });
    return () => {
      active = false;
    };
  }, [pluginId]);

  const openFile = async (path: string) => {
    if (!pluginId || path === selected) return;
    if (dirty) {
      toast.warning(t('plugins.code.unsaved'));
      return;
    }
    setLoading(true);
    setSaveError(null);
    const result = await PluginApi.readFile(pluginId, path);
    setLoading(false);
    if (result.success) {
      setSelected(path);
      setOriginal(result.content ?? '');
      setDraft(result.content ?? '');
    } else {
      toast.error(t(`plugins.code.errors.${result.error ?? 'unknown'}`, { defaultValue: t('plugins.code.errors.unknown') }));
    }
  };

  const save = async () => {
    if (!pluginId || selected === null || !dirty || saving) return;
    setSaving(true);
    setSaveError(null);
    const result = await PluginApi.writeFile(pluginId, selected, draft);
    setSaving(false);
    if (result.success) {
      setOriginal(draft);
      toast.success(t('plugins.code.saved', { path: selected }));
    } else {
      setSaveError({ error: result.error ?? 'unknown', errors: result.errors ?? [] });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && dirty) {
      toast.warning(t('plugins.code.unsaved'));
      return;
    }
    onOpenChange(open);
  };

  return (
    <AppDrawer
      open={plugin !== null}
      onOpenChange={handleOpenChange}
      title={plugin ? `${plugin.name}${selected ? ` · ${selected}` : ''}` : ''}
      description={plugin?.pluginId}
      size="full"
      locked={saving}
    >
      {plugin && (
        <div
          className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-3"
          onKeyDown={event => {
            if (event.key === 's' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              void save();
            }
          }}
        >
          <p className="text-caption text-muted-foreground">{t('plugins.code.hint')}</p>

          {listError && (
            <Alert variant="destructive">
              <AlertTitle>{t(`plugins.code.errors.${listError}`, { defaultValue: t('plugins.code.errors.unknown') })}</AlertTitle>
            </Alert>
          )}

          <div className="flex min-h-0 flex-1 flex-col gap-3 sm:flex-row">
            <nav
              aria-label={t('plugins.code.files')}
              className="flex max-h-40 shrink-0 flex-col overflow-y-auto rounded-md border border-border sm:max-h-none sm:w-64"
            >
              {files === null && !listError && <Skeleton className="m-2 h-8" />}
              {files?.map(file => (
                <button
                  key={file.path}
                  type="button"
                  aria-current={selected === file.path ? 'true' : undefined}
                  onClick={() => void openFile(file.path)}
                  className={cn(
                    'truncate px-3 py-2 text-left font-mono text-caption transition-colors hover:bg-accent',
                    selected === file.path && 'bg-accent font-bold'
                  )}
                >
                  {file.path}
                </button>
              ))}
            </nav>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
              {selected === null ? (
                <p className="text-body text-muted-foreground">
                  {loading ? t('plugins.code.loading') : t('plugins.code.selectFile')}
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate font-mono text-caption">
                      {selected}
                      {dirty && ' ●'}
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

                  <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border">
                    <CodeMirror
                      value={draft}
                      height="60dvh"
                      theme="light"
                      extensions={languageOf(selected)}
                      editable={!saving && !loading}
                      onChange={value => setDraft(value)}
                      basicSetup={{ foldGutter: false }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AppDrawer>
  );
};
