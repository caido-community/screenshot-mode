import { type Caido } from "@caido/sdk-frontend";

export type FrontendSDK = Caido<Record<string, never>, Record<string, never>>;

export const HighlightMode = {
  Highlight: "highlight",
  Rectangle: "rectangle",
} as const;
export type HighlightMode = (typeof HighlightMode)[keyof typeof HighlightMode];

export const RedactionMode = {
  Blur: "blur",
  Opaque: "opaque",
  Replace: "replace",
} as const;
export type RedactionMode = (typeof RedactionMode)[keyof typeof RedactionMode];

export const RuleTarget = {
  Request: "request",
  Response: "response",
} as const;
export type RuleTarget = (typeof RuleTarget)[keyof typeof RuleTarget];

export const Disposition = {
  Horizontal: "horizontal",
  Vertical: "vertical",
} as const;
export type Disposition = (typeof Disposition)[keyof typeof Disposition];

export const WidthMode = {
  Full: "full",
  Pixel: "pixel",
  A4: "a4",
  Letter: "letter",
} as const;
export type WidthMode = (typeof WidthMode)[keyof typeof WidthMode];

export type WidthSetting =
  | { mode: typeof WidthMode.Pixel; value: number }
  | { mode: typeof WidthMode.Full }
  | { mode: typeof WidthMode.A4 }
  | { mode: typeof WidthMode.Letter };

export type HighlightRule = {
  id: string;
  regex: string;
  target: RuleTarget;
  color: string;
  mode: HighlightMode;
};

type RedactionRuleBase = {
  id: string;
  regex: string;
  target: RuleTarget;
  useCaptureGroups: boolean;
  selectedGroups: number[];
};

export type RedactionRule = RedactionRuleBase &
  (
    | { mode: typeof RedactionMode.Opaque; color: string }
    | { mode: typeof RedactionMode.Blur }
    | { mode: typeof RedactionMode.Replace; replacementText: string }
  );

export type ScreenshotSettings = {
  headersToHide: string[];
  disposition: Disposition;
  width: WidthSetting;
  highlights: HighlightRule[];
  redactions: RedactionRule[];
};

export type StoredSettings = {
  headersToHide: string[];
  disposition: Disposition;
  width: WidthSetting;
  highlights: HighlightRule[];
  redactions: RedactionRule[];
};

export type Template = {
  id: string;
  name: string;
  settings: ScreenshotSettings;
};

export type StoredData = {
  version: number;
  templates: Template[];
  defaultTemplateId: string;
};

const DEFAULT_HEADERS_TO_HIDE = [
  "Accept",
  "Accept-Encoding",
  "Accept-Language",
  "Cache-Control",
  "CF-Cache-Status",
  "CF-RAY",
  "Connection",
  "Content-Length",
  "Date",
  "ETag",
  "Expires",
  "Last-Modified",
  "NEL",
  "Pragma",
  "Priority",
  "Report-To",
  "Sec-CH-UA",
  "Sec-CH-UA-Mobile",
  "Sec-CH-UA-Platform",
  "Sec-Fetch-Dest",
  "Sec-Fetch-Mode",
  "Sec-Fetch-Site",
  "Sec-Fetch-User",
  "Server-Timing",
  "Strict-Transport-Security",
  "Upgrade-Insecure-Requests",
  "Vary",
  "Via",
  "X-Amz-Cf-Id",
  "X-Amz-Cf-Pop",
  "X-Amz-Id-2",
  "X-Amz-Request-Id",
  "X-Cache",
  "X-Content-Type-Options",
  "X-Frame-Options",
  "X-Request-Id",
  "X-Served-By",
  "X-Timer",
  "X-XSS-Protection",
];

export const DEFAULT_SETTINGS: ScreenshotSettings = {
  headersToHide: DEFAULT_HEADERS_TO_HIDE,
  disposition: Disposition.Horizontal,
  width: { mode: WidthMode.Full },
  highlights: [],
  redactions: [],
};
