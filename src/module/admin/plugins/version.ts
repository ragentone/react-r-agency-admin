export type PluginBump = 'patch' | 'minor' | 'major';

/** Same rule as the runtime: raises one part and resets the lower ones. */
export const bumpVersion = (version: string, bump: PluginBump): string => {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number);
  if (bump === 'major') return `${major + 1}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
};
