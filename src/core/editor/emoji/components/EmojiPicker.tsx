import { cn } from '@ui/lib/utils';
import { Spinner } from '@ui/shad-cn/components/spinner';
import {
  AppleIcon,
  CarIcon,
  ClockIcon,
  FlagIcon,
  HeartIcon,
  LightbulbIcon,
  type LucideIcon,
  PawPrintIcon,
  SearchIcon,
  SmileIcon,
  TrophyIcon,
} from 'lucide-react';
import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type SyntheticEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { useStoredState } from '../../shared';
import { searchEmojis } from '../data';
import { useEmojiData } from '../hooks';
import type { EmojiItem, EmojiPickerProps, EmojiSkinTone } from '../types';
import { EMOJI_SKIN_HANDS } from './emoji-skin-tones.const.ts';
import { EmojiPickerSection } from './EmojiPickerSection';
import { EmojiPickerSkinTones } from './EmojiPickerSkinTones';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  recent: ClockIcon,
  people: SmileIcon,
  nature: PawPrintIcon,
  foods: AppleIcon,
  activity: TrophyIcon,
  places: CarIcon,
  objects: LightbulbIcon,
  symbols: HeartIcon,
  flags: FlagIcon,
};

const STORAGE_SKIN = 'editor.emoji.skin';
const STORAGE_RECENT = 'editor.emoji.recent';
const ARROW_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

interface Section {
  id: string;
  emojis: EmojiItem[];
}

