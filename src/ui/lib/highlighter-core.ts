import {
  createHighlighter,
  type HighlightTokenClass,
} from "@tanstack/highlight/core";
import { css } from "@tanstack/highlight/languages/css";
import { diff } from "@tanstack/highlight/languages/diff";
import { html } from "@tanstack/highlight/languages/html";
import { js } from "@tanstack/highlight/languages/js";
import { json } from "@tanstack/highlight/languages/json";
import { jsx } from "@tanstack/highlight/languages/jsx";
import { markdown } from "@tanstack/highlight/languages/markdown";
import { python } from "@tanstack/highlight/languages/python";
import { shell } from "@tanstack/highlight/languages/shell";
import { sql } from "@tanstack/highlight/languages/sql";
import { ts } from "@tanstack/highlight/languages/ts";
import { tsx } from "@tanstack/highlight/languages/tsx";
import { yaml } from "@tanstack/highlight/languages/yaml";

/**
 * Syntax highlighting for Code Block, on TanStack Highlight: synchronous,
 * no WASM, the same result on the server and in the browser.
 * Framework-free: React, Vue, Svelte and Solid all install this file as is,
 * and each renders its lines (`useHighlightedCode`).
 *
 * Colors are classes on CSS variables (`--th-keyword`, `--th-ansi-red`…),
 * which Code Block's registry item adds to your theme for light and dark.
 * There are no inline styles.
 */

/** A run of text and the classes that color it (none: the block's color). */
export interface CodeToken {
  className?: string;
  value: string;
}

/** One line's tokens. An empty line has none. */
export type CodeLine = CodeToken[];

/** The languages, by their TanStack Highlight grammar. Add the ones you need. */
const languages = {
  bash: shell,
  css,
  diff,
  html,
  javascript: js,
  json,
  jsx,
  markdown,
  python,
  sql,
  tsx,
  typescript: ts,
  yaml,
};

export type CodeLanguage = keyof typeof languages | "ansi";

const aliases: Record<string, keyof typeof languages> = {
  js: "javascript",
  md: "markdown",
  py: "python",
  sh: "bash",
  shell: "bash",
  shellscript: "bash",
  ts: "typescript",
  yml: "yaml",
  zsh: "bash",
};

const highlighter = createHighlighter({
  fallbackLanguage: "plaintext",
  languages: Object.values(languages),
});

/** Each token class's color, as a utility on its CSS variable. */
export const tokenClassNames: Record<HighlightTokenClass, string> = {
  attr: "text-(--th-attr)",
  "code-inline": "text-(--th-code-inline)",
  command: "text-(--th-command)",
  comment: "text-(--th-comment)",
  deleted: "text-(--th-deleted)",
  function: "text-(--th-function)",
  heading: "text-(--th-heading)",
  inserted: "text-(--th-inserted)",
  keyword: "text-(--th-keyword)",
  link: "text-(--th-link)",
  literal: "text-(--th-literal)",
  meta: "text-(--th-meta)",
  number: "text-(--th-number)",
  operator: "text-(--th-operator)",
  property: "text-(--th-property)",
  selector: "text-(--th-selector)",
  string: "text-(--th-string)",
  tag: "text-(--th-tag)",
  type: "text-(--th-type)",
  variable: "text-(--th-variable)",
};

/**
 * A language or alias as the highlighter knows it (`ts` → `typescript`),
 * `"ansi"`, or null for a language that isn't listed.
 */
export function getCodeLanguage(language: string): CodeLanguage | null {
  const name = language.toLowerCase();
  if (name === "ansi") {
    return name;
  }
  if (Object.hasOwn(languages, name)) {
    return name as keyof typeof languages;
  }
  return aliases[name] ?? null;
}

