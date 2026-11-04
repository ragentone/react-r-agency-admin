import { Events } from '@core/event/events.ts';
import React from 'react';

interface IPluginBoundaryProps {
  pluginId: string;
  /** Slot the plugin renders into. Reported with the mount / unmount events. */
  slot?: string;
  children: React.ReactNode;
}
interface IPluginBoundaryState {
  failed: boolean;
}

/** Hides one plugin that throws while rendering; other plugins and the page keep working. */
export class PluginBoundary extends React.Component<IPluginBoundaryProps, IPluginBoundaryState> {
  state: IPluginBoundaryState = { failed: false };

  static getDerivedStateFromError(): IPluginBoundaryState {
    return { failed: true };
  }

  componentDidMount() {
    const { pluginId, slot } = this.props;
    if (slot) void Events.core.emit('plugin:slot:mount', { payload: { pluginId, slot } });
  }

  componentWillUnmount() {
    const { pluginId, slot } = this.props;
    if (slot) void Events.core.emit('plugin:slot:unmount', { payload: { pluginId, slot } });
  }

  componentDidCatch(error: Error) {
    console.error(`[plugin:${this.props.pluginId}] render`, error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
