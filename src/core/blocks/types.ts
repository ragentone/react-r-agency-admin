import type { ComponentType, SVGProps } from 'react';

/**
 * Editor field of an app block – the admin page editor renders it, the backend validates the
 * same keys (runtime: CAN bus `site-page` → `collect_blocks`). Labels are translation keys
 * (`ns:key`) or plain text.
 */
export type PageBlockField =
  | { key: string; kind: 'text'; label: string; max: number; placeholder?: string; hint?: string }
  | { key: string; kind: 'textarea'; label: string; max: number; rows?: number; hint?: string }
  | { key: string; kind: 'url'; label: string }
  | { key: string; kind: 'image'; label: string; hint?: string }
  | {
      key: string;
      kind: 'choice';
      label: string;
      options: { value: string; label: string }[];
    }
  | { key: string; kind: 'toggle'; label: string; hint?: string };

export type PageBlockData = Record<string, unknown>;

export interface IPageBlockRenderProps<Data extends PageBlockData = PageBlockData> {
  /** Validated settings of the block (stored with the page). */
  data: Data;
  id: string;
  /** First block of the page (e.g. render the heading as `h1`). */
  first: boolean;
}

export type PageBlockIcon = ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number }>;

export interface IPageBlockDefinition<Data extends PageBlockData = PageBlockData> {
  /** `<app>:<name>`, e.g. `timeline:best` – same name the backend registers. */
  type: string;
  /** Translation key (`ns:key`) or plain text. */
  label: string;
  description?: string;
  icon: PageBlockIcon;
  /** Initial settings of a new block. */
  defaults: () => Data;
  /** Settings the admin can change (rendered by the page editor). */
  fields: PageBlockField[];
  /** Renders the block on the page – use `lazy()` to keep it out of the main chunk. */
  render: ComponentType<IPageBlockRenderProps<Data>>;
  /** Preview line in the editor list. */
  summary?: (data: Data) => string;
  /** Spans the whole page width (like the banner) instead of the reading column. */
  fullWidth?: boolean;
  /** Position in the block picker (lower first). */
  sortOrder?: number;
}

export interface IPageBlockManager {
  /** Register (or replace) a block type. Returns an unregister function. */
  register<Data extends PageBlockData>(definition: IPageBlockDefinition<Data>): () => void;
  unregister(type: string): void;
  get(type: string): IPageBlockDefinition | undefined;
  list(): IPageBlockDefinition[];
  subscribe(listener: () => void): () => void;
  getVersion(): number;
}