/** Splits tokens into lines: a token that spans lines becomes one per line. */
function toLines(tokens: readonly CodeToken[]): CodeLine[] {
  const lines: CodeLine[] = [[]];
  for (const token of tokens) {
    const parts = token.value.split("\n");
    for (const [index, value] of parts.entries()) {
      if (index > 0) {
        lines.push([]);
      }
      if (value) {
        lines
          .at(-1)
          ?.push(
            token.className ? { className: token.className, value } : { value }
          );
      }
    }
  }
  return lines;
}

/**
 * The lines of `code`, highlighted in `language` (a name, an alias or
 * `"ansi"`). A language that isn't listed comes back as plain lines.
 */
export function tokenizeCode(code: string, language: string): CodeLine[] {
  const lang = getCodeLanguage(language);
  if (lang === "ansi") {
    return tokenizeAnsi(code);
  }
  if (!lang) {
    return code.split("\n").map((line) => (line ? [{ value: line }] : []));
  }
  const { tokens } = highlighter.tokenize(code, {
    lang: languages[lang].name,
  });
  return toLines(
    tokens.map((token) => ({
      className: token.className && tokenClassNames[token.className],
      value: token.value,
    }))
  );
}

/** A line's content and colors as one string, to tell lines apart. */
export function lineKey(line: CodeLine): string {
  let key = "";
  for (const token of line) {
    key += `${token.className ?? ""}\u0001${token.value}\u0002`;
  }
  return key;
}

/**
 * Remembers what `render` made of each line, by its content: a line that
 * didn't change keeps what was made of it, so a framework skips it while
 * code streams. A line that comes again (a second `}`) gets its own, so
 * what's made can be DOM nodes, which are in one place at a time.
 */
export function createLineCache<T>(render: (line: CodeLine) => T) {
  let cache = new Map<string, T>();
  return (lines: readonly CodeLine[]): T[] => {
    const next = new Map<string, T>();
    const seen = new Map<string, number>();
    const result = lines.map((line) => {
      const content = lineKey(line);
      const count = seen.get(content) ?? 0;
      seen.set(content, count + 1);
      const key = `${count}\u0003${content}`;
      const made = cache.get(key) ?? render(line);
      next.set(key, made);
      return made;
    });
    cache = next;
    return result;
  };
}

// =============================================================================
// ANSI: terminal output's SGR escape codes, as classes
// =============================================================================

const ESC = "\u001b";
const BEL = "\u0007";
/** Between SGR parameters: `;`, or `:` in `38:2::r:g:b`. */
const SGR_SEPARATOR = /[;:]/;

/** The 16 terminal colors, black to bright white. */
const ansiText = [
  "text-(--th-ansi-black)",
  "text-(--th-ansi-red)",
  "text-(--th-ansi-green)",
  "text-(--th-ansi-yellow)",
  "text-(--th-ansi-blue)",
  "text-(--th-ansi-magenta)",
  "text-(--th-ansi-cyan)",
  "text-(--th-ansi-white)",
  "text-(--th-ansi-bright-black)",
  "text-(--th-ansi-bright-red)",
  "text-(--th-ansi-bright-green)",
  "text-(--th-ansi-bright-yellow)",
  "text-(--th-ansi-bright-blue)",
  "text-(--th-ansi-bright-magenta)",
  "text-(--th-ansi-bright-cyan)",
  "text-(--th-ansi-bright-white)",
];

const ansiBackground = [
  "bg-(--th-ansi-black)",
  "bg-(--th-ansi-red)",
  "bg-(--th-ansi-green)",
  "bg-(--th-ansi-yellow)",
  "bg-(--th-ansi-blue)",
  "bg-(--th-ansi-magenta)",
  "bg-(--th-ansi-cyan)",
  "bg-(--th-ansi-white)",
  "bg-(--th-ansi-bright-black)",
  "bg-(--th-ansi-bright-red)",
  "bg-(--th-ansi-bright-green)",
  "bg-(--th-ansi-bright-yellow)",
  "bg-(--th-ansi-bright-blue)",
  "bg-(--th-ansi-bright-magenta)",
  "bg-(--th-ansi-bright-cyan)",
  "bg-(--th-ansi-bright-white)",
];

