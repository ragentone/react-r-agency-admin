import { cn } from '@ui/lib';
import { AppDrawer } from '@ui/patterns';
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
  // Mounted closed, opened after the first frame: otherwise the drawer appears without its slide-in animation.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, []);

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
        setText(previous =>
          `${result.reset ? '' : previous}${result.text ?? ''}`.slice(-MAX_CHARS)
        );
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
    <AppDrawer
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={done => !done && onClose()}
      contentProps={{
        className: 'max-w-[800px]',
      }}
      title={t('system.deployments.log.title', { scope })}
      description={running ? t('system.deployments.log.running') : t('system.deployments.log.done')}
      size="full"
      bodyClassName="flex min-h-0 flex-1 flex-col p-0"
    >
      <pre
        ref={box}
        className={cn(
          'min-h-0 flex-1 overflow-auto bg-black p-4 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap text-white'
        )}
      >
        {text || t('system.deployments.log.empty')}
      </pre>
    </AppDrawer>
  );
};
