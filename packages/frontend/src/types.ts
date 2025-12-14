import { type Caido } from "@caido/sdk-frontend";

export type FrontendSDK = Caido<Record<string, never>, Record<string, never>>;

export type HighlightMode = "highlight" | "rectangle";

export type RedactionMode = "blur" | "black" | "replace";

export type RuleTarget = "request" | "response";

export type Disposition = "horizontal" | "vertical";

export type HighlightRule = {
  id: string;
  regex: string;
  target: RuleTarget;
  color: string;
  mode: HighlightMode;
};

export type RedactionRule = {
  id: string;
  regex: string;
  target: RuleTarget;
  mode: RedactionMode;
};

export type ScreenshotSettings = {
  headersToHide: string[];
  disposition: Disposition;
  highlights: HighlightRule[];
  redactions: RedactionRule[];
};

export type StoredSettings = {
  headersToHide: string[];
  disposition: Disposition;
  highlights: HighlightRule[];
  redactions: RedactionRule[];
};

export const DEFAULT_SETTINGS: ScreenshotSettings = {
  headersToHide: [],
  disposition: "horizontal",
  highlights: [],
  redactions: [],
};
