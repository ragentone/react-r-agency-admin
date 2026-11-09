import { cn } from '@ui/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ui/shad-cn/components/dropdown-menu';
import { Empty, EmptyDescription, EmptyHeader } from '@ui/shad-cn/components/empty';
import { Tabs, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs';
import { MoreHorizontal } from 'lucide-react';
import * as React from 'react';

import {
  kanbanCardClassName,
  kanbanColumnVariants,
  kanbanMoreTriggerClassName,
} from './kanban.variants.ts';

export interface KanbanColumnDef {
  id: string;
  label: string;
}

export interface KanbanLabels {
  /** Shown in an empty column. */
  empty: string;
  /** Accessible name of the ⋯ button on each card. */
  moreActions: string;
  /** Prefix of a move entry, e.g. „Verschieben nach“. */
  moveTo: string;
}

export interface KanbanProps<T> {
  columns: KanbanColumnDef[];
  items: T[];
  getId: (item: T) => string;
  getColumnId: (item: T) => string;
  /** Card content only. The move menu and drag handle are added by the board. */
  renderCard: (item: T) => React.ReactNode;
  /** Called on drop and from the ⋯ menu. */
  onMove: (item: T, columnId: string) => void;
  /** Workflow rule: moves that are not allowed are disabled in the menu and ignored on drop. */
  canMove?: (item: T, columnId: string) => boolean;
  labels: KanbanLabels;
  className?: string;
}

/**
 * Board with two ways to move a card: drag and drop (md and up, HTML5 drag events)
 * and the ⋯ menu, which works on every screen size. On mobile one column is shown at a time.
 */
export function Kanban<T>({
  columns,
  items,
  getId,
  getColumnId,
  renderCard,
  onMove,
  canMove,
  labels,
  className,
}: KanbanProps<T>) {
  const allowed = (item: T, columnId: string) => (canMove ? canMove(item, columnId) : true);
  const [activeId, setActiveId] = React.useState(columns[0]?.id ?? '');
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [overColumnId, setOverColumnId] = React.useState<string | null>(null);

  const itemsByColumn = React.useMemo(() => {
    const map = new Map<string, T[]>();
    columns.forEach(column => map.set(column.id, []));
    items.forEach(item => map.get(getColumnId(item))?.push(item));
    return map;
  }, [columns, items, getColumnId]);

  const handleDrop = (columnId: string) => (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    const item = draggingId ? items.find(candidate => getId(candidate) === draggingId) : undefined;
    setDraggingId(null);
    setOverColumnId(null);
    if (item && getColumnId(item) !== columnId && allowed(item, columnId)) onMove(item, columnId);
  };

  return (
    <div className={cn('flex w-full flex-col gap-3', className)}>
      <Tabs value={activeId} onValueChange={setActiveId} className="md:hidden">
        <TabsList className="w-full">
          {columns.map(column => (
            <TabsTrigger key={column.id} value={column.id} className="flex-1 gap-1.5">
              <span>{column.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {itemsByColumn.get(column.id)?.length ?? 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-3">
        {columns.map(column => {
          const columnItems = itemsByColumn.get(column.id) ?? [];
          const isOver = overColumnId === column.id;
          return (
            <section
              key={column.id}
              aria-label={column.label}
              onDragOver={event => {
                event.preventDefault();
                if (overColumnId !== column.id) setOverColumnId(column.id);
              }}
              onDragLeave={event => {
                if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                setOverColumnId(null);
              }}
              onDrop={handleDrop(column.id)}
              className={cn(
                kanbanColumnVariants({ active: column.id === activeId }),
                isOver && 'ring-2 ring-ring/40'
              )}
            >
              <h3 className="hidden items-center justify-between px-1 pt-1 text-micro font-semibold tracking-wide text-muted-foreground uppercase md:flex">
                <span>{column.label}</span>
                <span className="rounded-full bg-background px-2 py-0.5 text-foreground tabular-nums">
                  {columnItems.length}
                </span>
              </h3>

              {columnItems.length === 0 ? (
                <Empty className="border border-dashed border-border/50 py-8">
                  <EmptyHeader>
                    <EmptyDescription>{labels.empty}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                columnItems.map(item => {
                  const id = getId(item);
                  return (
                    <article
                      key={id}
                      draggable
                      onDragStart={event => {
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', id);
                        setDraggingId(id);
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setOverColumnId(null);
                      }}
                      className={cn(
                        kanbanCardClassName,
                        'md:cursor-grab md:active:cursor-grabbing',
                        draggingId === id && 'opacity-50'
                      )}
                    >
                      <div className="min-w-0 flex-1">{renderCard(item)}</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label={labels.moreActions}
                          className={kanbanMoreTriggerClassName}
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {columns
                            .filter(target => target.id !== column.id)
                            .map(target => (
                              <DropdownMenuItem
                                key={target.id}
                                disabled={!allowed(item, target.id)}
                                onSelect={() => onMove(item, target.id)}
                              >
                                {labels.moveTo} {target.label}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </article>
                  );
                })
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
