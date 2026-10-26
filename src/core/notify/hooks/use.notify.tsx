import { NotifySystemTpl } from '@core/notify';
import type { ButtonProps } from '@ui/shad-cn/components/button.tsx';
import { toast } from 'sonner';

import { type NotifySoundType, playNotifySoundIfEnabled } from '../sound';

type Position = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface INotifyActionButton {
  label: string;
  onClick: () => Promise<void>;
  variant?: ButtonProps['variant'];
  noCloseOnAction?: boolean;
  className?: string;
}

export interface INotifyShowOptions {
  type?: NotifySoundType;
  message: string;
  description?: string;
  position?: Position;
  actions?: INotifyActionButton[];
  dismissible?: boolean;
  className?: string;
  translate?: boolean;
  namespace?: string;
}

export interface IUseNotify {
  show(options: INotifyShowOptions): void;
}

const getDuration = (options: INotifyShowOptions) => {
  if (options.actions && options.actions.length !== 0) {
    return 99000;
  }
  return 6000;
};

const isDismissable = (options: INotifyShowOptions) => {
  if (options.actions && options.actions.length !== 0 && !options.dismissible) {
    return false;
  }
  return options.dismissible;
};

const useNotify = (): IUseNotify => {
  return {
    show: (options: INotifyShowOptions) => {
      playNotifySoundIfEnabled(options.type ?? 'info');
      toast.custom(id => <NotifySystemTpl id={id} options={options} />, {
        position: options.position ?? 'bottom-right',
        duration: getDuration(options),
        dismissible: isDismissable(options),
      });
    },
  };
};

export { useNotify };
