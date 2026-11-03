import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import type { Extension } from '@codemirror/state';
import { AppDrawer } from '@ui/patterns';
import { Alert, AlertDescription, AlertTitle } from '@ui/shad-cn/components/alert.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@ui/shad-cn/components/item.tsx';
import CodeMirror from '@uiw/react-codemirror';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { PluginApi } from '../api';
import { useTheme } from '@core/theme';

interface IPluginFileEditorDialogProps {
  pluginId: string;
  pluginName: string;
  /** File to edit; `null` = drawer closed. */
  path: string | null;
  onClose: () => void;
}

/** Syntax highlighting by file extension. Other text files are shown without highlighting. */
const languageOf = (path: string): Extension[] => {
  const ext = path.slice(path.lastIndexOf('.'));
  if (ext === '.ts' || ext === '.tsx')
    return [javascript({ jsx: ext === '.tsx', typescript: true })];
  if (['.js', '.jsx', '.mjs', '.cjs'].includes(ext)) return [javascript({ jsx: ext === '.jsx' })];
  if (ext === '.json') return [json()];
  if (ext === '.css') return [css()];
  if (ext === '.md') return [markdown()];
  return [];
};

/**
 * Editor for one project file, as full-height drawer. Save with the button or Ctrl/Cmd+S.
 * Unsaved changes block closing. Changes take effect after „Neu deployen“.
 */
export const PluginFileEditorDialog: React.FC<IPluginFileEditorDialogProps> = ({
  pluginId,
  pluginName,
  path,
  onClose,
}) => {
  const { t } = useTranslation('admin');
  const { theme } = useTheme();

  const [loadedPath, setLoadedPath] = useState<string | null>(null);
  const [loadFailure, setLoadFailure] = useState<{ path: string; error: string } | null>(null);
  const [original, setOriginal] = useState('');
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<{ error: string; errors: string[] } | null>(null);
  // Derived, so the effect below only sets state inside its async callback.
  const loading = path !== null && loadedPath !== path && loadFailure?.path !== path;
  const loadError = path !== null && loadFailure?.path === path ? loadFailure.error : null;
  const dirty = path !== null && !loading && draft !== original;

  useEffect(() => {
    if (path === null) return;
    let active = true;
    void PluginApi.readFile(pluginId, path).then(result => {
      if (!active) return;
      if (result.success) {
        setOriginal(result.content ?? '');
        setDraft(result.content ?? '');
        setLoadedPath(path);
        setLoadFailure(null);
        setSaveError(null);
      } else {
        setLoadFailure({ path, error: result.error ?? 'unknown' });
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
    setLoadedPath(null);
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
    <AppDrawer
      open={path !== null}
      onOpenChange={open => !open && close()}
      title={path ?? ''}
      description={pluginName}
      contentProps={{
        className: 'p-0',
      }}
      size={'fullscreen'}
      hideHeader={true}
      locked={saving}
    >
      <div
        className="flex h-full flex-col gap-3 px-4 pb-4"
        onKeyDown={event => {
          if (event.key === 's' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            void save();
          }
        }}
      >
        <Item className={'p-0'} size={'sm'}>
          <ItemContent className={'gap-0'}>
            <ItemTitle className={'font-bold'}>{pluginName}</ItemTitle>
            <ItemDescription className={'text-xs'}>{path}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
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
            <Button size={'sm'} onClick={close}>
              <X />
            </Button>
          </ItemActions>
        </Item>

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
              {t(`plugins.code.errors.${saveError.error}`, {
                defaultValue: t('plugins.code.errors.unknown'),
              })}
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

        <div className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-md border border-border">
          {path !== null && !loading && !loadError && (
            <CodeMirror
              value={draft}
              height="100%"
              className="h-full"
              theme={theme === 'dark' ? 'dark' : 'light'}
              extensions={languageOf(path)}
              editable={!saving}
              onChange={value => setDraft(value)}
              basicSetup={{ foldGutter: false }}
            />
          )}
        </div>
      </div>
    </AppDrawer>
  );
};
