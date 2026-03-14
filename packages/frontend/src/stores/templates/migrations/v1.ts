import { type V1StoredData } from "@/schemas/v1";
import { type V2StoredData } from "@/schemas/v2";
import { type HiddenHeaders } from "@/types";

function normalizeHeaders(headers: string[] | HiddenHeaders): HiddenHeaders {
  if (Array.isArray(headers)) {
    return { both: headers, request: [], response: [] };
  }

  return headers;
}

export function fromV1(data: V1StoredData): V2StoredData {
  return {
    version: 2,
    templates: data.templates.map((t) => ({
      ...t,
      settings: {
        ...t.settings,
        headersToHide: normalizeHeaders(t.settings.headersToHide),
        headersToShow: { both: [], request: [], response: [] },
      },
    })),
    defaultTemplateId: data.defaultTemplateId,
  };
}
