import { parseStoredSettings } from "./parse";
import { StoredDataSchema } from "./schemas";

import { type StoredData, type Template } from "@/types";

function migrateTemplates(data: StoredData): StoredData {
  return {
    ...data,
    templates: data.templates.map((t) => ({
      ...t,
      settings: parseStoredSettings(t.settings),
    })),
  };
}

export function migrateStorage(stored: unknown): StoredData {
  const result = StoredDataSchema.safeParse(stored);

  if (result.success) {
    return migrateTemplates(result.data);
  }

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