export function EmojiPicker({
  onSelect,
  emojiSize = 24,
  columns = 8,
  height = 300,
  categories,
  maxVersion,
  showSearch = true,
  showCategories = true,
  showSkinTones = true,
  showRecent = true,
  maxRecent,
  persist = true,
  autoFocus = true,
  fluid = false,
  className,
}: EmojiPickerProps) {
  const { t } = useTranslation('editor');
  const data = useEmojiData();

  const [query, setQuery] = useState('');
  const [skin, setSkin] = useStoredState<EmojiSkinTone>(STORAGE_SKIN, 0, persist);
  const [recentIds, setRecentIds] = useStoredState<string[]>(STORAGE_RECENT, [], persist);
  // Snapshot so the grid doesn't jump while the picker is open.
  const [recentSnapshot] = useState(recentIds);
  const [skinOpen, setSkinOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [preview, setPreview] = useState<EmojiItem | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const cell = Math.max(emojiSize + 8, Math.round(emojiSize * 1.4));
  const width = columns * cell + 16 + 10; // grid + padding + scrollbar
  const searching = query.trim().length > 0;

  const visibleCategories = useMemo(() => {
    if (!data) return [];
    const list = categories
      ? categories.flatMap(id => data.categories.filter(c => c.id === id))
      : data.categories;
    if (maxVersion === undefined) return list;
    return list.map(c => ({ ...c, emojis: c.emojis.filter(e => e.version <= maxVersion) }));
  }, [data, categories, maxVersion]);

  const sections = useMemo<Section[]>(() => {
    if (!data) return [];
    if (searching) {
      return [
        {
          id: 'search',
          emojis: searchEmojis(
            visibleCategories.flatMap(c => c.emojis),
            query
          ),
        },
      ];
    }
    const result: Section[] = [];
    if (showRecent) {
      const recent = recentSnapshot
        .map(id => data.byId.get(id))
        .filter((e): e is EmojiItem => !!e && (maxVersion === undefined || e.version <= maxVersion))
        .slice(0, maxRecent ?? columns * 2);
      if (recent.length > 0) result.push({ id: 'recent', emojis: recent });
    }
    return [...result, ...visibleCategories];
  }, [
    data,
    searching,
    query,
    visibleCategories,
    showRecent,
    recentSnapshot,
    maxRecent,
    columns,
    maxVersion,
  ]);

  const activeId = active ?? sections[0]?.id;

  const select = (emoji: EmojiItem) => {
    setRecentIds(prev => [emoji.id, ...prev.filter(id => id !== emoji.id)].slice(0, 50));
    onSelect({ id: emoji.id, native: emoji.skins[skin] ?? emoji.skins[0], name: emoji.name, skin });
  };

  const emojiFromEvent = (event: SyntheticEvent) => {
    const el = (event.target as HTMLElement).closest<HTMLElement>('[data-emoji]');
    return el?.dataset.emoji ? (data?.byId.get(el.dataset.emoji) ?? null) : null;
  };

  const onGridClick = (event: MouseEvent) => {
    const emoji = emojiFromEvent(event);
    if (emoji) select(emoji);
  };

  const onGridHover = (event: SyntheticEvent) => {
    const emoji = emojiFromEvent(event);
    if (emoji && emoji.id !== preview?.id) setPreview(emoji);
  };

  const onScroll = () => {
    const container = scrollRef.current;
    if (!container || searching) return;
    let current = sections[0]?.id ?? null;
    container.querySelectorAll<HTMLElement>('[data-section]').forEach(el => {
      if (el.offsetTop - 4 <= container.scrollTop) current = el.dataset.section ?? current;
    });
    if (current !== active) setActive(current);
  };

  const scrollToSection = (id: string) => {
    const el = scrollRef.current?.querySelector<HTMLElement>(`[data-section="${id}"]`);
    if (!el || !scrollRef.current) return;
    scrollRef.current.scrollTo({ top: el.offsetTop });
    setActive(id);
  };

  const emojiButtons = () =>
    Array.from(scrollRef.current?.querySelectorAll<HTMLButtonElement>('button[data-emoji]') ?? []);

  const focusButton = (button?: HTMLButtonElement) => {
    if (!button) return;
    button.focus({ preventScroll: true });
    button.scrollIntoView({ block: 'nearest' });
  };

  const onGridKeyDown = (event: KeyboardEvent) => {
    if (!ARROW_KEYS.includes(event.key)) return;
    const buttons = emojiButtons();
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();

    if (event.key === 'ArrowRight') return focusButton(buttons[index + 1]);
    if (event.key === 'ArrowLeft') return focusButton(buttons[index - 1]);

    // Up/Down: closest button (by x) in the adjacent visual row.
    const dir = event.key === 'ArrowDown' ? 1 : -1;
    const from = buttons[index].getBoundingClientRect();
    let rowTop: number | null = null;
    let best: HTMLButtonElement | undefined;
    let bestDistance = Infinity;
    for (let i = index + dir; i >= 0 && i < buttons.length; i += dir) {
      const rect = buttons[i].getBoundingClientRect();
      if (Math.abs(rect.top - from.top) < 2) continue;
      rowTop ??= rect.top;
      if (Math.abs(rect.top - rowTop) >= 2) break;
      const distance = Math.abs(rect.left - from.left);
      if (distance < bestDistance) {
        best = buttons[i];
        bestDistance = distance;
      }
    }
    if (best) focusButton(best);
    else if (dir === -1) searchRef.current?.focus();
  };

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const first = sections[0]?.emojis[0];
      if (searching && first) select(first);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusButton(emojiButtons()[0]);
    }
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    setPreview(null);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const changeSkin = (tone: EmojiSkinTone) => {
    setSkin(tone);
    setSkinOpen(false);
    searchRef.current?.focus();
  };

  const style = {
    // Never wider than the viewport; columns reflow via auto-fill.
    width: fluid ? '100%' : `min(${width}px, 100%, calc(100vw - 1rem))`,
    '--emoji-size': `${emojiSize}px`,
    '--emoji-cell': `${cell}px`,
  } as CSSProperties;

  if (!data) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{
          ...style,
          height: `min(${height + (showSearch ? 52 : 0) + (showCategories ? 40 : 0)}px, 60dvh)`,
        }}
      >
        <Spinner />
      </div>
    );
  }

  const label = (id: string) =>
    id === 'search' ? t('emoji.searchResults') : t(`emoji.categories.${id}`);
  const noResults = searching && sections[0]?.emojis.length === 0;

  return (
    <div
      data-html-editor-ui=""
      className={cn('flex flex-col text-popover-foreground', className)}
      style={style}
    >
      {(showSearch || showSkinTones) && (
        <div className="flex items-center gap-2 p-2 pb-1">
          {skinOpen ? (
            <EmojiPickerSkinTones value={skin} onChange={changeSkin} />
          ) : (
            <>
              {showSearch && (
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    autoFocus={autoFocus}
                    onChange={e => changeQuery(e.target.value)}
                    onKeyDown={onSearchKeyDown}
                    placeholder={t('emoji.search')}
                    aria-label={t('emoji.search')}
                    enterKeyHint="search"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="h-9 w-full rounded-md border border-transparent bg-muted pr-2 pl-8 text-sm outline-none pointer-coarse:h-10 pointer-coarse:text-base placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-background"
                  />
                </div>
              )}
              {showSkinTones && (
                <button
                  type="button"
                  aria-label={t('emoji.skinTone')}
                  aria-expanded={skinOpen}
                  onClick={() => setSkinOpen(true)}
                  className={cn(
                    'emoji-native flex size-9 shrink-0 items-center justify-center rounded-md text-lg transition-colors hover:bg-accent',
                    'focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none',
                    !showSearch && 'ml-auto'
                  )}
                >
                  {EMOJI_SKIN_HANDS[skin]}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {showCategories && !searching && (
        <nav className="flex items-center justify-between border-b border-border/50 px-2">
          {sections.map(section => {
            const Icon = CATEGORY_ICONS[section.id] ?? SmileIcon;
            const isActive = section.id === activeId;
            return (
              <button
                key={section.id}
                type="button"
                title={label(section.id)}
                aria-label={label(section.id)}
                aria-current={isActive || undefined}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  'relative flex h-9 min-w-0 flex-1 items-center justify-center text-muted-foreground pointer-coarse:h-10 transition-colors hover:text-foreground',
                  'focus-visible:text-foreground focus-visible:outline-none',
                  'after:absolute after:inset-x-1.5 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent',
                  isActive && 'text-foreground after:bg-primary'
                )}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </nav>
      )}

      <div
        ref={scrollRef}
        role="listbox"
        aria-label={t('emoji.pick')}
        onScroll={onScroll}
        onClick={onGridClick}
        onMouseOver={onGridHover}
        onFocus={onGridHover}
        onKeyDown={onGridKeyDown}
        className="relative overflow-y-auto px-2 pb-2 [scrollbar-width:thin]"
        style={{ height: `min(${height}px, 45dvh)` }}
      >
        {noResults ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="emoji-native text-3xl">🔍</span>
            {t('emoji.noResults')}
          </div>
        ) : (
          sections.map((section, index) => (
            <EmojiPickerSection
              key={section.id}
              id={section.id}
              label={label(section.id)}
              emojis={section.emojis}
              skin={skin}
              tabbable={index === 0}
            />
          ))
        )}
      </div>
    </div>
  );
}
