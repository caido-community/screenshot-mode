import { syntaxHighlighting } from "@codemirror/language";
import {
  Compartment,
  type Extension,
  Prec,
  StateEffect,
} from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { type Tag, tagHighlighter, tags } from "@lezer/highlight";

import { isPresent } from "./optional";

import { type ScreenshotSettings, Theme } from "@/types";

/** The parts of the settings that decide how an editor is painted. */
type EditorThemeSettings = Pick<
  ScreenshotSettings,
  "theme" | "syntaxHighlighting"
>;

// Neutral, high contrast palette. Kept close to a printed page: white
// background, near black text, and grays that stay legible without color.
const LIGHT = {
  bg: "#ffffff",
  bgSubtle: "#f6f8fa",
  bgInset: "#eef1f4",
  fg: "#1f2328",
  fgMuted: "#57606a",
  border: "#d0d7de",
  accent: "#9a6700",
} as const;

// Light counterparts of the syntax colors Caido hardcodes in its editor theme.
// Caido paints most of a body (name/literal/propertyName) in a single color, so
// mid-tone shades that pass on their own leave the page looking washed out at
// volume. Every color here clears 7:1 against white — WCAG AAA — which keeps
// tokens readable next to 15.8:1 body text and survives being printed.
// The seven roles stay distinct from each other so the light theme reads like
// Caido's, not like a different language.
const LIGHT_SYNTAX = {
  bracket: "#3f464e",
  comment: "#3f6212",
  keyword: "#7c2d12",
  name: "#14532d",
  number: "#0f4c44",
  null: "#4c1d95",
  tag: "#0b3d91",
  meta: "#4a5058",
  amber: "#78350f",
  rose: "#9f1239",
} as const;

/**
 * CSS custom properties applied to the captured element.
 *
 * Caido themes both its own UI and the editors through these variables, and
 * custom properties inherit into the editors (which live in a shadow root), so
 * redefining them on the captured element is enough to relight everything
 * inside it without touching the rest of the app.
 *
 * `--p-*` are the PrimeVue tokens the plugin's Tailwind classes compile to,
 * `--c-*` are Caido's own tokens. The surface ramp is inverted on purpose: the
 * codebase uses low indexes for text and high indexes for backgrounds.
 */
export const LIGHT_THEME_VARS: Record<string, string> = {
  "--p-surface-0": "#0f1115",
  "--p-surface-50": "#14171c",
  "--p-surface-100": LIGHT.fg,
  "--p-surface-200": "#2b3138",
  "--p-surface-300": "#3d444d",
  "--p-surface-400": LIGHT.fgMuted,
  "--p-surface-500": "#8c959f",
  "--p-surface-600": LIGHT.border,
  "--p-surface-700": LIGHT.bgInset,
  "--p-surface-800": LIGHT.bgSubtle,
  "--p-surface-900": LIGHT.bg,
  "--p-surface-950": LIGHT.bg,

  // Caido's surface ramp is consumed as `hsl(var(--c-surface-N))`, so these
  // are bare HSL components rather than colors.
  "--c-surface-0": "220deg 17% 7%",
  "--c-surface-200": "213deg 13% 20%",
  "--c-surface-300": "213deg 12% 27%",
  "--c-surface-400": "212deg 9% 38%",
  "--c-surface-500": "212deg 9% 59%",
  "--c-surface-600": "210deg 18% 84%",
  "--c-surface-700": "210deg 21% 94%",
  "--c-surface-800": "210deg 29% 97%",
  "--c-surface-900": "0deg 0% 100%",

  "--c-bg-default": LIGHT.bg,
  "--c-bg-subtle": LIGHT.bgSubtle,
  "--c-bg-inset": LIGHT.bgInset,
  "--c-fg-default": LIGHT.fg,
  "--c-fg-subtle": LIGHT.fgMuted,
  "--c-fg-secondary": LIGHT.accent,
  "--c-border-default": LIGHT.border,
  "--c-border-secondary": LIGHT.accent,

  "background-color": LIGHT.bg,
  color: LIGHT.fg,
};

