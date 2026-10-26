import type { CmsComponent } from '@core/cms';
import type { ICmsProfileButtonsPayload } from '@core/profile';
import { MessengerButton } from '@module/messenger';

/**
 * MessengerProfileButton is a React functional component that renders a MessengerButton
 * based on the profile information provided in the payload.
 * It accepts a single prop of type CmsComponent<ICmsProfileButtonsPayload> and extracts
 * the profile data from the payload. If the profile data is not available, the component
 * will return null and render nothing.
 * The component constructs a user object from the profile information, including the user's
 * ID, alias, and avatar URL. This user object is then passed to the MessengerButton component
 * along with a placeholder handler for the `onBeforeOpen` event.
 */
const MessengerProfileButton: CmsComponent<ICmsProfileButtonsPayload> = props => {
  if (!props.payload?.profile) {
    return null;
  }

  const { profile } = props.payload;

  return (
    <MessengerButton
      user={{
        id: profile.userId,
        alias: profile.alias,
        avatarUrl: profile.avatarUrl ?? null,
      }}
    />
  );
};

export { MessengerProfileButton };
