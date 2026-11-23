import { cn } from '@ui/lib/utils';
import { AppDrawer } from '@ui/patterns/drawer/AppDrawer.tsx';
import { buttonVariants } from '@ui/shad-cn/components/button.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import { Mail, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useShopRequestThread } from '../hooks/use.shop.request.reply';
import type { IShopRequest, ShopRequestStatus } from '../types/request';
import { requestFrom } from '../utils/request-view';
import { ShopRequestComposer } from './ShopRequestComposer';
import { ShopRequestNotes } from './ShopRequestNotes';
import { ShopRequestStage } from './ShopRequestStage';
import { ShopRequestThread } from './ShopRequestThread';
import { ShopRequestValue } from './ShopRequestValue';

export interface IShopRequestDetailProps {
  /** Request to show, `null` closes the drawer. */
  request: IShopRequest | null;
  onOpenChange: (open: boolean) => void;
  onStatus: (id: string, status: ShopRequestStatus) => void;
  onValue: (id: string, cents: number | null) => Promise<boolean>;
  /** Asks the parent to delete (it shows the confirm dialog). */
  onDelete: (request: IShopRequest) => void;
  /** Opens the customer card of this request. */
  onCustomer: (request: IShopRequest) => void;
  language: string;
}

const TAB = cn(
  'min-h-9 flex-none cursor-pointer rounded-full border border-border/50 px-4 text-caption font-bold',
  'data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none'
);

/** CRM view of one request in a right drawer: stage, value, conversation and internal notes. */
export const ShopRequestDetail: React.FC<IShopRequestDetailProps> = ({
  request,
  onOpenChange,
  onStatus,
  onValue,
  onDelete,
  onCustomer,
  language,
}) => {
  const { t } = useTranslation('admin-shop');
  const [tab, setTab] = useState('thread');
  // Members can be answered in the app; guests only by e-mail.
  const inApp = Boolean(request?.requesterId);
  const thread = useShopRequestThread(request?.id ?? null, inApp);
  const mail = request?.contactEmail ? (
    <a
      href={`mailto:${request.contactEmail}?subject=${encodeURIComponent(request.itemTitle)}`}
      className={cn(buttonVariants({ variant: 'outline' }), 'w-full border-border/50')}
    >
      <Mail className="size-4" aria-hidden="true" />
      {t('crm.reply')}
    </a>
  ) : undefined;
  const footer =
    request && inApp && tab === 'thread' ? (
      <ShopRequestComposer
        sending={thread.sending}
        onSend={message => thread.send(request.id, message)}
      />
    ) : (
      mail
    );

  return (
    <AppDrawer
      open={request !== null}
      onOpenChange={open => {
        if (!open) onOpenChange(false);
      }}
      direction="right"
      size="full"
      title={request?.itemTitle ?? ''}
      action={
        request && (
          <Button
            variant="ghost"
            size="icon-lg"
            className="text-destructive"
            onClick={() => onDelete(request)}
            aria-label={t('crm.delete')}
            title={t('crm.delete')}
          >
            <Trash2 className="size-5" />
          </Button>
        )
      }
      bodyKey={request?.id}
      footer={footer}
      hideFooter={!footer}
    >
      {request && (
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => onCustomer(request)}
            className="w-full cursor-pointer rounded-xl border border-border/50 p-3 text-left transition-colors hover:bg-muted/50"
          >
            <p className="text-caption text-muted-foreground">{t('crm.col.from')}</p>
            <p className="text-body font-bold break-words">
              {requestFrom(request, t('crm.member'))}
            </p>
            <p className="text-caption text-muted-foreground">{t('customers.open')}</p>
          </button>

          <ShopRequestStage
            value={request.status}
            onChange={status => onStatus(request.id, status)}
          />
          <ShopRequestValue
            key={`${request.id}:${request.valueCents}`}
            cents={request.valueCents}
            onSave={cents => onValue(request.id, cents)}
          />

          <Tabs value={tab} onValueChange={setTab} className="gap-3">
            <TabsList className="h-auto justify-start gap-2 bg-transparent p-0">
              <TabsTrigger value="thread" className={TAB}>
                {t('crm.thread.title')}
              </TabsTrigger>
              <TabsTrigger value="notes" className={TAB}>
                {t('crm.notes.title')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="thread" className="mt-0">
              <ShopRequestThread
                request={request}
                viewer="team"
                language={language}
                replies={thread.replies}
              />
            </TabsContent>
            <TabsContent value="notes" className="mt-0">
              <ShopRequestNotes requestId={request.id} language={language} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </AppDrawer>
  );
};
