import { cn } from '@ui/lib/utils';
import React, { useEffect, useState } from 'react';

import { usePluginsLoaded } from './plugin.bootstrap';
import { usePluginSlot } from './plugin.slots';
import type { PluginScope, PluginSlotName } from './plugin.types';
import { PluginBoundary } from './PluginBoundary';

interface IPluginSlotProps {
  name: PluginSlotName;
  className?: string;
  /** App the slot lives in. Plugins of other scopes are not loaded here. */
  scope?: PluginScope;
}

/**
 * Opens its content smoothly: the height grows from 0 and the content fades in, so the page below
 * moves down gently instead of jumping. The padding and border belong to the content, so a closed
 * slot takes no space at all.
 */
const Reveal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
};

/**
 * Renders every plugin component registered for `name`. Nothing is shown while the plugins load;
 * then the components open in. Renders nothing if there are no components.
 */
export const PluginSlot: React.FC<IPluginSlotProps> = ({ name, className, scope = 'frontend' }) => {
  const entries = usePluginSlot(name);
  const loaded = usePluginsLoaded(scope);
  if (!loaded || entries.length === 0) return null;

  return (
    <Reveal>
      <div data-slot="plugin-slot" data-name={name} className={className}>
        {entries.map(({ pluginId, component: Component }) => (
          <PluginBoundary key={pluginId} pluginId={pluginId} slot={name}>
            <Component pluginId={pluginId} />
          </PluginBoundary>
        ))}
      </div>
    </Reveal>
  );
};
