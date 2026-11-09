"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import React from "react";
import { cn } from "@ui/lib/utils";
import { Button } from "@ui/shad-cn/components/button";
import { useHighlightedCode } from "@ui/shad-cn/hooks/use-highlighted-code";

interface CodeEditorContextValue {
  /** The language the code is highlighted in. */
  language: string;
  /** Replaces the code, as typing does. */
  setValue: (value: string) => void;
  /** The code. */
  value: string;
}

const CodeEditorContext = React.createContext<CodeEditorContextValue>({
  language: "plaintext",
  setValue: () => undefined,
  value: "",
});

/** One change to the text: `text` replaces `start`…`end`, then the selection is set. */
interface CodeEdit {
  end: number;
  selectionEnd: number;
  selectionStart: number;
  start: number;
  text: string;
}

const LEADING_SPACE = /^[ \t]*/;
const OPENERS: Record<string, string> = { "(": ")", "[": "]", "{": "}" };

/** Where the line holding `at` starts. */
const lineStartOf = (code: string, at: number) =>
  code.lastIndexOf("\n", at - 1) + 1;

/** Where the line holding `at` ends (its newline, or the end of the code). */
const lineEndOf = (code: string, at: number) => {
  const end = code.indexOf("\n", at);
  return end === -1 ? code.length : end;
};

/** A line without one step of indentation: a tab, or up to `size` spaces. */
const outdented = (line: string, size: number) => {
  if (line.startsWith("\t")) {
    return line.slice(1);
  }
  const spaces = LEADING_SPACE.exec(line)?.[0].replace(/\t/g, "") ?? "";
  return line.slice(Math.min(size, spaces.length));
};

/**
 * Tab and Shift+Tab. A caret with nothing selected gets spaces to the next
 * stop; a selection indents (or outdents) every line it touches, empty
 * lines left as they are.
 */
const indentEdit = (
  code: string,
  from: number,
  to: number,
  size: number,
  outdent: boolean
): CodeEdit => {
  const start = lineStartOf(code, from);
  if (from === to && !outdent) {
    const text = " ".repeat(size - ((from - start) % size));
    const caret = from + text.length;
    return {
      end: to,
      selectionEnd: caret,
      selectionStart: caret,
      start: from,
      text,
    };
  }
  // A selection that ends at the start of a line leaves that line alone.
  const last = to > from && code[to - 1] === "\n" ? to - 1 : to;
  const end = lineEndOf(code, last);
  const lines = code.slice(start, end).split("\n");
  const changed = lines.map((line) => {
    if (outdent) {
      return outdented(line, size);
    }
    return line ? `${" ".repeat(size)}${line}` : line;
  });
  const text = changed.join("\n");
  const first = (changed[0] ?? "").length - (lines[0] ?? "").length;
  return {
    end,
    selectionEnd: Math.max(start, to + text.length - (end - start)),
    selectionStart: from === start ? start : Math.max(start, from + first),
    start,
    text,
  };
};

/**
 * Enter: a new line at the same indentation, one step deeper after an
 * opening bracket; between a pair of brackets, the closing one moves to a
 * line of its own.
 */
const newlineEdit = (
  code: string,
  from: number,
  to: number,
  size: number
): CodeEdit => {
  const start = lineStartOf(code, from);
  const indent = LEADING_SPACE.exec(code.slice(start, from))?.[0] ?? "";
  const closer = OPENERS[code[from - 1] ?? ""];
  if (!closer) {
    const text = `\n${indent}`;
    const caret = from + text.length;
    return {
      end: to,
      selectionEnd: caret,
      selectionStart: caret,
      start: from,
      text,
    };
  }
  const inner = `\n${indent}${" ".repeat(size)}`;
  const text = code[to] === closer ? `${inner}\n${indent}` : inner;
  const caret = from + inner.length;
  return {
    end: to,
    selectionEnd: caret,
    selectionStart: caret,
    start: from,
    text,
  };
};

/**
 * Applies an edit as typing would: through the browser's own insert, so
 * undo and redo keep working and an `input` event reports the new code.
 */
const applyEdit = (textarea: HTMLTextAreaElement, edit: CodeEdit) => {
  textarea.setSelectionRange(edit.start, edit.end);
  const command = edit.text ? "insertText" : "delete";
  if (!textarea.ownerDocument.execCommand(command, false, edit.text)) {
    textarea.setRangeText(edit.text, edit.start, edit.end, "end");
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }
  textarea.setSelectionRange(edit.selectionStart, edit.selectionEnd);
};

