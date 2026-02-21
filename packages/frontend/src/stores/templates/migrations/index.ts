import { migrateFromV0 } from "./v0";
import { migrateFromV1 } from "./v1";

import { type StoredData } from "@/types";

type MigrationResult = {
  data: StoredData;
  migrated: boolean;
};

export function migrateStorage(stored: unknown): MigrationResult {
  const v1 = migrateFromV1(stored);
  if (v1 !== undefined) {
    return { data: v1, migrated: false };
  }

  return { data: migrateFromV0(stored), migrated: true };
}
