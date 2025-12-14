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

export const DEFAULT_HEADERS_TO_HIDE = [
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
  disposition: "horizontal",
  highlights: [],
  redactions: [],
};
