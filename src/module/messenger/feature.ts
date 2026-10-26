/**
 * Is the messenger module active? Set only by `core.tsx`, which the auto-import loads only when
 * `config.json` has `"active": true` (and `build.config.json` doesn't disable it).
 * Other modules (profile, friends) check this before showing messenger buttons.
 */
let active = false;

export const markMessengerActive = () => {
  active = true;
};

export const isMessengerActive = () => active;
