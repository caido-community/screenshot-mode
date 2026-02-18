import { z } from "zod";

const dispositionSchema = z.enum(["horizontal", "vertical"]);
const widthModeSchema = z.enum(["full", "pixel", "a4", "letter"]);
const ruleTargetSchema = z.enum(["request", "response"]);
const highlightModeSchema = z.enum(["highlight", "rectangle"]);
const redactionModeSchema = z.enum(["blur", "opaque", "replace"]);

const hiddenHeadersSchema = z.object({
  both: z.array(z.string()),
  request: z.array(z.string()),
  response: z.array(z.string()),
});

const widthSettingSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("pixel"), value: z.number().default(800) }),
  z.object({ mode: z.literal("full") }),
  z.object({ mode: z.literal("a4") }),
  z.object({ mode: z.literal("letter") }),
]);

const highlightRuleSchema = z.object({
  id: z.string(),
  regex: z.string(),
  target: ruleTargetSchema,
  color: z.string(),
  mode: highlightModeSchema,
});

const redactionRuleSchema = z.discriminatedUnion("mode", [
  z.object({
    id: z.string(),
    regex: z.string(),
    target: ruleTargetSchema,
    useCaptureGroups: z.boolean(),
    selectedGroups: z.array(z.number()),
    mode: z.literal("opaque"),
    color: z.string(),
  }),
  z.object({
    id: z.string(),
    regex: z.string(),
    target: ruleTargetSchema,
    useCaptureGroups: z.boolean(),
    selectedGroups: z.array(z.number()),
    mode: z.literal("blur"),
  }),
  z.object({
    id: z.string(),
    regex: z.string(),
    target: ruleTargetSchema,
    useCaptureGroups: z.boolean(),
    selectedGroups: z.array(z.number()),
    mode: z.literal("replace"),
    replacementText: z.string().default("[REDACTED]"),
  }),
]);

export const screenshotSettingsV2Schema = z.object({
  headersToHide: hiddenHeadersSchema,
  disposition: dispositionSchema.default("horizontal"),
  width: widthSettingSchema.default({ mode: "full" }),
  highlights: z.array(highlightRuleSchema).default([]),
  redactions: z.array(redactionRuleSchema).default([]),
});

const templateV2Schema = z.object({
  id: z.string(),
  name: z.string(),
  settings: screenshotSettingsV2Schema,
});

export const storedDataV2Schema = z.object({
  version: z.literal(2),
  templates: z.array(templateV2Schema),
  defaultTemplateId: z.string(),
});

const hiddenHeadersV1Schema = z.union([
  z.array(z.string()).transform((arr) => ({
    both: arr,
    request: [] as string[],
    response: [] as string[],
  })),
  z
    .object({
      both: z.array(z.string()).optional(),
      request: z.array(z.string()).optional(),
      response: z.array(z.string()).optional(),
    })
    .transform((o) => ({
      both: o.both ?? [],
      request: o.request ?? [],
      response: o.response ?? [],
    })),
]);

const widthSettingV1Schema = z
  .object({
    mode: widthModeSchema.optional(),
    value: z.number().optional(),
  })
  .transform((w) => {
    if (w.mode === "pixel") {
      return {
        mode: "pixel" as const,
        value: typeof w.value === "number" ? w.value : 800,
      };
    }
    if (w.mode === "a4") return { mode: "a4" as const };
    if (w.mode === "letter") return { mode: "letter" as const };
    return { mode: "full" as const };
  });

const redactionRuleV1Schema = z
  .object({
    id: z.string().optional(),
    regex: z.string().optional(),
    target: ruleTargetSchema.optional(),
    useCaptureGroups: z.boolean().optional(),
    selectedGroups: z.array(z.number()).optional(),
    mode: redactionModeSchema.optional(),
    color: z.string().optional(),
    replacementText: z.string().optional(),
  })
  .passthrough()
  .transform((r) => {
    const selectedGroups = Array.isArray(r.selectedGroups)
      ? r.selectedGroups
      : [];
    const useCaptureGroups =
      typeof r.useCaptureGroups === "boolean"
        ? r.useCaptureGroups
        : selectedGroups.length > 0;
    const base = {
      id: typeof r.id === "string" ? r.id : "",
      regex: typeof r.regex === "string" ? r.regex : "",
      target: ruleTargetSchema.safeParse(r.target).success
        ? r.target
        : ("request" as const),
      useCaptureGroups,
      selectedGroups,
    };
    if (r.mode === "opaque") {
      return {
        ...base,
        mode: "opaque" as const,
        color: typeof r.color === "string" ? r.color : "#000",
      };
    }
    if (r.mode === "replace") {
      return {
        ...base,
        mode: "replace" as const,
        replacementText:
          typeof r.replacementText === "string"
            ? r.replacementText
            : "[REDACTED]",
      };
    }
    return { ...base, mode: "blur" as const };
  });

const screenshotSettingsV1Schema = z
  .object({
    headersToHide: hiddenHeadersV1Schema.optional(),
    disposition: dispositionSchema.optional(),
    width: widthSettingV1Schema.optional(),
    highlights: z.array(z.unknown()).optional(),
    redactions: z.array(redactionRuleV1Schema).optional(),
  })
  .passthrough()
  .transform((s) => ({
    headersToHide:
      s.headersToHide !== undefined
        ? s.headersToHide
        : { both: [], request: [], response: [] },
    disposition: s.disposition === "vertical" ? "vertical" : "horizontal",
    width: s.width !== undefined ? s.width : { mode: "full" },
    highlights: Array.isArray(s.highlights)
      ? s.highlights
          .filter((h) => highlightRuleSchema.safeParse(h).success)
          .map((h) => highlightRuleSchema.parse(h))
      : [],
    redactions: Array.isArray(s.redactions)
      ? s.redactions.map((r) => redactionRuleSchema.parse(r))
      : [],
  }));

const templateV1Schema = z.object({
  id: z.string(),
  name: z.string(),
  settings: screenshotSettingsV1Schema
    .optional()
    .transform((s) =>
      s !== undefined ? s : screenshotSettingsV1Schema.parse({}),
    ),
});

export const storedDataV1Schema = z.object({
  version: z.literal(1),
  templates: z.array(templateV1Schema),
  defaultTemplateId: z.string(),
});

export const legacySettingsSchema = z
  .object({
    headersToHide: hiddenHeadersV1Schema.optional(),
    disposition: dispositionSchema.optional(),
    width: widthSettingV1Schema.optional(),
    highlights: z.array(z.unknown()).optional(),
    redactions: z.array(redactionRuleV1Schema).optional(),
  })
  .passthrough()
  .transform((s) => screenshotSettingsV1Schema.parse(s));

export type StoredDataV2 = z.infer<typeof storedDataV2Schema>;
