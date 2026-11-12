import { AppDialog } from '@ui/components';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SystemApi } from '../api';

const POLL_MS = 2000;
const MAX_CHARS = 200_000;

/** Live output of a frontend or admin build (server log, new lines every 2 s while open). */
export const SystemBuildLog: React.FC<{
  app: 'frontend' | 'admin';
  scope: string;
  onClose: () => void;
}> = ({ app, scope, onClose }) => {
  const { t } = useTranslation('admin');
  const [text, setText] = useState('');
  const [running, setRunning] = useState(false);
  const offset = useRef(0);
  const fileId = useRef<string | null>(null);
  const box = useRef<HTMLPreElement>(null);

  useEffect(() => {
    let active = true;
    let busy = false;
    const pull = async () => {
      if (busy) return;
      busy = true;
      const result = await SystemApi.buildLog(app, offset.current, fileId.current);
      busy = false;
      if (!active || !result.success) return;
      if (result.reset) offset.current = 0;
      offset.current = result.offset ?? offset.current;
      fileId.current = result.id || fileId.current;
      if (result.reset || result.text) {
        setText(previous => `${result.reset ? '' : previous}${result.text ?? ''}`.slice(-MAX_CHARS));
      }
      setRunning(result.running === true);
    };
    void pull();
    const timer = setInterval(() => void pull(), POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [app]);

  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [text]);

  return (
    <AppDialog
      open
      onOpenChange={open => !open && onClose()}
      title={t('system.deployments.log.title', { scope })}
      description={running ? t('system.deployments.log.running') : t('system.deployments.log.done')}
      size="lg"
    >
      <pre
        ref={box}
        className="h-[60dvh] overflow-auto rounded-xl bg-muted p-3 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap text-foreground"
      >
        {text || t('system.deployments.log.empty')}
      </pre>
    </AppDialog>
  );
};