type SyntaxRole = keyof typeof LIGHT_SYNTAX;

/**
 * Every tag Caido colors, mapped to a role.
 *
 * Rather than defining a competing `HighlightStyle`, we attach our own classes
 * and style those. A `HighlightStyle` generates single-class rules, which tie
 * with Caido's on specificity and can only be won on mount order — and the body
 * languages load lazily, so that order is not ours to control.
 */
const SYNTAX_ROLES: ReadonlyArray<readonly [Tag, SyntaxRole]> = [
  [tags.angleBracket, "bracket"],
  [tags.attributeValue, "keyword"],
  [tags.blockComment, "comment"],
  [tags.className, "tag"],
  [tags.keyword, "keyword"],
  [tags.labelName, "tag"],
  [tags.literal, "name"],
  [tags.name, "name"],
  [tags.null, "null"],
  [tags.number, "number"],
  [tags.propertyName, "name"],
  [tags.tagName, "tag"],
  [tags.variableName, "keyword"],
  [tags.documentMeta, "meta"],
  [tags.separator, "meta"],
  // Used by the body languages (JSON, form data) through their scoped styles.
  [tags.string, "name"],
  [tags.bool, "keyword"],
  [tags.comment, "comment"],
  [tags.attributeName, "rose"],
  [tags.heading, "name"],
];

const tokenClass = (role: SyntaxRole): string => `sm-tok-${role}`;

const tokenHighlighter = tagHighlighter(
  SYNTAX_ROLES.map(([tag, role]) => ({ tag, class: tokenClass(role) })),
);

const SYNTAX_ROLE_NAMES = [...new Set(SYNTAX_ROLES.map(([, role]) => role))];

// Doubling a class doubles its weight — `.theme .sm-tok-name.sm-tok-name` is
// three classes against Caido's one, so these win on specificity and never have
// to care which style sheet was mounted last.
const lightTokenTheme = EditorView.theme(
  Object.fromEntries(
    SYNTAX_ROLE_NAMES.map((role) => [
      `& .${tokenClass(role)}.${tokenClass(role)}`,
      { color: LIGHT_SYNTAX[role] },
    ]),
  ),
);

/**
 * The HTTP languages don't color themselves through tags at all — they attach
 * `c-lang-*` classes and Caido paints those from a separate editor theme. That
 * is what colors the method, version, header names and cookies, so a light
 * theme has to override these too, and turning syntax colors off has to
 * neutralize them or only the body reverts to plain text.
 *
 * Caido paints cookie values `#ffffff`, which is invisible on a light page.
 */
const LANGUAGE_COLORS: ReadonlyArray<{
  readonly cls: string;
  readonly light: string;
  /**
   * Header names carry the structure of a message, so with colors off they are
   * bolded instead — still scannable, without reintroducing a hue.
   */
  readonly boldWhenPlain?: boolean;
}> = [
  { cls: "c-lang-http-request__method", light: LIGHT_SYNTAX.null },
  { cls: "c-lang-http-request__version", light: LIGHT_SYNTAX.number },
  {
    cls: "c-lang-http-request__headerName",
    light: LIGHT_SYNTAX.amber,
    boldWhenPlain: true,
  },
  { cls: "c-lang-http-response__statusCode", light: LIGHT_SYNTAX.name },
  { cls: "c-lang-http-response__statusText", light: LIGHT_SYNTAX.null },
  { cls: "c-lang-http-response__version", light: LIGHT_SYNTAX.number },
  {
    cls: "c-lang-http-response__headerName",
    light: LIGHT_SYNTAX.amber,
    boldWhenPlain: true,
  },
  { cls: "c-lang-http-request-cookie__cookieName", light: LIGHT_SYNTAX.rose },
  { cls: "c-lang-http-request-cookie__cookieValue", light: LIGHT.fg },
  { cls: "c-lang-http-response-cookie__cookieName", light: LIGHT_SYNTAX.rose },
  { cls: "c-lang-http-response-cookie__cookieValue", light: LIGHT.fg },
];

