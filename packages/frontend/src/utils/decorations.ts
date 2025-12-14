import { StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  WidgetType,
} from "@codemirror/view";

import type { HighlightRule, RedactionRule } from "@/types";

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

function createHighlightDecoration(color: string, mode: string): Decoration {
  if (mode === "rectangle") {
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

function createRedactionDecoration(mode: string): Decoration {
  if (mode === "blur") {
    return Decoration.mark({
      class: "screenshot-redaction-blur",
      attributes: {
        style: "filter: blur(4px); user-select: none;",
      },
    });
  }

  if (mode === "black") {
    return Decoration.mark({
      class: "screenshot-redaction-black",
      attributes: {
        style: "background-color: #000; color: #000;",
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

function findMatches(
  text: string,
  pattern: string,
): Array<{ from: number; to: number }> {
  const matches: Array<{ from: number; to: number }> = [];

  if (pattern.length === 0) {
    return matches;
  }

  try {
    const regex = new RegExp(pattern, "g");
    let match: RegExpExecArray | undefined = regex.exec(text) ?? undefined;

    while (match !== undefined) {
      if (match[0].length > 0) {
        matches.push({
          from: match.index,
          to: match.index + match[0].length,
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

  for (const rule of highlights) {
    const matches = findMatches(text, rule.regex);
    const decoration = createHighlightDecoration(rule.color, rule.mode);

    for (const match of matches) {
      decorations.push({
        from: match.from,
        to: match.to,
        decoration,
      });
    }
  }

  for (const rule of redactions) {
    const matches = findMatches(text, rule.regex);
    const decoration = createRedactionDecoration(rule.mode);

    for (const match of matches) {
      decorations.push({
        from: match.from,
        to: match.to,
        decoration,
      });
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
