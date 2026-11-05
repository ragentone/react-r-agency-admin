import * as FramerMotion from 'framer-motion';

/**
 * framer-motion for plugins: the host's own copy. The SDK module `@r-agency/plugin-sdk/motion` reads
 * it from `globalThis`, so plugin bundles do not contain the library.
 */
export const PLUGIN_MOTION = {
  motion: FramerMotion.motion,
  AnimatePresence: FramerMotion.AnimatePresence,
  animate: FramerMotion.animate,
  useMotionValue: FramerMotion.useMotionValue,
  useTransform: FramerMotion.useTransform,
  useReducedMotion: FramerMotion.useReducedMotion,
};

(globalThis as { __rAgencyPluginMotion?: typeof PLUGIN_MOTION }).__rAgencyPluginMotion = PLUGIN_MOTION;
