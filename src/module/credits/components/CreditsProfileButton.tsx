import type { CmsComponent } from '@core/cms';
import type { ICmsProfileButtonsPayload } from '@core/profile';
import { Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useCreditsEnabled, useCreditTipContext } from '../hooks.ts';
import { openCreditTip } from '../store.ts';

const iconButton =
  'grid size-9 shrink-0 place-items-center rounded-full text-foreground outline-none transition-colors hover:bg-foreground/10 active:bg-foreground/15 focus-visible:ring-2 focus-visible:ring-ring';

/** Profile header (friends): send credits directly (`core.transfer`). */
export const CreditsProfileButton: CmsComponent<ICmsProfileButtonsPayload> = props => {
  const { t } = useTranslation('credits');
  const enabled = useCreditsEnabled();
  const transfer = useCreditTipContext('core.transfer');
  const profile = props.payload?.profile;
  if (!enabled || !transfer || !profile?.userId) return null;
  const label = t('tip.button', { name: profile.alias });
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={iconButton}
      onClick={() =>
        openCreditTip({
          context: 'core.transfer',
          refId: profile.userId,
          recipient: {
            id: profile.userId,
            alias: profile.alias,
            avatarUrl: profile.avatarUrl ?? null,
          },
        })
      }
    >
      <Coins className="size-5" aria-hidden="true" />
    </button>
  );
};
