import { fromV0 } from "./v0";
import { fromV1 } from "./v1";
import { fromV2 } from "./v2";

import {
  V0SettingsSchema,
  V1StoredDataSchema,
  V2StoredDataSchema,
  V3StoredDataSchema,
} from "@/schemas";
import { DEFAULT_SETTINGS, type StoredData } from "@/types";

type MigrationResult = {
  data: StoredData;
  migrated: boolean;
};

function createDefault(): StoredData {
  const id = crypto.randomUUID();

  return {
    version: 3,
    templates: [{ id, name: "Default", settings: DEFAULT_SETTINGS }],
    defaultTemplateId: id,
  };
}

export function migrateStorage(stored: unknown): MigrationResult {
  const v3 = V3StoredDataSchema.safeParse(stored);
  if (v3.success) {
    return { data: v3.data, migrated: false };
  }

  const v2 = V2StoredDataSchema.safeParse(stored);
  if (v2.success) {
    return { data: fromV2(v2.data), migrated: true };
  }

  const v1 = V1StoredDataSchema.safeParse(stored);
  if (v1.success) {
    return { data: fromV2(fromV1(v1.data)), migrated: true };
  }

  const v0 = V0SettingsSchema.safeParse(stored);
  if (v0.success) {
    return { data: fromV2(fromV1(fromV0(v0.data))), migrated: true };
  }

  return { data: createDefault(), migrated: true };
}
