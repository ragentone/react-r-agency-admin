import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { Loader2, X } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TICKET_NOTE_MAX } from '../const';
import type { ITicket } from '../types';
import { TicketHtml } from './TicketHtml';

export type TicketReviewMode = 'accept' | 'reject';

export interface ITicketReviewDrawerProps {
  /** Ticket + what to do – null closes the drawer. */
  review: { ticket: ITicket; mode: TicketReviewMode } | null;
  onClose: () => void;
  saving: boolean;
  onAccept: (ticket: ITicket, note: string, isPublic: boolean) => Promise<boolean>;
  onReject: (ticket: ITicket, note: string) => Promise<boolean>;
}

/** Accept (→ todo, optional note, roadmap visibility) or reject (reason required). */
export const TicketReviewDrawer: React.FC<ITicketReviewDrawerProps> = ({
  review,
  onClose,
  saving,
  onAccept,
  onReject,
}) => {
  const { t } = useTranslation('dev');
  const [note, setNote] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [current, setCurrent] = useState(review);
  // New review → reset the form (adjusted during render, no effect).
  if (review !== current) {
    setCurrent(review);
    if (review) {
      setNote('');
      setIsPublic(true);
    }
  }

  const reject = review?.mode === 'reject';
  const trimmed = note.trim();
  const invalid = (reject && !trimmed) || trimmed.length > TICKET_NOTE_MAX;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!review || invalid || saving) return;
    const ok = reject
      ? await onReject(review.ticket, trimmed)
      : await onAccept(review.ticket, trimmed, isPublic);
    if (ok) onClose();
  };

  return (
    <Drawer
      open={Boolean(review)}
      onOpenChange={next => !next && !saving && onClose()}
      showSwipeHandle
    >
      <DrawerPrimitive.VirtualKeyboardProvider>
        <DrawerContent className="mx-auto w-full max-w-[600px]">
          <DrawerDescription className="sr-only">{review?.ticket.title}</DrawerDescription>
          <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-13 shrink-0 items-center gap-3 border-b border-border/50 px-3 pb-2 sm:px-4">
              <DrawerTitle className="min-w-0 flex-1 truncate text-title font-bold">
                {reject ? t('review.rejectTitle') : t('review.acceptTitle')}
              </DrawerTitle>
              <button
                type="submit"
                disabled={saving || invalid}
                className={
                  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-opacity hover:opacity-85 disabled:opacity-40 ' +
                  (reject ? 'bg-destructive text-white' : 'bg-foreground text-background')
                }
              >
                {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {reject ? t('review.reject') : t('review.accept')}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                aria-label={t('form.cancel')}
                className="grid size-9 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-foreground/10 disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-4 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6">
              <div className="rounded-xl bg-foreground/[0.04] px-3 py-2.5">
                <p className="text-body font-semibold break-words">{review?.ticket.title}</p>
                {review?.ticket.description && (
                  <TicketHtml
                    html={review.ticket.description}
                    className="mt-1 line-clamp-6 text-caption text-muted-foreground"
                  />
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="ticket-review-note"
                    className="text-caption font-medium text-foreground"
                  >
                    {reject ? t('review.reason') : t('review.note')}
                  </label>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {note.length} / {TICKET_NOTE_MAX}
                  </span>
                </div>
                <textarea
                  id="ticket-review-note"
                  rows={4}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={reject ? t('review.reasonPlaceholder') : t('review.notePlaceholder')}
                  disabled={saving}
                  className="w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:text-body"
                />
                <p className="mt-1 text-caption text-muted-foreground">
                  {t('review.visibleToUser')}
                </p>
              </div>

              {!reject && (
                <label
                  htmlFor="ticket-review-public"
                  className="flex cursor-pointer items-center gap-4 rounded-xl border border-border/50 px-3 py-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-body font-semibold">{t('form.public')}</span>
                    <span className="mt-0.5 block text-caption text-muted-foreground">
                      {t('review.publicHint')}
                    </span>
                  </span>
                  <Switch
                    id="ticket-review-public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                    disabled={saving}
                  />
                </label>
              )}
            </div>
          </form>
        </DrawerContent>
      </DrawerPrimitive.VirtualKeyboardProvider>
    </Drawer>
  );
};