/** How many digits the last line's number has: the gutter's width. */
const digitsOf = (code: string) => String(code.split("\n").length).length;

export interface CodeEditorProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> {
  /** The code when it starts, uncontrolled. */
  defaultValue?: string;
  /**
   * The language to highlight: `tsx`, `typescript`, `javascript`, `jsx`,
   * `html`, `css`, `json`, `markdown`, `python`, `bash`, `sql`, `yaml`,
   * `diff`, or an alias (`ts`, `js`, `md`, `py`, `sh`). Anything else is
   * plain text.
   *
   * @default "plaintext"
   */
  language?: string;
  /** Called with the new code after each change. */
  onValueChange?: (value: string) => void;
  /** The code, controlled. */
  value?: string;
}

export const CodeEditor = (props: CodeEditorProps) => {
  const {
    className,
    defaultValue = "",
    language = "plaintext",
    onValueChange,
    value,
    ...rest
  } = props;

  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const code = value ?? uncontrolled;

  const setValue = React.useCallback(
    (next: string) => {
      if (value === undefined) {
        setUncontrolled(next);
      }
      onValueChange?.(next);
    },
    [onValueChange, value]
  );

  const context = React.useMemo(
    () => ({ language, setValue, value: code }),
    [code, language, setValue]
  );

  return (
    <CodeEditorContext.Provider value={context}>
      <div
        className={cn(
          "group/code-editor relative flex min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs",
          "transition-[border-color,box-shadow] motion-reduce:transition-none",
          "has-[textarea:focus-visible]:border-ring has-[textarea:focus-visible]:ring-[3px] has-[textarea:focus-visible]:ring-ring/50",
          className
        )}
        data-language={language}
        data-slot="code-editor"
        {...rest}
      />
    </CodeEditorContext.Provider>
  );
};

export const CodeEditorHeader = (props: React.ComponentProps<"div">) => {
  const { className, ...rest } = props;

  return (
    <div
      className={cn(
        "flex h-10 min-w-0 shrink-0 items-center gap-3 border-b bg-muted/50 px-3",
        className
      )}
      data-slot="code-editor-header"
      {...rest}
    />
  );
};

/** A window's three dots, in neutral tones. Decorative. */
export const CodeEditorDots = (props: React.ComponentProps<"div">) => {
  const { className, ...rest } = props;

  return (
    <div
      aria-hidden="true"
      className={cn("flex shrink-0 items-center gap-1.5", className)}
      data-slot="code-editor-dots"
      {...rest}
    >
      <span className="size-2.5 rounded-full bg-muted-foreground/25" />
      <span className="size-2.5 rounded-full bg-muted-foreground/25" />
      <span className="size-2.5 rounded-full bg-muted-foreground/25" />
    </div>
  );
};

export const CodeEditorTitle = (props: React.ComponentProps<"div">) => {
  const { className, ...rest } = props;

  return (
    <div
      className={cn(
        "min-w-0 flex-1 truncate text-[13px] text-muted-foreground",
        "[&_svg]:pointer-events-none [&_svg]:me-1.5 [&_svg]:inline-block [&_svg]:size-3.5 [&_svg]:align-[-2px]",
        className
      )}
      data-slot="code-editor-title"
      {...rest}
    />
  );
};

/** Copies the editor's code. */
export const CodeEditorCopyButton = (
  props: React.ComponentProps<typeof Button>
) => {
  const {
    className,
    onClick,
    size = "icon-xs",
    variant = "ghost",
    ...rest
  } = props;
  const { value } = React.useContext(CodeEditorContext);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <>
      <Button
        aria-label={copied ? "Copied" : "Copy code"}
        className={cn("shrink-0", className)}
        data-copied={copied || undefined}
        data-slot="code-editor-copy-button"
        onClick={(event) => {
          onClick?.(event);
          navigator.clipboard
            .writeText(value)
            .then(() => setCopied(true))
            .catch(() => undefined);
        }}
        size={size}
        variant={variant}
        {...rest}
      >
        {copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
      </Button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </>
  );
};

/** The editor's type: the text box and the colored layer under it share every metric. */
const TYPE =
  "m-0 py-3 pe-4 ps-[calc(var(--code-editor-gutter,0px)+1rem)] font-mono text-[13px] leading-5 [font-variant-ligatures:none] [tab-size:var(--code-editor-tab-size,2)] in-data-wrap:wrap-break-word in-data-wrap:whitespace-pre-wrap whitespace-pre";

