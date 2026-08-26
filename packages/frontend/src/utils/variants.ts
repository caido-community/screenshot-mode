import { Alteration, type Variant } from "@/types";

const ALTERATION_ORDER = [
  Alteration.None,
  Alteration.Tamper,
  Alteration.Manual,
];

export function toVariants(current: Variant, edits: Variant[]): Variant[] {
  const byId = new Map<string, Variant>();
  for (const { id, alteration } of [current, ...edits]) {
    byId.set(id, { id, alteration });
  }

  return [...byId.values()].sort(
    (a, b) =>
      ALTERATION_ORDER.indexOf(a.alteration) -
      ALTERATION_ORDER.indexOf(b.alteration),
  );
}
