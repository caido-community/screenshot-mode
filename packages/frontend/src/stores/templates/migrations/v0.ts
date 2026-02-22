import { type V0Settings } from "@/schemas/v0";
import { type V1StoredData } from "@/schemas/v1";

export function fromV0(settings: V0Settings): V1StoredData {
  const id = crypto.randomUUID();

  return {
    version: 1,
    templates: [{ id, name: "Default", settings }],
    defaultTemplateId: id,
  };
}
