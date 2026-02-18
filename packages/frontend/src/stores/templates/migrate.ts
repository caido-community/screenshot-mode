import { type z } from "zod";

import {
  legacySettingsSchema,
  screenshotSettingsV2Schema,
  storedDataV1Schema,
  type StoredDataV2,
  storedDataV2Schema,
} from "./schemas";

import { DEFAULT_SETTINGS, type StoredData, type Template } from "@/types";

function migrateV1toV2(data: z.infer<typeof storedDataV1Schema>): StoredDataV2 {
  return {
    version: 2,
    defaultTemplateId: data.defaultTemplateId,
    templates: data.templates.map((t) => ({
      id: t.id,
      name: t.name,
      settings: screenshotSettingsV2Schema.parse(t.settings),
    })),
  };
}

function defaultStoredData(): StoredData {
  const defaultTemplate: Template = {
    id: crypto.randomUUID(),
    name: "Default",
    settings: { ...DEFAULT_SETTINGS },
  };
  return {
    version: 2,
    templates: [defaultTemplate],
    defaultTemplateId: defaultTemplate.id,
  };
}

export function migrateStorage(stored: unknown): StoredData {
  const v2Result = storedDataV2Schema.safeParse(stored);
  if (v2Result.success) {
    return v2Result.data;
  }

  const v1Result = storedDataV1Schema.safeParse(stored);
  if (v1Result.success) {
    return migrateV1toV2(v1Result.data);
  }

  const looksLikeVersioned =
    stored !== undefined &&
    stored !== null &&
    typeof stored === "object" &&
    "version" in stored &&
    ((stored as Record<string, unknown>).version === 1 ||
      (stored as Record<string, unknown>).version === 2);
  if (looksLikeVersioned) {
    return defaultStoredData();
  }

  const legacyResult = legacySettingsSchema.safeParse(stored);
  if (legacyResult.success) {
    const defaultTemplate: Template = {
      id: crypto.randomUUID(),
      name: "Default",
      settings: screenshotSettingsV2Schema.parse(legacyResult.data),
    };
    return {
      version: 2,
      templates: [defaultTemplate],
      defaultTemplateId: defaultTemplate.id,
    };
  }

  return defaultStoredData();
}
