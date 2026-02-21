import { parseStoredSettings } from "../parse";

import { type StoredData, type Template } from "@/types";

export function migrateFromV0(stored: unknown): StoredData {
  const settings = parseStoredSettings(stored);

  const defaultTemplate: Template = {
    id: crypto.randomUUID(),
    name: "Default",
    settings,
  };

  return {
    version: 1,
    templates: [defaultTemplate],
    defaultTemplateId: defaultTemplate.id,
  };
}
