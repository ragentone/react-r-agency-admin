import { cn } from '@ui/lib/utils';
import React, { useEffect, useState } from 'react';

import { usePluginsReady } from './plugin.bootstrap';
import { usePluginSlot } from './plugin.slots';
import type { PluginScope, PluginSlotName } from './plugin.types';
import { PluginBoundary } from './PluginBoundary';

interface IPluginSlotProps {
  name: PluginSlotName;
  className?: string;
  /** App the slot lives in. Plugins of other scopes are not loaded here. */
  scope?: PluginScope;
  /**
   * Content that follows the slot (e.g. the timeline). It is held back until the plugins are loaded
   * (or the wait times out), then shown in the same frame as the plugin components, so nothing moves.
   */
  children?: React.ReactNode;
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
 * Renders every plugin component registered for `name`. Nothing is shown while the plugins load.
 * With `children`, the plugin components and the children appear together, without a height
 * animation, so the content below does not move. Without children, the components open in with `Reveal`.
 */
export const PluginSlot: React.FC<IPluginSlotProps> = ({ name, className, scope = 'frontend', children }) => {
  const entries = usePluginSlot(name);
  const ready = usePluginsReady(scope);
  if (!ready) return null;

  const hasChildren = children !== undefined && children !== null && children !== false;
  const components =
    entries.length === 0 ? null : (
      <div data-slot="plugin-slot" data-name={name} className={className}>
        {entries.map(({ pluginId, component: Component }) => (
          <PluginBoundary key={pluginId} pluginId={pluginId} slot={name}>
            <Component pluginId={pluginId} />
          </PluginBoundary>
        ))}
      </div>
    );

  if (!hasChildren) return components ? <Reveal>{components}</Reveal> : null;

  return (
    <>
      {components}
      {children}
    </>
  );
};
