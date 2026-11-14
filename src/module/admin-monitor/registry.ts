import type { ComponentType } from 'react';

/** View of a module section in the "App" tab; `data` is what the module's runtime part delivers. */
export type MonitorSectionComponent = ComponentType<{ data: unknown }>;

const sections = new Map<string, MonitorSectionComponent>();

/**
 * A module shows its own section in the monitor ("App" tab): `id` = the id the runtime module
 * registered with. Call it where the module registers (`module.tsx`); a lazy component keeps the
 * code out of the monitor chunk. Registering again replaces the view (hot reload).
 */
export const registerMonitorSection = (id: string, component: MonitorSectionComponent): void => {
  sections.set(id, component);
};

/** The registered view of a module section (`undefined` = this admin has none → not shown). */
export const getMonitorSection = (id: string): MonitorSectionComponent | undefined =>
  sections.get(id);