const lightLanguageTheme = EditorView.theme(
  Object.fromEntries(
    LANGUAGE_COLORS.map(({ cls, light }) => [
      `& .${cls}.${cls}`,
      { color: light },
    ]),
  ),
);

/**
 * Flattens the editor to plain foreground-on-background.
 *
 * `inherit` hands each token back to the surrounding text color, which is what
 * lets one style serve both themes: white on dark, near-black on light. The
 * catch-all carries two classes and a type selector, so it outweighs both
 * Caido's generated highlight rules and its language rules without depending on
 * mount order, and covers any token this file never enumerated.
 */
const plainTheme = EditorView.theme(
  Object.fromEntries([
    [".cm-line span", { color: "inherit" }],
    ...LANGUAGE_COLORS.map(({ cls, boldWhenPlain }) => {
      const spec: Record<string, string> = { color: "inherit" };
      if (boldWhenPlain === true) {
        spec.fontWeight = "600";
      }
      return [`& .${cls}.${cls}`, spec];
    }),
  ]),
);

// Mirrors the selectors Caido uses for the colors it hardcodes, so the rules
// match on specificity and win on order.
const lightEditorTheme = EditorView.theme({
  "&": {
    backgroundColor: LIGHT.bg,
    color: LIGHT.fg,
  },
  ".cm-gutters": {
    color: LIGHT.fgMuted,
  },
  ".cm-lineNumbers .cm-gutterElement": {
    color: "rgba(0, 0, 0, 0.45)",
  },
  ".cm-cursorLayer .cm-cursor-primary": {
    borderLeftColor: LIGHT.fg,
  },
  ".cm-scroller > .cm-selectionLayer > .cm-selectionBackground": {
    background: "rgba(0, 0, 0, 0.1)",
  },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer > .cm-selectionBackground":
    {
      background: "rgba(0, 0, 0, 0.16)",
    },
  "&[data-caido-has-selection='false'] .cm-activeLine": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  "&[data-caido-has-selection='false'] .cm-activeLineGutter": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  ".cm-foldPlaceholder": {
    border: `1px solid ${LIGHT.border}`,
  },
});

function extensionsFor(settings: EditorThemeSettings): Extension {
  const extensions: Extension[] = [];

  // Chrome only — background, gutter, selection. Never token colors, so it
  // can't fight the language rules below.
  if (settings.theme === Theme.Light) {
    extensions.push(lightEditorTheme);
  }

  if (!settings.syntaxHighlighting) {
    extensions.push(plainTheme);
  } else if (settings.theme === Theme.Light) {
    // The highlighter only attaches our classes; lightTokenTheme colors them.
    extensions.push(
      lightLanguageTheme,
      syntaxHighlighting(tokenHighlighter),
      lightTokenTheme,
    );
  }

  // Dark with syntax colors on is Caido's own configuration, untouched.
  return extensions;
}

const themeCompartments = new WeakMap<EditorView, Compartment>();

/**
 * Repaints an editor to match the screenshot settings.
 *
 * CodeMirror mounts style modules in facet precedence order, last one winning,
 * so the overrides are appended with the highest precedence to land after
 * Caido's rules. A compartment keeps every combination reversible.
 */
export function applyEditorTheme(
  view: EditorView,
  settings: EditorThemeSettings,
): void {
  let compartment = themeCompartments.get(view);

  if (!isPresent(compartment)) {
    compartment = new Compartment();
    themeCompartments.set(view, compartment);
    view.dispatch({
      effects: StateEffect.appendConfig.of(Prec.highest(compartment.of([]))),
    });
  }

  view.dispatch({
    effects: compartment.reconfigure(extensionsFor(settings)),
  });
}
