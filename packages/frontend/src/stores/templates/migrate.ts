import { parseStoredSettings } from "./parse";

import { type StoredData, type Template } from "@/types";

export function isStoredData(stored: unknown): stored is StoredData {
  if (stored === undefined || stored === null || typeof stored !== "object") {
    return false;
  }

  const data = stored as Partial<StoredData>;
  return (
    typeof data.version === "number" &&
    Array.isArray(data.templates) &&
    typeof data.defaultTemplateId === "string"
  );
}

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
  if (isStoredData(stored)) {
    return migrateTemplates(stored);
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
