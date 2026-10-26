import { EmojiPicker, type EmojiSelection } from '@core/editor/emoji';
import { ResponsivePopover } from '@core/editor/shared';
import { cn } from '@ui/lib/utils.ts';
import { SendHorizontal, Smile, ThumbsUp } from 'lucide-react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { MESSENGER_LIKE, MESSENGER_MAX_LENGTH } from '../const.ts';
import { useMessengerTypingSender } from '../hooks';
import { useMessengerStore } from '../store.ts';

const MAX_HEIGHT = 128;

/** Draft per chat – survives switching chats / closing the drawer (until the page reloads). */
const drafts = new Map<string, string>();

/** Messenger composer: "Aa" field, send – or 👍 when empty (monochrome buttons). */
export const MessengerComposer: React.FC<{ peerId: string; autoFocus?: boolean }> = ({
  peerId,
  autoFocus,
}) => {
  const { t } = useTranslation('messenger');
  const send = useMessengerStore(state => state.send);
  const [text, setText] = useState(() => drafts.get(peerId) ?? '');
  const ref = useRef<HTMLTextAreaElement>(null);
  const { typed, stop } = useMessengerTypingSender(peerId);
  const [emojiOpen, setEmojiOpen] = useState(false);
  /** Cursor position (the field loses focus while the picker is used). */
  const caret = useRef<{ start: number; end: number } | null>(null);
  const trimmed = text.trim();
  const tooLong = text.length > MESSENGER_MAX_LENGTH;
  // Phones: Enter = new line (send button), desktop: Enter sends, Shift+Enter = new line.
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  // Auto height (1 – ~5 lines).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [text]);

  const update = (value: string) => {
    setText(value);
    if (value) drafts.set(peerId, value);
    else drafts.delete(peerId);
    if (value.trim()) typed();
    else stop();
  };

  const rememberCaret = () => {
    const el = ref.current;
    if (el) caret.current = { start: el.selectionStart, end: el.selectionEnd };
  };

  /** Inserts the emoji at the cursor (or at the end) – the picker stays open for more. */
  const insertEmoji = ({ native }: EmojiSelection) => {
    const { start, end } = caret.current ?? { start: text.length, end: text.length };
    const next = `${text.slice(0, start)}${native}${text.slice(end)}`;
    const position = start + native.length;
    caret.current = { start: position, end: position };
    update(next);
    // Desktop: back into the field (phones: the sheet would be covered by the keyboard).
    if (!coarse) {
      window.requestAnimationFrame(() => {
        ref.current?.focus();
        ref.current?.setSelectionRange(position, position);
      });
    }
  };

  const submit = async (body: string) => {
    if (!body.trim() || body.length > MESSENGER_MAX_LENGTH) return;
    stop();
    if (body !== MESSENGER_LIKE) {
      update('');
      caret.current = null;
      setEmojiOpen(false);
    }
    ref.current?.focus();
    const error = await send(peerId, body);
    if (error) toast.error(t(`errors.${error}`, { defaultValue: t('errors.default') }));
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        void submit(trimmed ? text : MESSENGER_LIKE);
      }}
      className="flex shrink-0 items-end gap-2 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="relative min-w-0 flex-1">
        <textarea
          ref={ref}
          rows={1}
          value={text}
          autoFocus={autoFocus}
          onChange={e => update(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey && !coarse && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (trimmed) void submit(text);
            }
          }}
          onBlur={() => {
            rememberCaret();
            stop();
          }}
          onSelect={rememberCaret}
          placeholder={t('chat.placeholder')}
          aria-label={t('chat.placeholder')}
          maxLength={MESSENGER_MAX_LENGTH + 200}
          className={cn(
            'block max-h-32 w-full resize-none rounded-[20px] bg-foreground/6 py-2 pr-10 pl-4 text-base leading-5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:text-[15px]',
            tooLong && 'ring-2 ring-destructive/60'
          )}
        />
        {/* Emoji picker (like Messenger: smiley inside the field). */}
        <div className="absolute right-1 bottom-0.5">
          <ResponsivePopover
            open={emojiOpen}
            onOpenChange={setEmojiOpen}
            title={t('chat.emoji')}
            align="end"
            popoverClassName="w-auto overflow-hidden p-0"
            sheetClassName="px-2"
            keepOpenOnFocusOutside
            trigger={
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={rememberCaret}
                aria-label={t('chat.emoji')}
                title={t('chat.emoji')}
                className="grid size-8 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/8 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Smile className="size-5" />
              </button>
            }
          >
            {({ sheet }) => (
              <EmojiPicker
                fluid={sheet}
                autoFocus={!sheet}
                height={sheet ? 360 : undefined}
                onSelect={insertEmoji}
              />
            )}
          </ResponsivePopover>
        </div>
        {text.length > MESSENGER_MAX_LENGTH - 200 && (
          <span
            className={cn(
              'absolute -top-5 right-2 text-[11px] tabular-nums',
              tooLong ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {t('chat.counter', { count: text.length, max: MESSENGER_MAX_LENGTH })}
          </span>
        )}
      </div>
      <button
        type="submit"
        disabled={tooLong}
        aria-label={trimmed ? t('chat.send') : t('chat.like')}
        title={trimmed ? t('chat.send') : t('chat.like')}
        className="grid size-9 shrink-0 place-items-center rounded-full text-foreground outline-none transition-[background-color,transform] hover:bg-foreground/[0.06] focus-visible:ring-2 focus-visible:ring-ring active:scale-90 disabled:opacity-40"
      >
        {trimmed ? (
          <SendHorizontal className="size-6" fill="currentColor" strokeWidth={1.5} />
        ) : (
          <ThumbsUp className="size-6" fill="currentColor" strokeWidth={1.5} />
        )}
      </button>
    </form>
  );
};
