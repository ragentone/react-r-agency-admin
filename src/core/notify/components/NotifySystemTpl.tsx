import type { INotifyActionButton, INotifyShowOptions } from '@core/notify';
import { cn } from '@ui/lib';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from '@ui/shad-cn/components/item.tsx';
import { Spinner } from '@ui/shad-cn/components/spinner.tsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface IProps {
  id: string | number;
  options: INotifyShowOptions;
}

const NotifySystemTpl = (props: IProps) => {
  const { options, id } = props;
  const { t } = useTranslation(options.namespace);
  const [busy, setBusy] = useState(false);
  const handleActionClick = async (action: INotifyActionButton) => {
    setBusy(true);
    await action.onClick();
    setBusy(false);
    if (action.noCloseOnAction) return;
    toast.dismiss(id);
  };

  return (
    <div
      className={cn(
        'border-y sm:border sm:px-6 px-4 py-4 shadow border-border/50 bg-background w-full min-w-64 sm:max-w-[320px] max-w-full rounded-none sm:rounded-4xl',
        props.options.className
      )}
    >
      <Item className={'p-0'}>
        <ItemContent>
          <ItemTitle>{options.translate ? t(options.message) : options.message}</ItemTitle>
          {options.description && (
            <ItemDescription>
              {options.translate ? t(options.description) : options.description}
            </ItemDescription>
          )}
        </ItemContent>

        {options.actions && (
          <ItemFooter
            className={cn('w-full', {
              'grid grid-cols-2 gap-1': options.actions.length > 1,
            })}
          >
            {options.actions.map((action, index) => (
              <Button
                disabled={busy}
                key={index}
                variant={action.variant}
                size={'sm'}
                onClick={async () => await handleActionClick(action)}
                className={cn(
                  'w-full',
                  {
                    'text-white': action.variant === 'destructive',
                  },
                  action.className
                )}
              >
                {busy && <Spinner />}
                {options.translate ? t(action.label) : action.label}
              </Button>
            ))}
          </ItemFooter>
        )}
      </Item>
    </div>
  );
};

export { NotifySystemTpl };
