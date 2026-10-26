/**
 * Is the credits module active? Set only by `module.tsx`, which the auto-import loads only when
 * `config.json` has `"active": true` (and `build.config.json` doesn't disable it).
 * Apps (forum, timeline …) check this before showing credit buttons.
 */
let active = false;

export const markCreditsActive = () => {
  active = true;
};

export const isCreditsActive = () => active;
