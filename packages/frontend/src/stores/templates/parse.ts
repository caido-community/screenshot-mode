import {
  DEFAULT_SETTINGS,
  Disposition,
  type HiddenHeaders,
  type ScreenshotSettings,
  WidthMode,
  type WidthSetting,
} from "@/types";

function parseWidthSetting(width: unknown): WidthSetting {
  if (width === undefined || width === null || typeof width !== "object") {
    return { mode: WidthMode.Full };
  }

  const data = width as Partial<WidthSetting>;

  if (data.mode === WidthMode.Pixel) {
    const pixelData = data as { mode: typeof WidthMode.Pixel; value?: number };
    return {
      mode: WidthMode.Pixel,
      value: typeof pixelData.value === "number" ? pixelData.value : 800,
    };
  }

  if (data.mode === WidthMode.A4) {
    return { mode: WidthMode.A4 };
  }

  if (data.mode === WidthMode.Letter) {
    return { mode: WidthMode.Letter };
  }

  return { mode: WidthMode.Full };
}

function parseHiddenHeaders(data: unknown): HiddenHeaders {
  if (Array.isArray(data)) {
    return { both: data, request: [], response: [] };
  }

  if (data !== undefined && data !== null && typeof data === "object") {
    const obj = data as Partial<HiddenHeaders>;
    return {
      both: Array.isArray(obj.both) ? obj.both : [],
      request: Array.isArray(obj.request) ? obj.request : [],
      response: Array.isArray(obj.response) ? obj.response : [],
    };
  }

  return DEFAULT_SETTINGS.headersToHide;
}

function parseRedactions(
  redactions: unknown,
): ScreenshotSettings["redactions"] {
  if (!Array.isArray(redactions)) {
    return [];
  }

  return redactions.map((r) => {
    const selectedGroups = Array.isArray(r.selectedGroups)
      ? r.selectedGroups
      : [];
    const useCaptureGroups =
      typeof r.useCaptureGroups === "boolean"
        ? r.useCaptureGroups
        : selectedGroups.length > 0;

    const base = {
      ...r,
      useCaptureGroups,
      selectedGroups,
    };

    if (r.mode === "replace" && typeof r.replacementText !== "string") {
      return { ...base, replacementText: "[REDACTED]" };
    }

    return base;
  });
}

export function parseStoredSettings(stored: unknown): ScreenshotSettings {
  if (stored === undefined || stored === null || typeof stored !== "object") {
    return { ...DEFAULT_SETTINGS };
  }

  const data = stored as Record<string, unknown>;

  return {
    headersToHide: parseHiddenHeaders(data.headersToHide),
    disposition:
      data.disposition === Disposition.Vertical
        ? Disposition.Vertical
        : Disposition.Horizontal,
    width: parseWidthSetting(data.width),
    highlights: Array.isArray(data.highlights) ? data.highlights : [],
    redactions: parseRedactions(data.redactions),
  };
}
