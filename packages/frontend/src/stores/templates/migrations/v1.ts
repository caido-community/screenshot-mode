import { StoredDataSchema } from "@/schemas";
import { type StoredData } from "@/types";

export function migrateFromV1(stored: unknown): StoredData | undefined {
  const result = StoredDataSchema.safeParse(stored);

  if (result.success) {
    return result.data;
  }

  return undefined;
}
