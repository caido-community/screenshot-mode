import { type V2StoredData } from "@/schemas/v2";
import { MatchMode, type StoredData } from "@/types";

export function fromV2(data: V2StoredData): StoredData {
  return {
    version: 3,
    templates: data.templates.map((t) => ({
      ...t,
      settings: {
        ...t.settings,
        highlights: t.settings.highlights.map((h) => ({
          ...h,
          matchMode: MatchMode.Regex,
        })),
        redactions: t.settings.redactions.map((r) => ({
          ...r,
          matchMode: MatchMode.Regex,
        })),
      },
    })),
    defaultTemplateId: data.defaultTemplateId,
  };
}
