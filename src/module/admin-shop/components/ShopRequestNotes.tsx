import { Button } from '@ui/shad-cn/components/button.tsx';
import { Textarea } from '@ui/shad-cn/components/textarea.tsx';
import { Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useShopRequestNotes } from '../hooks/use.shop.request.note';
import { SHOP_NOTE_MESSAGE_MAX } from '../types/request';
import { formatRequestDate } from '../utils/request-view';
import { ShopEmpty } from './ShopEmpty';

export interface IShopRequestNotesProps {
  /** Any request of the customer: the notes belong to the customer, not to one request. */
  requestId: string;
  language: string;
  /** Titles of the customer's requests by id, to show which request a note was written on. */
  titles?: Record<string, string>;
}

/** Internal notes of the page team on a customer – the requester never sees them. */
export const ShopRequestNotes: React.FC<IShopRequestNotesProps> = ({
  requestId,
  language,
  titles,
}) => {
  const { t } = useTranslation('admin-shop');
  const { notes, saving, load, add, remove } = useShopRequestNotes();
  const [text, setText] = useState('');

  useEffect(() => {
    void load(requestId);
  }, [load, requestId]);

  const submit = async () => {
    const message = text.trim();
    if (!message) return;
    if (await add(requestId, message)) setText('');
    else toast.error(t('crm.notes.error'));
  };

  return (
    <div className="space-y-3">
      <p className="text-caption text-muted-foreground">{t('crm.notes.hint')}</p>
      <form
        className="space-y-2"
        onSubmit={event => {
          event.preventDefault();
          void submit();
        }}
      >
        <Textarea
          value={text}
          onChange={event => setText(event.target.value)}
          maxLength={SHOP_NOTE_MESSAGE_MAX}
          rows={3}
          placeholder={t('crm.notes.placeholder')}
          aria-label={t('crm.notes.placeholder')}
          className="border-border/50"
        />
        <Button type="submit" size="sm" disabled={saving || text.trim() === ''}>
          {t('crm.notes.add')}
        </Button>
      </form>

      {notes.length === 0 ? (
        <ShopEmpty title={t('crm.notes.empty')} />
      ) : (
        <ul className="space-y-2">
          {notes.map(note => (
            <li key={note.id} className="rounded-xl border border-border/50 p-3">
              <p className="text-body break-words whitespace-pre-line">{note.message}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-caption text-muted-foreground">
                  {formatRequestDate(note.createdAt, language)}
                  {titles?.[note.requestId] && ` · ${titles[note.requestId]}`}
                </p>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-muted-foreground"
                  aria-label={t('crm.notes.delete')}
                  title={t('crm.notes.delete')}
                  onClick={() =>
                    void remove(note.id).then(ok => ok || toast.error(t('crm.notes.error')))
                  }
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
