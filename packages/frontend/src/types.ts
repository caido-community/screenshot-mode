import { type Caido } from "@caido/sdk-frontend";
import { type z } from "zod";

import {
  type HiddenHeadersSchema,
  type HighlightRuleSchema,
  type RedactionRuleSchema,
  type V3SettingsSchema,
  type V3StoredDataSchema,
  type V3TemplateSchema,
  type WidthSettingSchema,
} from "@/schemas";

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

export const MatchMode = {
  Regex: "regex",
  String: "string",
} as const;
export type MatchMode = (typeof MatchMode)[keyof typeof MatchMode];

export const RuleTarget = {
  Request: "request",
  Response: "response",
} as const;
export type RuleTarget = (typeof RuleTarget)[keyof typeof RuleTarget];

export const HeaderHideTarget = {
  Both: "both",
  Request: "request",
  Response: "response",
} as const;
export type HeaderHideTarget =
  (typeof HeaderHideTarget)[keyof typeof HeaderHideTarget];

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

// --- Inferred Types ---

export type HiddenHeaders = z.infer<typeof HiddenHeadersSchema>;
export type WidthSetting = z.infer<typeof WidthSettingSchema>;
export type HighlightRule = z.infer<typeof HighlightRuleSchema>;
export type RedactionRule = z.infer<typeof RedactionRuleSchema>;
export type ScreenshotSettings = z.infer<typeof V3SettingsSchema>;
export type Template = z.infer<typeof V3TemplateSchema>;
export type StoredData = z.infer<typeof V3StoredDataSchema>;

// --- Defaults ---

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
  headersToHide: {
    both: DEFAULT_HEADERS_TO_HIDE,
    request: [],
    response: [],
  },
  disposition: Disposition.Horizontal,
  width: { mode: WidthMode.Full },
  highlights: [],
  redactions: [],
};
