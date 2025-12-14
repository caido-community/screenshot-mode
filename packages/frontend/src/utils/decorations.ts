import { StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  WidgetType,
} from "@codemirror/view";

import {
  HighlightMode,
  type HighlightRule,
  RedactionMode,
  type RedactionRule,
} from "@/types";

const setDecorations = StateEffect.define<DecorationSet>();

const decorationsField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setDecorations) === true) {
        return effect.value;
      }
    }
    return decorations.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

function createHighlightDecoration(
  color: string,
  mode: HighlightMode,
): Decoration {
  if (mode === HighlightMode.Rectangle) {
    return Decoration.mark({
      class: "screenshot-highlight-rectangle",
      attributes: {
        style: `outline: 2px solid ${color}; outline-offset: 1px;`,
      },
    });
  }

  return Decoration.mark({
    class: "screenshot-highlight",
    attributes: {
      style: `background-color: ${color}40; border-bottom: 2px solid ${color};`,
    },
  });
}

type RedactionInput =
  | { mode: typeof RedactionMode.Opaque; color: string }
  | { mode: typeof RedactionMode.Blur }
  | { mode: typeof RedactionMode.Replace };

function createRedactionDecoration(input: RedactionInput): Decoration {
  if (input.mode === RedactionMode.Blur) {
    return Decoration.mark({
      class: "screenshot-redaction-blur",
      attributes: {
        style: "filter: blur(4px); user-select: none;",
      },
    });
  }

  if (input.mode === RedactionMode.Opaque) {
    return Decoration.mark({
      class: "screenshot-redaction-opaque",
      attributes: {
        style: `background-color: ${input.color}; color: ${input.color};`,
      },
    });
  }

  return Decoration.replace({
    widget: new RedactedWidget(),
  });
}

class RedactedWidget extends WidgetType {
  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.textContent = "[REDACTED]";
    span.className = "screenshot-redaction-replace";
    span.style.cssText =
      "background-color: #000; color: #fff; padding: 0 4px; font-family: monospace;";
    return span;
  }
}

type MatchResult = {
  from: number;
  to: number;
  groups: Array<{ from: number; to: number; index: number }>;
};

function findMatches(text: string, pattern: string): MatchResult[] {
  const matches: MatchResult[] = [];

  if (pattern.length === 0) {
    return matches;
  }

  try {
    const regex = new RegExp(pattern, "g");
    let match: RegExpExecArray | undefined = regex.exec(text) ?? undefined;

    while (match !== undefined) {
      if (match[0].length > 0) {
        const groups: Array<{ from: number; to: number; index: number }> = [];

        let currentPos = match.index;
        for (let i = 1; i < match.length; i++) {
          const groupText = match[i];
          if (groupText !== undefined) {
            const groupStart = text.indexOf(groupText, currentPos);
            if (groupStart !== -1) {
              groups.push({
                from: groupStart,
                to: groupStart + groupText.length,
                index: i,
              });
              currentPos = groupStart;
            }
          }
        }

        matches.push({
          from: match.index,
          to: match.index + match[0].length,
          groups,
        });
      }

      if (regex.lastIndex === match.index) {
        regex.lastIndex++;
      }

      match = regex.exec(text) ?? undefined;
    }
  } catch {
    return matches;
  }

  return matches;
}

function rangesOverlap(
  a: { from: number; to: number },
  b: { from: number; to: number },
): boolean {
  return a.from < b.to && b.from < a.to;
}

function isRangeRedacted(
  range: { from: number; to: number },
  redactedRanges: Array<{ from: number; to: number }>,
): boolean {
  return redactedRanges.some((redacted) => rangesOverlap(range, redacted));
}

function getRedactionRanges(
  match: MatchResult,
  useCaptureGroups: boolean,
  selectedGroups: number[],
): Array<{ from: number; to: number }> {
  if (useCaptureGroups === false || match.groups.length === 0) {
    return [{ from: match.from, to: match.to }];
  }

  const ranges: Array<{ from: number; to: number }> = [];
  for (const group of match.groups) {
    if (selectedGroups.includes(group.index)) {
      ranges.push({ from: group.from, to: group.to });
    }
  }

  return ranges;
}

export function applyDecorations(
  view: EditorView,
  highlights: HighlightRule[],
  redactions: RedactionRule[],
): void {
  const hasField = view.state.field(decorationsField, false) !== undefined;
  if (!hasField) {
    view.dispatch({
      effects: StateEffect.appendConfig.of(decorationsField),
    });
  }

  const text = view.state.doc.toString();
  const decorations: Array<{
    from: number;
    to: number;
    decoration: Decoration;
  }> = [];

  const redactedRanges: Array<{ from: number; to: number }> = [];
  for (const rule of redactions) {
    const matches = findMatches(text, rule.regex);
    for (const match of matches) {
      const ranges = getRedactionRanges(
        match,
        rule.useCaptureGroups,
        rule.selectedGroups,
      );
      redactedRanges.push(...ranges);
    }
  }

  for (const rule of highlights) {
    const matches = findMatches(text, rule.regex);
    const decoration = createHighlightDecoration(rule.color, rule.mode);

    for (const match of matches) {
      if (
        !isRangeRedacted({ from: match.from, to: match.to }, redactedRanges)
      ) {
        decorations.push({
          from: match.from,
          to: match.to,
          decoration,
        });
      }
    }
  }

  for (const rule of redactions) {
    const matches = findMatches(text, rule.regex);
    const decoration = createRedactionDecoration(rule);

    for (const match of matches) {
      const ranges = getRedactionRanges(
        match,
        rule.useCaptureGroups,
        rule.selectedGroups,
      );
      for (const range of ranges) {
        decorations.push({
          from: range.from,
          to: range.to,
          decoration,
        });
      }
    }
  }

  decorations.sort((a, b) => a.from - b.from || a.to - b.to);

  const decorationSet = Decoration.set(
    decorations.map((d) => d.decoration.range(d.from, d.to)),
  );

  view.dispatch({
    effects: setDecorations.of(decorationSet),
  });
}
