import { Button } from '@ui/shad-cn/components/button.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { Textarea } from '@ui/shad-cn/components/textarea.tsx';
import { ToggleGroup, ToggleGroupItem } from '@ui/shad-cn/components/toggle-group.tsx';
import { Loader2 } from 'lucide-react';
import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SystemApi } from '../api';
import type { ISystemRelease, SystemReleaseBump } from '../types';

const BUMPS: SystemReleaseBump[] = ['patch', 'minor', 'major'];
/** Same limit as the runtime (`RELEASE_NOTES_MAX_LINES`). */
const NOTES_MAX = 8;

const linesOf = (text: string) =>
  text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

/**
 * "Next version": patch / minor / major (with the number each gives), "what's new" and
 * "force update" for the next production build. Saved explicitly, used up by the build.
 */
export const SystemReleasePlan: React.FC<{ release: ISystemRelease; onSaved: () => void }> = ({
  release,
  onSaved,
}) => {
  const { t } = useTranslation('admin');
  const notesId = useId();
  const requiredId = useId();
  const saved = {
    bump: release.plan.bump,
    notes: release.plan.notes.join('\n'),
    required: release.plan.required,
  };
  const [draft, setDraft] = useState(saved);
  const [busy, setBusy] = useState(false);
  // New plan from the server (deploy used it up / saved elsewhere) → take it over.
  const savedKey = JSON.stringify(saved);
  const [baseKey, setBaseKey] = useState(savedKey);
  if (savedKey !== baseKey) {
    setBaseKey(savedKey);
    setDraft(saved);
  }

  const lines = linesOf(draft.notes);
  const tooMany = lines.length > NOTES_MAX;
  const dirty =
    draft.bump !== saved.bump ||
    draft.required !== saved.required ||
    lines.join('\n') !== linesOf(saved.notes).join('\n');

  const save = async () => {
    setBusy(true);
    const result = await SystemApi.releasePlan({
      bump: draft.bump,
      notes: lines.join('\n'),
      required: draft.required,
    });
    setBusy(false);
    if (!result.success) {
      toast.error(t('system.deploys.next.saveError'));
      return;
    }
    toast.success(t('system.deploys.next.saved'));
    onSaved();
  };

  return (
    <section aria-labelledby={`${notesId}-title`} className="border-b border-border/50 px-4 py-4">
      <h3 id={`${notesId}-title`} className="text-title font-bold">
        {t('system.deploys.next.title')}
      </h3>
      <p className="text-caption text-muted-foreground">
        {release.current ? t('system.deploys.next.text') : t('system.deploys.next.first')}
      </p>

      <p className="mt-4 mb-2 text-caption font-semibold text-muted-foreground">
        {t('system.deploys.next.bumpLabel')}
      </p>
      <ToggleGroup
        type="single"
        value={draft.bump}
        onValueChange={value =>
          value && setDraft(d => ({ ...d, bump: value as SystemReleaseBump }))
        }
        aria-label={t('system.deploys.next.bumpLabel')}
        disabled={busy}
        className="grid w-full grid-cols-3 gap-1 rounded-2xl border border-border/60 p-1"
      >
        {BUMPS.map(bump => (
          <ToggleGroupItem
            key={bump}
            value={bump}
            className="flex h-auto min-h-14 flex-col gap-0 rounded-xl px-1 py-2 data-[state=on]:bg-foreground data-[state=on]:text-background"
          >
            <span className="text-caption font-bold">{t(`system.deploys.bump.${bump}`)}</span>
            <span className="font-mono text-body font-bold tabular-nums">
              {release.current ? release.options[bump] : '1.0.0'}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="mt-1.5 text-caption text-muted-foreground">
        {t(`system.deploys.next.bumpHint.${draft.bump}`)}
      </p>

      <div className="mt-4">
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <label htmlFor={notesId} className="text-body font-semibold">
            {t('system.deploys.next.notes')}
          </label>
          <span
            className={
              tooMany
                ? 'text-xs text-destructive tabular-nums'
                : 'text-xs text-muted-foreground tabular-nums'
            }
          >
            {lines.length} / {NOTES_MAX}
          </span>
        </div>
        <Textarea
          id={notesId}
          value={draft.notes}
          onChange={event => setDraft(d => ({ ...d, notes: event.target.value }))}
          placeholder={t('system.deploys.next.notesPlaceholder')}
          disabled={busy}
          aria-invalid={tooMany}
          aria-describedby={`${notesId}-hint`}
          rows={3}
          className="min-h-24 rounded-xl text-base sm:text-body"
        />
        <p id={`${notesId}-hint`} className="mt-1.5 text-caption text-muted-foreground">
          {t('system.deploys.next.notesHint', { max: NOTES_MAX })}
        </p>
      </div>

      <label htmlFor={requiredId} className="mt-4 flex cursor-pointer items-center gap-4 py-1">
        <span className="min-w-0 flex-1">
          <span className="block text-body font-semibold text-foreground">
            {t('system.deploys.next.required')}
          </span>
          <span className="block text-caption text-muted-foreground">
            {t('system.deploys.next.requiredHint')}
          </span>
        </span>
        <Switch
          id={requiredId}
          checked={draft.required}
          onCheckedChange={required => setDraft(d => ({ ...d, required }))}
          disabled={busy}
        />
      </label>

      <div className="mt-4 flex gap-2">
        {dirty && (
          <Button
            variant="ghost"
            className="h-11 rounded-full px-4 font-bold"
            onClick={() => setDraft(saved)}
            disabled={busy}
          >
            {t('system.deploys.next.reset')}
          </Button>
        )}
        <Button
          className="h-11 flex-1 rounded-full font-bold"
          onClick={() => void save()}
          disabled={!dirty || busy || tooMany}
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {t('system.deploys.next.save')}
        </Button>
      </div>
    </section>
  );
};
