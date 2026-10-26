import { Toaster } from '@ui/shad-cn/components/sonner';
import { type IMeshError, type INotify, useMesh } from 'r-agency-mesh-client-v1/release';
import { createContext, type ReactNode, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { type NotifySoundType, playNotifySoundIfEnabled } from '../sound';

export type INotifyContext = object;

interface IProps {
  children: ReactNode;
}

const Context = createContext<INotifyContext | undefined>(undefined);

const NotifyProvider = ({ children }: IProps) => {
  const { onEvent } = useMesh();
  const { t } = useTranslation();
  const initRef = useRef(true);

  const contextValue = useMemo<INotifyContext>(() => ({}), []);

  useEffect(() => {
    if (!initRef.current) return;
    const handleNotify = (item: INotify) => {
      const type = (item.type ?? 'info') as NotifySoundType;
      playNotifySoundIfEnabled(type);
      const rawTitle = item.translateKey
        ? `backend:${item.translateKey}`
        : item.title || item.message;
      const title = t(rawTitle);
      const description =
        item.title && item.message && !item.translateKey ? t(item.message) : undefined;
      const options = {
        description,
        duration: item.duration ?? 3000,
      };

      if (type === 'success') {
        toast.success(title, options);
      } else if (type === 'error') {
        toast.error(title, options);
      } else if (type === 'warning') {
        toast.warning(title, options);
      } else if (type === 'info') {
        toast.info(title, options);
      } else {
        toast(title, options);
      }
    };

    const handleErrors = (errors: IMeshError[]) => {
      if (errors.length > 0) {
        playNotifySoundIfEnabled('error');
      }
      errors.forEach(error => {
        const rawTitle = error.translateKey
          ? `backend:${error.translateKey}`
          : error.name || error.message || 'Error';
        const title = t(rawTitle);
        const description =
          !error.translateKey && error.name && error.message && error.name !== error.message
            ? t(error.message)
            : undefined;
        toast.error(title, {
          description,
          duration: 5000,
        });
      });
    };

    const init = () => {
      onEvent('graphql:sender:extension', ({ extension }) => {
        const errors: IMeshError[] = extension.errors ?? [];
        handleErrors(errors);

        const notifications: INotify[] = extension.notify ?? [];
        notifications.forEach(item => handleNotify(item));
      });

      onEvent('websocket:incoming:message', ({ message }) => {
        const notifications: INotify[] = message.notify ?? [];
        notifications.forEach(item => handleNotify(item));
        const exceptions: IMeshError[] = message.exceptions ?? [];
        handleErrors(exceptions);
      });
    };
    initRef.current = false;
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  return (
    <Context.Provider value={contextValue}>
      {children}
      <Toaster />
    </Context.Provider>
  );
};

export { NotifyProvider };
