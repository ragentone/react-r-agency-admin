import { createElement } from 'react';

import type { ColorPickerProps } from '@core/editor/color';
import type { DateTimePickerProps } from '@core/editor/datetime';
import type { EmojiPickerProps } from '@core/editor/emoji';
import { LazyHtmlEditor } from '@core/editor/html/lazy.html-editor.tsx';
import type { HtmlEditorProps } from '@core/editor/html/types.ts';
import { lazyComponent } from '@core/utils/lazy.component.ts';

/**
 * Editor-Bausteine für Plugins (`api.ui`). Die Komponenten kommen aus dem Host, Plugins bündeln sie nicht.
 * Die Picker laden erst bei Bedarf, damit sie das Start-Bundle nicht vergrößern.
 * Die HTML-Ausgabe des Editors wird hier nicht bereinigt. Ein Plugin, das Nutzer-HTML anzeigt, bereinigt es selbst.
 */

/**
 * Standard ohne `features` wäre `none` (keine Toolbar). Plugins bekommen deshalb `basic`,
 * wie das Konfigurationsfeld im Admin. Ein eigener Wert (Preset oder einzelne Schalter) hat Vorrang.
 */
export function PluginHtmlEditor(props: Omit<HtmlEditorProps, 'ref'>) {
  return createElement(LazyHtmlEditor, { ...props, features: props.features ?? 'basic' });
}

const fallback = createElement('div', {
  'aria-busy': true,
  className: 'h-10 w-full animate-pulse rounded-md bg-muted/30',
});

export const PluginColorPicker = lazyComponent<ColorPickerProps>(
  () => import('@core/editor/color').then(m => m.ColorPicker),
  { name: 'PluginColorPicker', fallback }
);

export const PluginEmojiPicker = lazyComponent<EmojiPickerProps>(
  () => import('@core/editor/emoji').then(m => m.EmojiPicker),
  { name: 'PluginEmojiPicker', fallback }
);

export const PluginDateTimePicker = lazyComponent<DateTimePickerProps>(
  () => import('@core/editor/datetime').then(m => m.DateTimePicker),
  { name: 'PluginDateTimePicker', fallback }
);