/** xterm's 16 colors, to match a 256-color or RGB code to the nearest. */
const xterm = [
  [0, 0, 0],
  [205, 0, 0],
  [0, 205, 0],
  [205, 205, 0],
  [0, 0, 238],
  [205, 0, 205],
  [0, 205, 205],
  [229, 229, 229],
  [127, 127, 127],
  [255, 0, 0],
  [0, 255, 0],
  [255, 255, 0],
  [92, 92, 255],
  [255, 0, 255],
  [0, 255, 255],
  [255, 255, 255],
] as const;

const CUBE = [0, 95, 135, 175, 215, 255] as const;

function nearestColor(red: number, green: number, blue: number) {
  let best = 0;
  let distance = Number.POSITIVE_INFINITY;
  for (const [index, [r, g, b]] of xterm.entries()) {
    const next = (r - red) ** 2 + (g - green) ** 2 + (b - blue) ** 2;
    if (next < distance) {
      best = index;
      distance = next;
    }
  }
  return best;
}

/** A 256-color code (`38;5;n`) as one of the 16. */
function paletteColor(code: number) {
  if (code < 16) {
    return code;
  }
  if (code > 231) {
    const gray = 8 + (code - 232) * 10;
    return nearestColor(gray, gray, gray);
  }
  const cube = code - 16;
  return nearestColor(
    CUBE[Math.floor(cube / 36)] ?? 0,
    CUBE[Math.floor(cube / 6) % 6] ?? 0,
    CUBE[cube % 6] ?? 0
  );
}

interface AnsiStyle {
  background?: number;
  bold?: boolean;
  dim?: boolean;
  foreground?: number;
  inverse?: boolean;
  italic?: boolean;
  strike?: boolean;
  underline?: boolean;
}

/** An extended color (`38;5;n` or `38;2;r;g;b`) and the codes it used. */
function extendedColor(codes: readonly number[], at: number) {
  if (codes[at + 1] === 5) {
    return { color: paletteColor(codes[at + 2] ?? 0), used: 2 };
  }
  if (codes[at + 1] === 2) {
    const [r = 0, g = 0, b = 0] = codes.slice(at + 2, at + 5);
    return { color: nearestColor(r, g, b), used: 4 };
  }
  return { color: undefined, used: 0 };
}

/** The style after one SGR code (`1`, `31`, `22`…), or null for a reset. */
function applyCode(style: AnsiStyle, code: number): AnsiStyle | null {
  if (code >= 30 && code <= 37) {
    return { ...style, foreground: code - 30 };
  }
  if (code >= 90 && code <= 97) {
    return { ...style, foreground: code - 82 };
  }
  if (code >= 40 && code <= 47) {
    return { ...style, background: code - 40 };
  }
  if (code >= 100 && code <= 107) {
    return { ...style, background: code - 92 };
  }
  switch (code) {
    case 0:
      return null;
    case 1:
      return { ...style, bold: true };
    case 2:
      return { ...style, dim: true };
    case 3:
      return { ...style, italic: true };
    case 4:
      return { ...style, underline: true };
    case 7:
      return { ...style, inverse: true };
    case 9:
      return { ...style, strike: true };
    case 22:
      return { ...style, bold: false, dim: false };
    case 23:
      return { ...style, italic: false };
    case 24:
      return { ...style, underline: false };
    case 27:
      return { ...style, inverse: false };
    case 29:
      return { ...style, strike: false };
    case 39:
      return { ...style, foreground: undefined };
    case 49:
      return { ...style, background: undefined };
    default:
      return style;
  }
}

