import { usePageBlockRegistry } from '@core/blocks/use.page.blocks.ts';
import { cn } from '@ui/lib/utils';
import { ArrowDown, ArrowUp, ChevronDown, Copy, LayoutGrid, Plus, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { BlockEditor } from './BlockEditors';
import { BLOCK_ICONS, blockIcon, blockLabel, blockSummary } from './meta';
import {
  createAppBlock,
  createBlock,
  duplicateBlock,
  type PageBlock,
  SITE_PAGE_BLOCK_TYPES,
  SITE_PAGE_BLOCKS_MAX,
} from './types';

export interface IAdminBlocksEditorProps {
  value: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
  disabled?: boolean;
}

const PICK_BUTTON =
  'flex min-h-20 flex-col items-start gap-1 rounded-xl border border-border/60 bg-background p-3 text-left transition-colors hover:border-foreground/30 active:bg-foreground/[0.04]';

/** Grid of block types – built-in ones, then the blocks registered by apps. */
const BlockPicker: React.FC<{
  onPick: (block: PageBlock) => void;
  onClose: () => void;
}> = ({ onPick, onClose }) => {
  const { t } = useTranslation('admin');
  const apps = usePageBlockRegistry().list();
  return (
    <div className="rounded-2xl border border-border/60 bg-foreground/[0.02] p-3">
      <div className="mb-2 flex items-center justify-between pl-1">
        <p className="text-caption font-bold">{t('blocks.pickTitle')}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('pages.form.cancel')}
          className="grid size-8 place-items-center rounded-full hover:bg-foreground/10"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SITE_PAGE_BLOCK_TYPES.map(type => {
          const Icon = BLOCK_ICONS[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => onPick(createBlock(type) as PageBlock)}
              className={PICK_BUTTON}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="text-body font-bold">{t(`blocks.type.${type}.label`)}</span>
              <span className="text-[11px] leading-snug text-muted-foreground">
                {t(`blocks.type.${type}.description`)}
              </span>
            </button>
          );
        })}
      </div>
      {apps.length > 0 && (
        <>
          <p className="mt-4 mb-2 pl-1 text-caption font-bold">{t('blocks.pickApps')}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {apps.map(definition => {
              const Icon = definition.icon;
              return (
                <button
                  key={definition.type}
                  type="button"
                  onClick={() => onPick(createAppBlock(definition))}
                  className={PICK_BUTTON}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  <span className="text-body font-bold">
                    {t(definition.label, { defaultValue: definition.label })}
                  </span>
                  {definition.description && (
                    <span className="text-[11px] leading-snug text-muted-foreground">
                      {t(definition.description, { defaultValue: definition.description })}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

/** Page builder: list of blocks – open one to edit, move / duplicate / delete (with undo). */
export const AdminBlocksEditor: React.FC<IAdminBlocksEditorProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const { t } = useTranslation('admin');
  const [openId, setOpenId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const scrollTo = useRef<string | null>(null);
  const full = value.length >= SITE_PAGE_BLOCKS_MAX;

  // Newly added block → scroll its header into view.
  useEffect(() => {
    if (!scrollTo.current) return;
    document
      .getElementById(`block-${scrollTo.current}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    scrollTo.current = null;
  }, [value]);

  const update = (block: PageBlock) =>
    onChange(value.map(item => (item.id === block.id ? block : item)));

  const add = (block: PageBlock) => {
    const index = openId ? value.findIndex(item => item.id === openId) : -1;
    const next = [...value];
    next.splice(index >= 0 ? index + 1 : next.length, 0, block);
    onChange(next);
    setOpenId(block.id);
    setPicking(false);
    scrollTo.current = block.id;
  };

  const move = (index: number, delta: number) => {
    const next = [...value];
    const [block] = next.splice(index, 1);
    next.splice(index + delta, 0, block);
    onChange(next);
  };

  const duplicate = (index: number) => {
    const copy = duplicateBlock(value[index]);
    const next = [...value];
    next.splice(index + 1, 0, copy);
    onChange(next);
    setOpenId(copy.id);
    scrollTo.current = copy.id;
  };

  const remove = (index: number) => {
    const before = value;
    const block = value[index];
    onChange(value.filter((_, i) => i !== index));
    if (openId === block.id) setOpenId(null);
    toast(t('blocks.removed', { type: t(blockLabel(block), { defaultValue: block.type }) }), {
      action: { label: t('blocks.undo'), onClick: () => onChange(before) },
    });
  };

  const iconButton =
    'grid size-9 place-items-center rounded-full transition-colors hover:bg-foreground/10 disabled:opacity-30';

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-caption font-medium text-foreground">{t('blocks.title')}</p>
        <span className="text-xs text-muted-foreground tabular-nums">
          {value.length} / {SITE_PAGE_BLOCKS_MAX}
        </span>
      </div>

      {value.length === 0 && !picking && (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border px-6 py-8 text-center">
          <LayoutGrid className="size-6 text-muted-foreground" aria-hidden="true" />
          <p className="mt-2 text-body font-semibold">{t('blocks.emptyTitle')}</p>
          <p className="mt-0.5 text-caption text-muted-foreground">{t('blocks.empty')}</p>
        </div>
      )}

      <ol className="space-y-2">
        {value.map((block, index) => {
          const Icon = blockIcon(block);
          const open = openId === block.id;
          const summary = blockSummary(block);
          return (
            <li
              key={block.id}
              id={`block-${block.id}`}
              className={cn(
                'scroll-mt-4 rounded-2xl border transition-colors',
                open ? 'border-foreground/25 bg-foreground/[0.015]' : 'border-border/60'
              )}
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : block.id)}
                aria-expanded={open}
                aria-controls={`block-panel-${block.id}`}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-foreground/[0.07]">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-semibold">
                    {t(blockLabel(block), { defaultValue: block.type })}
                  </span>
                  <span className="block truncate text-caption text-muted-foreground">
                    {summary || t('blocks.noContent')}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    'size-4 shrink-0 text-muted-foreground transition-transform',
                    open && 'rotate-180'
                  )}
                  aria-hidden="true"
                />
              </button>

              {open && (
                <div id={`block-panel-${block.id}`} className="border-t border-border/50">
                  <div className="flex items-center gap-0.5 px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={disabled || index === 0}
                      aria-label={t('blocks.action.up')}
                      className={iconButton}
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={disabled || index === value.length - 1}
                      aria-label={t('blocks.action.down')}
                      className={iconButton}
                    >
                      <ArrowDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicate(index)}
                      disabled={disabled || full}
                      aria-label={t('blocks.action.duplicate')}
                      className={iconButton}
                    >
                      <Copy className="size-4" />
                    </button>
                    <span className="flex-1" />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={disabled}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-caption font-bold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-30"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      {t('blocks.action.remove')}
                    </button>
                  </div>
                  <div className="space-y-4 px-3 pt-1 pb-4">
                    <BlockEditor block={block} onChange={update} disabled={disabled} />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-3">
        {picking ? (
          <BlockPicker onPick={add} onClose={() => setPicking(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setPicking(true)}
            disabled={disabled || full}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-dashed border-foreground/30 text-body font-bold transition-colors hover:bg-foreground/[0.04] disabled:opacity-50"
          >
            <Plus className="size-4" aria-hidden="true" />
            {openId ? t('blocks.addAfter') : t('blocks.add')}
          </button>
        )}
        {full && (
          <p className="mt-1.5 text-center text-caption text-muted-foreground">
            {t('blocks.full', { max: SITE_PAGE_BLOCKS_MAX })}
          </p>
        )}
      </div>
    </div>
  );
};