export interface CodeEditorContentProps extends React.ComponentProps<"div"> {
  /** Focus the text box on mount. */
  autoFocus?: boolean;
  /**
   * The text box's accessible name, such as the file's name.
   *
   * @default "Code"
   */
  label?: string;
  /** Number each line in a gutter. The numbers aren't part of the code. */
  lineNumbers?: boolean;
  /** Shown while the code is empty. */
  placeholder?: string;
  /** The code can be selected and copied, not changed. */
  readOnly?: boolean;
  /**
   * Spaces per indentation step: what Tab inserts and how wide a tab
   * character is.
   *
   * @default 2
   */
  tabSize?: number;
  /** Wrap long lines instead of scrolling sideways. */
  wrap?: boolean;
}

export const CodeEditorContent = (props: CodeEditorContentProps) => {
  const {
    autoFocus,
    className,
    label = "Code",
    lineNumbers = false,
    placeholder,
    readOnly = false,
    tabSize = 2,
    wrap = false,
    ...rest
  } = props;
  const { language, setValue, value } = React.useContext(CodeEditorContext);
  const hintId = React.useId();
  // Escape, then Tab, leaves the editor: Tab alone indents.
  const released = React.useRef(false);
  const composing = React.useRef(false);

  // The extra newline keeps a trailing empty line, where the caret can be.
  const lines = useHighlightedCode(`${value}\n`, language);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    if (event.key === "Escape") {
      released.current = true;
      return;
    }
    const leaving = released.current;
    released.current = false;
    if (readOnly || composing.current || event.altKey || event.metaKey) {
      return;
    }
    if (event.key === "Tab" && !leaving && !event.ctrlKey) {
      event.preventDefault();
      applyEdit(
        textarea,
        indentEdit(
          textarea.value,
          textarea.selectionStart,
          textarea.selectionEnd,
          tabSize,
          event.shiftKey
        )
      );
    } else if (event.key === "Enter" && !event.ctrlKey && !event.shiftKey) {
      event.preventDefault();
      applyEdit(
        textarea,
        newlineEdit(
          textarea.value,
          textarea.selectionStart,
          textarea.selectionEnd,
          tabSize
        )
      );
    }
  };

  return (
    <div
      className={cn(
        "relative min-h-0 flex-1 overflow-auto overscroll-contain",
        className
      )}
      data-numbered={lineNumbers || undefined}
      data-slot="code-editor-content"
      data-wrap={wrap || undefined}
      dir="ltr"
      {...rest}
    >
      <div
        className={cn(
          "grid min-h-full in-data-wrap:w-full w-max min-w-full",
          "in-data-numbered:[--code-editor-gutter:calc(var(--code-editor-digits)*1ch+1rem)]"
        )}
        style={
          {
            "--code-editor-digits": String(digitsOf(value)),
            "--code-editor-tab-size": String(tabSize),
          } as React.CSSProperties
        }
      >
        <pre
          aria-hidden="true"
          className={cn(
            TYPE,
            "pointer-events-none col-start-1 row-start-1 select-none text-foreground [counter-reset:line]"
          )}
          data-slot="code-editor-code"
        >
          {lines.map((line, index) => (
            <span
              className="relative block min-h-lh in-data-numbered:[counter-increment:line] in-data-numbered:before:absolute in-data-numbered:before:end-[calc(100%+1rem)] in-data-numbered:before:text-muted-foreground/60 in-data-numbered:before:content-[counter(line)]"
              data-slot="code-editor-line"
              // biome-ignore lint/suspicious/noArrayIndexKey: a line is its place in the code.
              key={index}
            >
              {line}
            </span>
          ))}
        </pre>
        <textarea
          aria-describedby={readOnly ? undefined : hintId}
          aria-label={label}
          autoCapitalize="off"
          autoComplete="off"
          autoFocus={autoFocus}
          className={cn(
            TYPE,
            "col-start-1 row-start-1 size-full min-w-0 resize-none overflow-hidden bg-transparent text-transparent caret-foreground outline-none",
            "selection:bg-primary/20 selection:text-transparent placeholder:text-muted-foreground"
          )}
          data-slot="code-editor-textarea"
          onChange={(event) => setValue(event.currentTarget.value)}
          onCompositionEnd={() => {
            composing.current = false;
          }}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onFocus={() => {
            released.current = false;
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          readOnly={readOnly}
          rows={1}
          spellCheck={false}
          value={value}
          wrap={wrap ? "soft" : "off"}
        />
        <span className="sr-only" id={hintId}>
          Tab indents. Press Escape, then Tab, to move focus out of the editor.
        </span>
      </div>
    </div>
  );
};