/** The style after an SGR sequence's parameters (`1;31`). */
function applySgr(style: AnsiStyle, params: string): AnsiStyle {
  const codes = params.split(SGR_SEPARATOR).map((code) => Number(code) || 0);
  let next = style;
  for (let at = 0; at < codes.length; at += 1) {
    const code = codes[at] ?? 0;
    if (code === 38 || code === 48) {
      const { color, used } = extendedColor(codes, at);
      next =
        code === 38
          ? { ...next, foreground: color }
          : { ...next, background: color };
      at += used;
    } else {
      next = applyCode(next, code) ?? {};
    }
  }
  return next;
}

/** A style's classes. */
function ansiClassName(style: AnsiStyle) {
  const { background, foreground, inverse } = style;
  const text = inverse ? background : foreground;
  const fill = inverse ? foreground : background;
  const classes = [
    text === undefined ? inverse && "text-background" : ansiText[text],
    fill === undefined ? inverse && "bg-foreground" : ansiBackground[fill],
    style.bold && "font-bold",
    style.dim && "opacity-60",
    style.italic && "italic",
    style.underline && "underline",
    style.strike && "line-through",
  ].filter(Boolean);
  return classes.length > 0 ? classes.join(" ") : undefined;
}

/** Whether the character at `at` is in a byte range (`0x30`–`0x3f`). */
const inRange = (text: string, at: number, from: number, to: number) => {
  const code = text.charCodeAt(at);
  return code >= from && code <= to;
};

/** Where an escape sequence that starts at `at` ends, and its SGR params. */
function readEscape(line: string, at: number) {
  const kind = line[at + 1];
  if (kind === "[") {
    // CSI: parameter bytes, intermediate bytes, one final byte.
    let end = at + 2;
    while (inRange(line, end, 0x30, 0x3f)) {
      end += 1;
    }
    const params = line.slice(at + 2, end);
    while (inRange(line, end, 0x20, 0x2f)) {
      end += 1;
    }
    const final = line[end];
    return {
      end: end + 1,
      params: final === "m" ? params : undefined,
    };
  }
  if (kind === "]") {
    // OSC (a hyperlink, a title): up to BEL or ESC \.
    const bell = line.indexOf(BEL, at + 2);
    const terminator = line.indexOf(`${ESC}\\`, at + 2);
    if (bell !== -1 && (terminator === -1 || bell < terminator)) {
      return { end: bell + 1 };
    }
    return { end: terminator === -1 ? line.length : terminator + 2 };
  }
  return { end: Math.min(at + 2, line.length) };
}

function tokenizeAnsiLine(line: string): CodeLine {
  const tokens: CodeLine = [];
  let style: AnsiStyle = {};
  const push = (value: string) => {
    if (!value) {
      return;
    }
    const className = ansiClassName(style);
    const last = tokens.at(-1);
    if (last && last.className === className) {
      last.value += value;
    } else {
      tokens.push(className ? { className, value } : { value });
    }
  };
  let at = 0;
  while (at < line.length) {
    const start = line.indexOf(ESC, at);
    if (start === -1) {
      push(line.slice(at));
      break;
    }
    push(line.slice(at, start));
    const { end, params } = readEscape(line, start);
    if (params !== undefined) {
      style = applySgr(style, params);
    }
    at = end;
  }
  return tokens;
}

/**
 * Terminal output's lines, colored by its SGR codes: the 16 colors (and
 * 256-color and RGB codes, as the nearest of them), bold, dim, italic,
 * underline, strikethrough and inverse. Other escape codes are dropped.
 * Colors don't carry from one line to the next, so a line looks the same
 * whether it arrives whole or streams.
 */
export function tokenizeAnsi(code: string): CodeLine[] {
  return code.split("\n").map(tokenizeAnsiLine);
}

/** Text without its escape codes, such as for a copy button. */
export function stripAnsi(text: string): string {
  let result = "";
  let at = 0;
  while (at < text.length) {
    const start = text.indexOf(ESC, at);
    if (start === -1) {
      return result + text.slice(at);
    }
    result += text.slice(at, start);
    at = readEscape(text, start).end;
  }
  return result;
}
